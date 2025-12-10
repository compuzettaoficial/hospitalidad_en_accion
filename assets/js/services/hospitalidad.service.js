/* ============================================
   HOSPITALIDAD.SERVICE.JS
   Servicio para gestionar postulaciones de hospitalidad
   ============================================ */

class HospitalidadService {
  
  /**
   * Postular como VISITANTE (solicitar hospedaje)
   * @param {Object} datos - Datos de la postulación
   * @returns {Promise<Object>} Resultado
   */
  static async postularComoVisitante(datos) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Validar datos requeridos
      if (!datos.eventoId || !datos.fechaLlegada || !datos.fechaSalida) {
        throw new Error('Faltan datos requeridos');
      }
      
      // Crear postulación
      const docRef = await db.collection('postulaciones').add({
        tipo: 'visitante',
        eventoId: datos.eventoId,
        usuarioId: user.uid,
        
        // Datos personales
        nombre: datos.nombre || user.displayName,
        email: datos.email || user.email,
        telefono: datos.telefono,
        
        // Datos del viaje
        fechaLlegada: datos.fechaLlegada,
        fechaSalida: datos.fechaSalida,
        ciudadOrigen: datos.ciudadOrigen,
        
        // Preferencias
        numeroPersonas: datos.numeroPersonas || 1,
        edades: datos.edades || [],
        genero: datos.genero || 'mixto',
        necesidadesEspeciales: datos.necesidadesEspeciales || '',
        
        // Información adicional
        iglesiaOrigen: datos.iglesiaOrigen || '',
        pastorReferencia: datos.pastorReferencia || '',
        comentarios: datos.comentarios || '',
        
        // Estado
        estado: 'pendiente', // pendiente, aprobado, rechazado, emparejado
        emparejadoCon: null,
        
        // Metadata
        fechaPostulacion: firebase.firestore.FieldValue.serverTimestamp(),
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
        activo: true
      });
      
      console.log('Postulación de visitante creada:', docRef.id);
      
      return {
        success: true,
        postulacionId: docRef.id,
        message: 'Postulación enviada correctamente'
      };
      
    } catch (error) {
      console.error('Error al postular como visitante:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar postulación'
      };
    }
  }
  
  /**
   * Postular como ANFITRIÓN (ofrecer hospedaje)
   * @param {Object} datos - Datos de la postulación
   * @returns {Promise<Object>} Resultado
   */
  static async postularComoAnfitrion(datos) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Validar datos requeridos
      if (!datos.eventoId || !datos.capacidad) {
        throw new Error('Faltan datos requeridos');
      }
      
      // Crear postulación
      const docRef = await db.collection('postulaciones').add({
        tipo: 'anfitrion',
        eventoId: datos.eventoId,
        usuarioId: user.uid,
        
        // Datos personales
        nombre: datos.nombre || user.displayName,
        email: datos.email || user.email,
        telefono: datos.telefono,
        
        // Datos de la vivienda
        direccion: datos.direccion,
        distrito: datos.distrito,
        referencias: datos.referencias || '',
        distanciaEvento: datos.distanciaEvento || '',
        
        // Capacidad
        capacidad: datos.capacidad,
        habitacionesDisponibles: datos.habitacionesDisponibles || 1,
        camasDisponibles: datos.camasDisponibles || 1,
        
        // Preferencias
        generoPreferencia: datos.generoPreferencia || 'indiferente',
        aceptaNinos: datos.aceptaNinos || false,
        aceptaMascotas: datos.aceptaMascotas || false,
        
        // Servicios
        servicios: datos.servicios || [],
        
        // Información adicional
        iglesia: datos.iglesia || '',
        aniosIglesia: datos.aniosIglesia || '',
        experienciaHospitalidad: datos.experienciaHospitalidad || '',
        comentarios: datos.comentarios || '',
        
        // Estado
        estado: 'pendiente', // pendiente, aprobado, rechazado, asignado
        visitantesAsignados: [],
        lugaresOcupados: 0,
        
        // Metadata
        fechaPostulacion: firebase.firestore.FieldValue.serverTimestamp(),
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp(),
        activo: true
      });
      
      console.log('Postulación de anfitrión creada:', docRef.id);
      
      return {
        success: true,
        postulacionId: docRef.id,
        message: 'Postulación enviada correctamente'
      };
      
    } catch (error) {
      console.error('Error al postular como anfitrión:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar postulación'
      };
    }
  }
  
  /**
   * Obtener postulaciones del usuario actual
   * @param {string} tipo - 'visitante', 'anfitrion' o null (todas)
   * @returns {Promise<Array>} Lista de postulaciones
   */
  static async getMisPostulaciones(tipo = null) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      let query = db.collection('postulaciones')
        .where('usuarioId', '==', user.uid)
        .where('activo', '==', true);
      
      if (tipo) {
        query = query.where('tipo', '==', tipo);
      }
      
      const snapshot = await query.orderBy('fechaPostulacion', 'desc').get();
      
      const postulaciones = [];
      snapshot.forEach(doc => {
        postulaciones.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return postulaciones;
      
    } catch (error) {
      console.error('Error al obtener postulaciones:', error);
      return [];
    }
  }
  
  /**
   * Obtener una postulación por ID
   * @param {string} postulacionId - ID de la postulación
   * @returns {Promise<Object|null>} Postulación o null
   */
  static async getPostulacionById(postulacionId) {
    try {
      const doc = await db.collection('postulaciones').doc(postulacionId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
      
    } catch (error) {
      console.error('Error al obtener postulación:', error);
      return null;
    }
  }
  
  /**
   * Actualizar una postulación
   * @param {string} postulacionId - ID de la postulación
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} Resultado
   */
  static async actualizarPostulacion(postulacionId, datos) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Verificar que la postulación pertenece al usuario
      const postulacion = await this.getPostulacionById(postulacionId);
      
      if (!postulacion || postulacion.usuarioId !== user.uid) {
        throw new Error('No tienes permisos para actualizar esta postulación');
      }
      
      await db.collection('postulaciones').doc(postulacionId).update({
        ...datos,
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Postulación actualizada correctamente'
      };
      
    } catch (error) {
      console.error('Error al actualizar postulación:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar postulación'
      };
    }
  }
  
  /**
   * Cancelar una postulación
   * @param {string} postulacionId - ID de la postulación
   * @returns {Promise<Object>} Resultado
   */
  static async cancelarPostulacion(postulacionId) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Verificar que la postulación pertenece al usuario
      const postulacion = await this.getPostulacionById(postulacionId);
      
      if (!postulacion || postulacion.usuarioId !== user.uid) {
        throw new Error('No tienes permisos para cancelar esta postulación');
      }
      
      // No eliminar, solo desactivar
      await db.collection('postulaciones').doc(postulacionId).update({
        activo: false,
        estado: 'cancelado',
        ultimaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Postulación cancelada correctamente'
      };
      
    } catch (error) {
      console.error('Error al cancelar postulación:', error);
      return {
        success: false,
        error: error.message || 'Error al cancelar postulación'
      };
    }
  }
  
  /**
   * Obtener estadísticas del usuario
   * @returns {Promise<Object>} Estadísticas
   */
  static async getEstadisticasUsuario() {
    try {
      const postulaciones = await this.getMisPostulaciones();
      
      return {
        total: postulaciones.length,
        visitante: postulaciones.filter(p => p.tipo === 'visitante').length,
        anfitrion: postulaciones.filter(p => p.tipo === 'anfitrion').length,
        pendientes: postulaciones.filter(p => p.estado === 'pendiente').length,
        aprobadas: postulaciones.filter(p => p.estado === 'aprobado' || p.estado === 'emparejado').length,
        rechazadas: postulaciones.filter(p => p.estado === 'rechazado').length
      };
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        total: 0,
        visitante: 0,
        anfitrion: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0
      };
    }
  }
  
  /**
   * Obtener estado de postulación con texto
   * @param {string} estado - Estado de la postulación
   * @returns {Object} {texto, clase, icono}
   */
  static getEstadoInfo(estado) {
    const estados = {
      'pendiente': {
        texto: 'Pendiente de Revisión',
        clase: 'warning',
        icono: 'clock'
      },
      'aprobado': {
        texto: 'Aprobado',
        clase: 'success',
        icono: 'check-circle'
      },
      'rechazado': {
        texto: 'Rechazado',
        clase: 'error',
        icono: 'times-circle'
      },
      'emparejado': {
        texto: 'Emparejado',
        clase: 'success',
        icono: 'handshake'
      },
      'asignado': {
        texto: 'Visitantes Asignados',
        clase: 'success',
        icono: 'users'
      },
      'cancelado': {
        texto: 'Cancelado',
        clase: 'text-light',
        icono: 'ban'
      }
    };
    
    return estados[estado] || estados['pendiente'];
  }
  
  /**
   * Validar fechas de viaje
   * @param {string} fechaLlegada - Fecha de llegada
   * @param {string} fechaSalida - Fecha de salida
   * @returns {Object} {valid, message}
   */
  static validateFechas(fechaLlegada, fechaSalida) {
    const llegada = new Date(fechaLlegada);
    const salida = new Date(fechaSalida);
    const hoy = new Date();
    
    if (llegada < hoy) {
      return {
        valid: false,
        message: 'La fecha de llegada no puede ser en el pasado'
      };
    }
    
    if (salida <= llegada) {
      return {
        valid: false,
        message: 'La fecha de salida debe ser posterior a la de llegada'
      };
    }
    
    return {
      valid: true,
      message: 'Fechas válidas'
    };
  }
  
  /**
   * Calcular número de noches
   * @param {string} fechaLlegada - Fecha de llegada
   * @param {string} fechaSalida - Fecha de salida
   * @returns {number} Número de noches
   */
  static calcularNoches(fechaLlegada, fechaSalida) {
    const llegada = new Date(fechaLlegada);
    const salida = new Date(fechaSalida);
    const diferencia = salida - llegada;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Formatear fecha para mostrar
   * @param {Timestamp} timestamp - Timestamp de Firestore
   * @returns {string} Fecha formateada
   */
  static formatearFecha(timestamp) {
    if (!timestamp) return 'No especificada';
    
    try {
      const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return fecha.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HospitalidadService;
}