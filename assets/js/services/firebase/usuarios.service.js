
/**
 * ============================================
 * USUARIOS.SERVICE.JS - Gestión de Usuarios
 * ============================================
 * Funciones específicas para gestión de usuarios
 */

const UsuariosService = {
  
  // Colección de Firestore
  COLLECTION: CONSTANTS.COLLECTIONS.USUARIOS,
  
  // ============================================
  // OBTENER USUARIOS
  // ============================================
  
  /**
   * Obtener usuario por UID
   * @param {string} uid - UID del usuario
   * @returns {Promise<Object|null>}
   */
  async getByUid(uid) {
    try {
      return await FirestoreService.getById(this.COLLECTION, uid);
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },
  
  /**
   * Obtener todos los usuarios
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    try {
      const filters = [];
      
      // Filtrar por rol
      if (options.rol) {
        filters.push(['rol', '==', options.rol]);
      }
      
      // Filtrar por estado activo
      if (options.activo !== undefined) {
        filters.push(['activo', '==', options.activo]);
      }
      
      const queryOptions = {
        orderBy: 'fechaCreacion',
        orderDirection: 'desc',
        ...options
      };
      
      return await FirestoreService.query(this.COLLECTION, filters, queryOptions);
      
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },
  
  /**
   * Buscar usuarios por nombre o email
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>}
   */
  async search(searchTerm) {
    try {
      const usuarios = await this.getAll();
      
      const term = searchTerm.toLowerCase();
      
      return usuarios.filter(user => 
        user.nombre?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
      
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      throw error;
    }
  },
  
  /**
   * Obtener usuarios por rol
   * @param {string} rol - Rol del usuario
   * @returns {Promise<Array>}
   */
  async getByRol(rol) {
    try {
      return await this.getAll({ rol });
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
      throw error;
    }
  },
  
  // ============================================
  // ACTUALIZAR USUARIOS
  // ============================================
  
  /**
   * Actualizar perfil de usuario
   * @param {string} uid - UID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async updateProfile(uid, data) {
    try {
      // Validar datos
      const allowedFields = ['nombre', 'telefono', 'direccion', 'ciudad', 'departamento'];
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (data.hasOwnProperty(field)) {
          updateData[field] = data[field];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        throw new Error('No hay datos válidos para actualizar');
      }
      
      // Validar nombre
      if (updateData.nombre && !Validators.isValidName(updateData.nombre)) {
        throw new Error('Nombre inválido');
      }
      
      // Validar teléfono
      if (updateData.telefono && !Validators.isValidPhone(updateData.telefono)) {
        throw new Error('Teléfono inválido');
      }
      
      await FirestoreService.update(this.COLLECTION, uid, updateData);
      
      Notify.success('Perfil actualizado correctamente');
      
      return updateData;
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      Notify.error(error.message || 'Error al actualizar perfil');
      throw error;
    }
  },
  
  /**
   * Cambiar rol de usuario (solo admin)
   * @param {string} uid - UID del usuario
   * @param {string} newRol - Nuevo rol
   * @returns {Promise<Object>}
   */
  async changeRol(uid, newRol) {
    try {
      // Validar rol
      const validRoles = [
        CONSTANTS.ROLES.USER,
        CONSTANTS.ROLES.EDITOR,
        CONSTANTS.ROLES.ADMIN
      ];
      
      if (!validRoles.includes(newRol)) {
        throw new Error('Rol inválido');
      }
      
      // Verificar que el usuario actual es admin
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        throw new Error('No hay sesión activa');
      }
      
      const isAdmin = await AuthService.isAdmin(currentUser.uid);
      if (!isAdmin) {
        throw new Error('No tienes permisos para cambiar roles');
      }
      
      // No permitir cambiar el propio rol
      if (currentUser.uid === uid) {
        throw new Error('No puedes cambiar tu propio rol');
      }
      
      await FirestoreService.update(this.COLLECTION, uid, { rol: newRol });
      
      Notify.success('Rol actualizado correctamente');
      
      return { uid, rol: newRol };
      
    } catch (error) {
      console.error('Error cambiando rol:', error);
      Notify.error(error.message || 'Error al cambiar rol');
      throw error;
    }
  },
  
  /**
   * Activar/Desactivar usuario (solo admin)
   * @param {string} uid - UID del usuario
   * @param {boolean} activo - Estado activo
   * @returns {Promise<Object>}
   */
  async setActive(uid, activo) {
    try {
      // Verificar que el usuario actual es admin
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        throw new Error('No hay sesión activa');
      }
      
      const isAdmin = await AuthService.isAdmin(currentUser.uid);
      if (!isAdmin) {
        throw new Error('No tienes permisos para cambiar el estado');
      }
      
      // No permitir desactivar la propia cuenta
      if (currentUser.uid === uid) {
        throw new Error('No puedes desactivar tu propia cuenta');
      }
      
      await FirestoreService.update(this.COLLECTION, uid, { activo });
      
      const mensaje = activo ? 'Usuario activado' : 'Usuario desactivado';
      Notify.success(mensaje);
      
      return { uid, activo };
      
    } catch (error) {
      console.error('Error cambiando estado:', error);
      Notify.error(error.message || 'Error al cambiar estado');
      throw error;
    }
  },
  
  // ============================================
  // ESTADÍSTICAS
  // ============================================
  
  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const usuarios = await this.getAll();
      
      const stats = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.activo).length,
        inactivos: usuarios.filter(u => !u.activo).length,
        porRol: {
          user: usuarios.filter(u => u.rol === CONSTANTS.ROLES.USER).length,
          editor: usuarios.filter(u => u.rol === CONSTANTS.ROLES.EDITOR).length,
          admin: usuarios.filter(u => u.rol === CONSTANTS.ROLES.ADMIN).length
        },
        nuevosUltimos30Dias: this._countRecent(usuarios, 30)
      };
      
      return stats;
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },
  
  /**
   * Contar usuarios registrados recientemente
   * @private
   * @param {Array} usuarios - Lista de usuarios
   * @param {number} days - Días hacia atrás
   * @returns {number}
   */
  _countRecent(usuarios, days) {
    const now = new Date();
    const threshold = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return usuarios.filter(user => {
      if (!user.fechaCreacion) return false;
      
      const createdAt = user.fechaCreacion.toDate 
        ? user.fechaCreacion.toDate() 
        : new Date(user.fechaCreacion);
      
      return createdAt >= threshold;
    }).length;
  },
  
  // ============================================
  // VALIDACIONES
  // ============================================
  
  /**
   * Verificar si un email ya está registrado
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    try {
      const usuarios = await FirestoreService.query(
        this.COLLECTION,
        [['email', '==', email.toLowerCase()]]
      );
      
      return usuarios.length > 0;
      
    } catch (error) {
      console.error('Error verificando email:', error);
      throw error;
    }
  },
  
  /**
   * Verificar si un usuario puede realizar una acción
   * @param {string} uid - UID del usuario
   * @param {string} action - Acción a verificar
   * @returns {Promise<boolean>}
   */
  async canPerformAction(uid, action) {
    try {
      const user = await this.getByUid(uid);
      
      if (!user || !user.activo) {
        return false;
      }
      
      // Definir permisos por rol
      const permissions = {
        [CONSTANTS.ROLES.USER]: ['postular', 'ver_eventos', 'editar_perfil'],
        [CONSTANTS.ROLES.EDITOR]: ['postular', 'ver_eventos', 'editar_perfil', 'crear_evento', 'crear_hotel'],
        [CONSTANTS.ROLES.ADMIN]: ['*'] // Todos los permisos
      };
      
      const userPermissions = permissions[user.rol] || [];
      
      return userPermissions.includes('*') || userPermissions.includes(action);
      
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  },
  
  // ============================================
  // LISTENERS
  // ============================================
  
  /**
   * Escuchar cambios en un usuario
   * @param {string} uid - UID del usuario
   * @param {Function} callback - Función callback
   * @returns {Function} Función para detener listener
   */
  onUserChange(uid, callback) {
    return FirestoreService.onSnapshot(this.COLLECTION, uid, callback);
  },
  
  /**
   * Escuchar cambios en la lista de usuarios
   * @param {Object} filters - Filtros opcionales
   * @param {Function} callback - Función callback
   * @returns {Function} Función para detener listener
   */
  onUsersChange(filters = {}, callback) {
    const firestoreFilters = [];
    
    if (filters.rol) {
      firestoreFilters.push(['rol', '==', filters.rol]);
    }
    
    if (filters.activo !== undefined) {
      firestoreFilters.push(['activo', '==', filters.activo]);
    }
    
    return FirestoreService.onQuerySnapshot(
      this.COLLECTION,
      firestoreFilters,
      callback
    );
  },
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Obtener nombre completo del usuario
   * @param {Object} user - Objeto usuario
   * @returns {string}
   */
  getFullName(user) {
    return user?.nombre || 'Usuario';
  },
  
  /**
   * Obtener iniciales del usuario
   * @param {Object} user - Objeto usuario
   * @returns {string}
   */
  getInitials(user) {
    if (!user?.nombre) return 'U';
    
    const names = user.nombre.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  },
  
  /**
   * Obtener etiqueta de rol
   * @param {string} rol - Rol del usuario
   * @returns {string}
   */
  getRolLabel(rol) {
    const labels = {
      [CONSTANTS.ROLES.USER]: 'Usuario',
      [CONSTANTS.ROLES.EDITOR]: 'Editor',
      [CONSTANTS.ROLES.ADMIN]: 'Administrador'
    };
    
    return labels[rol] || 'Usuario';
  }
};

// Exportar globalmente
window.UsuariosService = UsuariosService;

console.log('✅ usuarios.service.js cargado correctamente');
