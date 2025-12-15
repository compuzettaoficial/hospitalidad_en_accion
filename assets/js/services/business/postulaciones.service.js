
/**
 * ============================================
 * POSTULACIONES.SERVICE.JS - Gestión de Postulaciones
 * ============================================
 * Manejo de postulaciones de visitantes y anfitriones
 */

const PostulacionesService = {
  
  COLLECTION: CONSTANTS.COLLECTIONS.POSTULACIONES,
  
  // ============================================
  // CREAR POSTULACIONES
  // ============================================
  
  /**
   * Postular como visitante
   * @param {Object} data - Datos de la postulación
   * @returns {Promise<Object>}
   */
  async postularVisitante(data) {
    try {
      // Validar usuario autenticado
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('Debes iniciar sesión para postular');
      }
      
      // Validar datos requeridos
      if (!data.eventoId) {
        throw new Error('Evento es obligatorio');
      }
      
      if (!data.fechaLlegada || !data.fechaSalida) {
        throw new Error('Fechas de llegada y salida son obligatorias');
      }
      
      if (!data.numPersonas || data.numPersonas < 1) {
        throw new Error('Número de personas inválido');
      }
      
      // Validar que no tenga postulación pendiente para este evento
      const existente = await this.getByUsuarioEvento(user.uid, data.eventoId, CONSTANTS.TIPOS_POSTULACION.VISITANTE);
      if (existente.length > 0) {
        const pendiente = existente.find(p => 
          p.estado === CONSTANTS.ESTADOS.PENDIENTE || 
          p.estado === CONSTANTS.ESTADOS.APROBADO ||
          p.estado === CONSTANTS.ESTADOS.EMPAREJADO
        );
        
        if (pendiente) {
          throw new Error('Ya tienes una postulación activa para este evento');
        }
      }
      
      // Crear postulación
      const postulacion = {
        tipo: CONSTANTS.TIPOS_POSTULACION.VISITANTE,
        eventoId: data.eventoId,
        usuarioId: user.uid,
        estado: CONSTANTS.ESTADOS.PENDIENTE,
        
        // Datos del visitante
        numPersonas: parseInt(data.numPersonas),
        edades: data.edades || [],
        genero: data.genero || 'mixto',
        fechaLlegada: data.fechaLlegada,
        fechaSalida: data.fechaSalida,
        
        // Preferencias
        necesidades: data.necesidades || '',
        preferencias: data.preferencias || {},
        
        // Metadata
        fechaPostulacion: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      const result = await FirestoreService.create(this.COLLECTION, postulacion);
      
      Notify.success('Postulación enviada correctamente');
      
      return result;
      
    } catch (error) {
      console.error('Error postulando como visitante:', error);
      Notify.error(error.message || 'Error al enviar postulación');
      throw error;
    }
  },
  
  /**
   * Postular como anfitrión
   * @param {Object} data - Datos de la postulación
   * @returns {Promise<Object>}
   */
  async postularAnfitrion(data) {
    try {
      // Validar usuario autenticado
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('Debes iniciar sesión para postular');
      }
      
      // Validar datos requeridos
      if (!data.eventoId) {
        throw new Error('Evento es obligatorio');
      }
      
      if (!data.capacidad || data.capacidad < 1) {
        throw new Error('Capacidad inválida');
      }
      
      if (!data.direccion) {
        throw new Error('Dirección es obligatoria');
      }
      
      // Validar que no tenga postulación pendiente para este evento
      const existente = await this.getByUsuarioEvento(user.uid, data.eventoId, CONSTANTS.TIPOS_POSTULACION.ANFITRION);
      if (existente.length > 0) {
        const activa = existente.find(p => 
          p.estado === CONSTANTS.ESTADOS.PENDIENTE || 
          p.estado === CONSTANTS.ESTADOS.APROBADO
        );
        
        if (activa) {
          throw new Error('Ya tienes una postulación activa como anfitrión para este evento');
        }
      }
      
      // Crear postulación
      const postulacion = {
        tipo: CONSTANTS.TIPOS_POSTULACION.ANFITRION,
        eventoId: data.eventoId,
        usuarioId: user.uid,
        estado: CONSTANTS.ESTADOS.PENDIENTE,
        
        // Datos del anfitrión
        capacidad: parseInt(data.capacidad),
        capacidadDisponible: parseInt(data.capacidad),
        direccion: data.direccion,
        referencia: data.referencia || '',
        distanciaEvento: data.distanciaEvento || null,
        
        // Características del hospedaje
        generoAcepta: data.generoAcepta || 'ambos',
        aceptaNinos: data.aceptaNinos || false,
        aceptaMascotas: data.aceptaMascotas || false,
        
        // Comodidades
        comodidades: data.comodidades || [],
        restricciones: data.restricciones || '',
        
        // Disponibilidad
        fechaDisponibleDesde: data.fechaDisponibleDesde,
        fechaDisponibleHasta: data.fechaDisponibleHasta,
        
        // Metadata
        fechaPostulacion: firebase.firestore.FieldValue.serverTimestamp(),
        visitantesAsignados: []
      };
      
      const result = await FirestoreService.create(this.COLLECTION, postulacion);
      
      Notify.success('Postulación enviada correctamente');
      
      return result;
      
    } catch (error) {
      console.error('Error postulando como anfitrión:', error);
      Notify.error(error.message || 'Error al enviar postulación');
      throw error;
    }
  },
  
  // ============================================
  // CONSULTAR POSTULACIONES
  // ============================================
  
  /**
   * Obtener postulación por ID
   * @param {string} id - ID de la postulación
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    try {
      return await FirestoreService.getById(this.COLLECTION, id);
    } catch (error) {
      console.error('Error obteniendo postulación:', error);
      throw error;
    }
  },
  
  /**
   * Obtener postulaciones de un usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<Array>}
   */
  async getByUsuario(usuarioId) {
    try {
      const filters = [['usuarioId', '==', usuarioId]];
      const options = {
        orderBy: 'fechaPostulacion',
        orderDirection: 'desc'
      };
      
      return await FirestoreService.query(this.COLLECTION, filters, options);
      
    } catch (error) {
      console.error('Error obteniendo postulaciones del usuario:', error);
      throw error;
    }
  },
  
  /**
   * Obtener postulaciones de un evento
   * @param {string} eventoId - ID del evento
   * @param {string} tipo - Tipo de postulación (opcional)
   * @returns {Promise<Array>}
   */
  async getByEvento(eventoId, tipo = null) {
    try {
      const filters = [['eventoId', '==', eventoId]];
      
      if (tipo) {
        filters.push(['tipo', '==', tipo]);
      }
      
      const options = {
        orderBy: 'fechaPostulacion',
        orderDirection: 'desc'
      };
      
      return await FirestoreService.query(this.COLLECTION, filters, options);
      
    } catch (error) {
      console.error('Error obteniendo postulaciones del evento:', error);
      throw error;
    }
  },
  
  /**
   * Obtener postulaciones de usuario para un evento
   * @param {string} usuarioId - ID del usuario
   * @param {string} eventoId - ID del evento
   * @param {string} tipo - Tipo de postulación
   * @returns {Promise<Array>}
   */
  async getByUsuarioEvento(usuarioId, eventoId, tipo) {
    try {
      const filters = [
        ['usuarioId', '==', usuarioId],
        ['eventoId', '==', eventoId],
        ['tipo', '==', tipo]
      ];
      
      return await FirestoreService.query(this.COLLECTION, filters);
      
    } catch (error) {
      console.error('Error obteniendo postulaciones:', error);
      throw error;
    }
  },
  
  /**
   * Obtener postulaciones pendientes de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>}
   */
  async getPendientesByEvento(eventoId) {
    try {
      const filters = [
        ['eventoId', '==', eventoId],
        ['estado', '==', CONSTANTS.ESTADOS.PENDIENTE]
      ];
      
      const postulaciones = await FirestoreService.query(this.COLLECTION, filters);
      
      const visitantes = postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.VISITANTE);
      const anfitriones = postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION);
      
      return {
        visitantes,
        anfitriones,
        total: postulaciones.length
      };
      
    } catch (error) {
      console.error('Error obteniendo postulaciones pendientes:', error);
      throw error;
    }
  },
  
  // ============================================
  // ACTUALIZAR POSTULACIONES
  // ============================================
  
  /**
   * Cambiar estado de postulación
   * @param {string} id - ID de la postulación
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} observaciones - Observaciones opcionales
   * @returns {Promise<Object>}
   */
  async cambiarEstado(id, nuevoEstado, observaciones = '') {
    try {
      // Validar estado
      const estadosValidos = Object.values(CONSTANTS.ESTADOS);
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado inválido');
      }
      
      const updateData = {
        estado: nuevoEstado,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      if (observaciones) {
        updateData.observaciones = observaciones;
      }
      
      // Agregar timestamp específico según el estado
      if (nuevoEstado === CONSTANTS.ESTADOS.APROBADO) {
        updateData.fechaAprobacion = firebase.firestore.FieldValue.serverTimestamp();
      } else if (nuevoEstado === CONSTANTS.ESTADOS.EMPAREJADO) {
        updateData.fechaEmparejamiento = firebase.firestore.FieldValue.serverTimestamp();
      } else if (nuevoEstado === CONSTANTS.ESTADOS.RECHAZADO || nuevoEstado === CONSTANTS.ESTADOS.CANCELADO) {
        updateData.fechaCancelacion = firebase.firestore.FieldValue.serverTimestamp();
      }
      
      await FirestoreService.update(this.COLLECTION, id, updateData);
      
      const mensajes = {
        [CONSTANTS.ESTADOS.APROBADO]: 'Postulación aprobada',
        [CONSTANTS.ESTADOS.RECHAZADO]: 'Postulación rechazada',
        [CONSTANTS.ESTADOS.CANCELADO]: 'Postulación cancelada',
        [CONSTANTS.ESTADOS.EMPAREJADO]: 'Postulación emparejada'
      };
      
      Notify.success(mensajes[nuevoEstado] || 'Estado actualizado');
      
      return updateData;
      
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Notify.error(error.message || 'Error al cambiar estado');
      throw error;
    }
  },
  
  /**
   * Cancelar postulación (por el usuario)
   * @param {string} id - ID de la postulación
   * @returns {Promise<Object>}
   */
  async cancelar(id) {
    try {
      const postulacion = await this.getById(id);
      
      if (!postulacion) {
        throw new Error('Postulación no encontrada');
      }
      
      // Verificar que sea del usuario actual
      const user = firebase.auth().currentUser;
      if (postulacion.usuarioId !== user.uid) {
        throw new Error('No tienes permiso para cancelar esta postulación');
      }
      
      // Solo se puede cancelar si está pendiente o aprobada
      if (postulacion.estado !== CONSTANTS.ESTADOS.PENDIENTE && 
          postulacion.estado !== CONSTANTS.ESTADOS.APROBADO) {
        throw new Error('No se puede cancelar una postulación en este estado');
      }
      
      return await this.cambiarEstado(id, CONSTANTS.ESTADOS.CANCELADO);
      
    } catch (error) {
      console.error('Error cancelando postulación:', error);
      Notify.error(error.message || 'Error al cancelar postulación');
      throw error;
    }
  },
  
  // ============================================
  // ESTADÍSTICAS
  // ============================================
  
  /**
   * Obtener estadísticas de postulaciones de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>}
   */
  async getEstadisticasEvento(eventoId) {
    try {
      const postulaciones = await this.getByEvento(eventoId);
      
      const stats = {
        total: postulaciones.length,
        
        porTipo: {
          visitantes: postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.VISITANTE).length,
          anfitriones: postulaciones.filter(p => p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION).length
        },
        
        porEstado: {
          pendientes: postulaciones.filter(p => p.estado === CONSTANTS.ESTADOS.PENDIENTE).length,
          aprobadas: postulaciones.filter(p => p.estado === CONSTANTS.ESTADOS.APROBADO).length,
          emparejadas: postulaciones.filter(p => p.estado === CONSTANTS.ESTADOS.EMPAREJADO).length,
          rechazadas: postulaciones.filter(p => p.estado === CONSTANTS.ESTADOS.RECHAZADO).length,
          canceladas: postulaciones.filter(p => p.estado === CONSTANTS.ESTADOS.CANCELADO).length
        },
        
        capacidad: {
          totalVisitantes: this._calcularTotalPersonas(postulaciones, CONSTANTS.TIPOS_POSTULACION.VISITANTE),
          totalCapacidadAnfitriones: this._calcularCapacidadTotal(postulaciones),
          capacidadDisponible: this._calcularCapacidadDisponible(postulaciones)
        }
      };
      
      return stats;
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },
  
  /**
   * Calcular total de personas visitantes
   * @private
   */
  _calcularTotalPersonas(postulaciones, tipo) {
    return postulaciones
      .filter(p => p.tipo === tipo && p.estado !== CONSTANTS.ESTADOS.RECHAZADO && p.estado !== CONSTANTS.ESTADOS.CANCELADO)
      .reduce((sum, p) => sum + (p.numPersonas || 0), 0);
  },
  
  /**
   * Calcular capacidad total de anfitriones
   * @private
   */
  _calcularCapacidadTotal(postulaciones) {
    return postulaciones
      .filter(p => 
        p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION && 
        (p.estado === CONSTANTS.ESTADOS.APROBADO || p.estado === CONSTANTS.ESTADOS.EMPAREJADO)
      )
      .reduce((sum, p) => sum + (p.capacidad || 0), 0);
  },
  
  /**
   * Calcular capacidad disponible
   * @private
   */
  _calcularCapacidadDisponible(postulaciones) {
    return postulaciones
      .filter(p => 
        p.tipo === CONSTANTS.TIPOS_POSTULACION.ANFITRION && 
        p.estado === CONSTANTS.ESTADOS.APROBADO
      )
      .reduce((sum, p) => sum + (p.capacidadDisponible || 0), 0);
  },
  
  // ============================================
  // LISTENERS
  // ============================================
  
  /**
   * Escuchar cambios en postulaciones de un usuario
   * @param {string} usuarioId - ID del usuario
   * @param {Function} callback - Función callback
   * @returns {Function}
   */
  onUserPostulacionesChange(usuarioId, callback) {
    return FirestoreService.onQuerySnapshot(
      this.COLLECTION,
      [['usuarioId', '==', usuarioId]],
      callback
    );
  },
  
  /**
   * Escuchar cambios en postulaciones de un evento
   * @param {string} eventoId - ID del evento
   * @param {Function} callback - Función callback
   * @returns {Function}
   */
  onEventoPostulacionesChange(eventoId, callback) {
    return FirestoreService.onQuerySnapshot(
      this.COLLECTION,
      [['eventoId', '==', eventoId]],
      callback
    );
  }
};

// Exportar globalmente
window.PostulacionesService = PostulacionesService;

console.log('✅ postulaciones.service.js cargado correctamente');
