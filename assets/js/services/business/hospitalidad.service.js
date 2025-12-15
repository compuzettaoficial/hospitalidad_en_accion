/**
 * ============================================
 * HOSPITALIDAD.SERVICE.JS - Lógica de Hospitalidad
 * ============================================
 * Funciones de alto nivel para el sistema de hospitalidad
 */

const HospitalidadService = {
  
  // ============================================
  // INFORMACIÓN DE EVENTO
  // ============================================
  
  /**
   * Obtener información completa de hospitalidad de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>}
   */
  async getInfoEvento(eventoId) {
    try {
      // Obtener evento
      const evento = await EventosAPI.getEventoById(eventoId);
      if (!evento) {
        throw new Error('Evento no encontrado');
      }
      
      // Obtener postulaciones
      const postulaciones = await PostulacionesService.getByEvento(eventoId);
      
      // Obtener emparejamientos
      const emparejamientos = await this.getEmparejamientosByEvento(eventoId);
      
      // Calcular estadísticas
      const stats = await PostulacionesService.getEstadisticasEvento(eventoId);
      
      return {
        evento,
        postulaciones: {
          visitantes: postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.VISITANTE),
          anfitriones: postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION)
        },
        emparejamientos,
        estadisticas: stats
      };
      
    } catch (error) {
      console.error('Error obteniendo info de hospitalidad:', error);
      throw error;
    }
  },
  
  /**
   * Verificar si un usuario puede postular a un evento
   * @param {string} usuarioId - ID del usuario
   * @param {string} eventoId - ID del evento
   * @param {string} tipo - Tipo de postulación
   * @returns {Promise<Object>}
   */
  async canPostular(usuarioId, eventoId, tipo) {
    try {
      // Verificar que el usuario existe y está activo
      const usuario = await UsuariosService.getByUid(usuarioId);
      if (!usuario || !usuario.activo) {
        return {
          puede: false,
          razon: 'Usuario no encontrado o inactivo'
        };
      }
      
      // Verificar que el evento existe y está activo
      const evento = await EventosAPI.getEventoById(eventoId);
      if (!evento || evento.estado !== 'activo') {
        return {
          puede: false,
          razon: 'Evento no disponible'
        };
      }
      
      // Verificar que la hospitalidad está habilitada
      if (!evento.hospitalidad?.habilitada) {
        return {
          puede: false,
          razon: 'La hospitalidad no está habilitada para este evento'
        };
      }
      
      // Verificar que no tenga postulación activa
      const postulaciones = await PostulacionesService.getByUsuarioEvento(
        usuarioId,
        eventoId,
        tipo
      );
      
      const activa = postulaciones.find(p => 
        p.estado === CONSTANTS.ESTADOS.PENDIENTE ||
        p.estado === CONSTANTS.ESTADOS.APROBADO ||
        p.estado === CONSTANTS.ESTADOS.EMPAREJADO
      );
      
      if (activa) {
        return {
          puede: false,
          razon: 'Ya tienes una postulación activa para este evento'
        };
      }
      
      // Verificar fechas del evento
      const fechaInicio = new Date(evento.fechaInicio);
      const hoy = new Date();
      
      if (fechaInicio < hoy) {
        return {
          puede: false,
          razon: 'El evento ya ha comenzado'
        };
      }
      
      return {
        puede: true,
        razon: null
      };
      
    } catch (error) {
      console.error('Error verificando si puede postular:', error);
      return {
        puede: false,
        razon: 'Error al verificar permisos'
      };
    }
  },
  
  // ============================================
  // EMPAREJAMIENTOS
  // ============================================
  
  /**
   * Obtener emparejamientos de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Array>}
   */
  async getEmparejamientosByEvento(eventoId) {
    try {
      const filters = [['eventoId', '==', eventoId]];
      
      return await FirestoreService.query(
        CONSTANTS.COLLECTIONS.EMPAREJAMIENTOS,
        filters,
        { orderBy: 'fechaAsignacion', orderDirection: 'desc' }
      );
      
    } catch (error) {
      console.error('Error obteniendo emparejamientos:', error);
      throw error;
    }
  },
  
  /**
   * Crear emparejamiento entre visitante y anfitrión
   * @param {string} visitanteId - ID de postulación visitante
   * @param {string} anfitrionId - ID de postulación anfitrión
   * @returns {Promise<Object>}
   */
  async crearEmparejamiento(visitanteId, anfitrionId) {
    try {
      // Obtener postulaciones
      const visitante = await PostulacionesService.getById(visitanteId);
      const anfitrion = await PostulacionesService.getById(anfitrionId);
      
      if (!visitante || !anfitrion) {
        throw new Error('Postulaciones no encontradas');
      }
      
      // Validar mismo evento
      if (visitante.eventoId !== anfitrion.eventoId) {
        throw new Error('Las postulaciones no son del mismo evento');
      }
      
      // Validar estados
      if (visitante.estado !== CONSTANTS.ESTADOS.APROBADO) {
        throw new Error('El visitante debe estar aprobado');
      }
      
      if (anfitrion.estado !== CONSTANTS.ESTADOS.APROBADO) {
        throw new Error('El anfitrión debe estar aprobado');
      }
      
      // Validar capacidad
      if (anfitrion.capacidadDisponible < visitante.numPersonas) {
        throw new Error('El anfitrión no tiene capacidad suficiente');
      }
      
      // Crear emparejamiento
      const emparejamiento = {
        eventoId: visitante.eventoId,
        visitanteId: visitanteId,
        anfitrionId: anfitrionId,
        visitanteUid: visitante.usuarioId,
        anfitrionUid: anfitrion.usuarioId,
        numPersonas: visitante.numPersonas,
        estado: 'activo',
        fechaAsignacion: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const result = await FirestoreService.create(
        CONSTANTS.COLLECTIONS.EMPAREJAMIENTOS,
        emparejamiento
      );
      
      // Actualizar estados de postulaciones
      await PostulacionesService.cambiarEstado(
        visitanteId,
        CONSTANTS.ESTADOS.EMPAREJADO
      );
      
      await PostulacionesService.cambiarEstado(
        anfitrionId,
        CONSTANTS.ESTADOS.EMPAREJADO
      );
      
      // Actualizar capacidad del anfitrión
      await FirestoreService.update(
        CONSTANTS.COLLECTIONS.POSTULACIONES,
        anfitrionId,
        {
          capacidadDisponible: anfitrion.capacidadDisponible - visitante.numPersonas,
          visitantesAsignados: firebase.firestore.FieldValue.arrayUnion(visitanteId)
        }
      );
      
      Notify.success('Emparejamiento creado exitosamente');
      
      return result;
      
    } catch (error) {
      console.error('Error creando emparejamiento:', error);
      Notify.error(error.message || 'Error al crear emparejamiento');
      throw error;
    }
  },
  
  /**
   * Cancelar emparejamiento
   * @param {string} emparejamientoId - ID del emparejamiento
   * @returns {Promise<Object>}
   */
  async cancelarEmparejamiento(emparejamientoId) {
    try {
      const emparejamiento = await FirestoreService.getById(
        CONSTANTS.COLLECTIONS.EMPAREJAMIENTOS,
        emparejamientoId
      );
      
      if (!emparejamiento) {
        throw new Error('Emparejamiento no encontrado');
      }
      
      // Actualizar estado del emparejamiento
      await FirestoreService.update(
        CONSTANTS.COLLECTIONS.EMPAREJAMIENTOS,
        emparejamientoId,
        {
          estado: 'cancelado',
          fechaCancelacion: firebase.firestore.FieldValue.serverTimestamp()
        }
      );
      
      // Revertir estados de postulaciones
      await PostulacionesService.cambiarEstado(
        emparejamiento.visitanteId,
        CONSTANTS.ESTADOS.APROBADO
      );
      
      await PostulacionesService.cambiarEstado(
        emparejamiento.anfitrionId,
        CONSTANTS.ESTADOS.APROBADO
      );
      
      // Restaurar capacidad del anfitrión
      const anfitrion = await PostulacionesService.getById(emparejamiento.anfitrionId);
      
      await FirestoreService.update(
        CONSTANTS.COLLECTIONS.POSTULACIONES,
        emparejamiento.anfitrionId,
        {
          capacidadDisponible: anfitrion.capacidadDisponible + emparejamiento.numPersonas,
          visitantesAsignados: firebase.firestore.FieldValue.arrayRemove(emparejamiento.visitanteId)
        }
      );
      
      Notify.success('Emparejamiento cancelado');
      
      return { success: true };
      
    } catch (error) {
      console.error('Error cancelando emparejamiento:', error);
      Notify.error(error.message || 'Error al cancelar emparejamiento');
      throw error;
    }
  },
  
  // ============================================
  // DASHBOARD USUARIO
  // ============================================
  
  /**
   * Obtener dashboard de hospitalidad del usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<Object>}
   */
  async getDashboardUsuario(usuarioId) {
    try {
      // Obtener postulaciones del usuario
      const postulaciones = await PostulacionesService.getByUsuario(usuarioId);
      
      // Obtener emparejamientos donde participa
      const emparejamientosVisitante = await FirestoreService.query(
        CONSTANTS.COLLECTIONS.EMPAREJAMIENTOS,
        [['visitanteUid', '==', usuarioId]]
      );
      
      const emparejamientosAnfitrion = await FirestoreService.query(
        CONSTANTS.COLLECTIONS.EMPAREJAMIENTOS,
        [['anfitrionUid', '==', usuarioId]]
      );
      
      // Separar por tipo
      const visitante = {
        postulaciones: postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.VISITANTE),
        emparejamientos: emparejamientosVisitante,
        activas: postulaciones.filter(p => 
          p.tipo === CONSTANTS.TIPOS_POSTULACION.VISITANTE &&
          (p.estado === CONSTANTS.ESTADOS.PENDIENTE || p.estado === CONSTANTS.ESTADOS.APROBADO || p.estado === CONSTANTS.ESTADOS.EMPAREJADO)
        )
      };
      
      const anfitrion = {
        postulaciones: postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION),
        emparejamientos: emparejamientosAnfitrion,
        activas: postulaciones.filter(p => 
          p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION &&
          (p.estado === CONSTANTS.ESTADOS.PENDIENTE || p.estado === CONSTANTS.ESTADOS.APROBADO || p.estado === CONSTANTS.ESTADOS.EMPAREJADO)
        )
      };
      
      return {
        visitante,
        anfitrion,
        totalPostulaciones: postulaciones.length,
        totalEmparejamientos: emparejamientosVisitante.length + emparejamientosAnfitrion.length
      };
      
    } catch (error) {
      console.error('Error obteniendo dashboard:', error);
      throw error;
    }
  },
  
  // ============================================
  // VALIDACIONES
  // ============================================
  
  /**
   * Validar compatibilidad entre visitante y anfitrión
   * @param {Object} visitante - Postulación visitante
   * @param {Object} anfitrion - Postulación anfitrión
   * @returns {Object}
   */
  validarCompatibilidad(visitante, anfitrion) {
    const problemas = [];
    const advertencias = [];
    
    // Mismo evento
    if (visitante.eventoId !== anfitrion.eventoId) {
      problemas.push('No son del mismo evento');
      return { compatible: false, problemas, advertencias };
    }
    
    // Capacidad
    if (anfitrion.capacidadDisponible < visitante.numPersonas) {
      problemas.push(`Capacidad insuficiente (necesita ${visitante.numPersonas}, disponible ${anfitrion.capacidadDisponible})`);
    }
    
    // Género
    if (anfitrion.generoAcepta !== 'ambos') {
      if (visitante.genero !== anfitrion.generoAcepta && visitante.genero !== 'mixto') {
        advertencias.push('Posible incompatibilidad de género');
      }
    }
    
    // Niños
    if (visitante.edades?.some(e => e < 12) && !anfitrion.aceptaNinos) {
      advertencias.push('El anfitrión no acepta niños');
    }
    
    // Fechas
    const llegada = new Date(visitante.fechaLlegada);
    const salida = new Date(visitante.fechaSalida);
    const disponibleDesde = new Date(anfitrion.fechaDisponibleDesde);
    const disponibleHasta = new Date(anfitrion.fechaDisponibleHasta);
    
    if (llegada < disponibleDesde || salida > disponibleHasta) {
      advertencias.push('Las fechas no coinciden completamente');
    }
    
    return {
      compatible: problemas.length === 0,
      problemas,
      advertencias
    };
  },
  
  // ============================================
  // NOTIFICACIONES
  // ============================================
  
  /**
   * Notificar sobre nueva postulación
   * @param {string} postulacionId - ID de la postulación
   */
  async notificarNuevaPostulacion(postulacionId) {
    // TODO: Implementar sistema de notificaciones
    console.log('📧 Notificación: Nueva postulación', postulacionId);
  },
  
  /**
   * Notificar emparejamiento
   * @param {string} emparejamientoId - ID del emparejamiento
   */
  async notificarEmparejamiento(emparejamientoId) {
    // TODO: Implementar sistema de notificaciones
    console.log('📧 Notificación: Nuevo emparejamiento', emparejamientoId);
  }
};

// Exportar globalmente
window.HospitalidadService = HospitalidadService;

console.log('✅ hospitalidad.service.js cargado correctamente');
