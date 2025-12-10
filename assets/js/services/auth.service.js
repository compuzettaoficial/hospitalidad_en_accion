/* ============================================
   AUTH.SERVICE.JS
   Servicio de autenticación con Firebase
   ============================================ */

class AuthService {
  
  /**
   * Registrar nuevo usuario
   * @param {Object} datos - {email, password, nombre, telefono}
   * @returns {Promise<Object>} Usuario creado
   */
  static async registrar(datos) {
    try {
      const { email, password, nombre, telefono } = datos;
      
      // Crear usuario en Firebase Auth
      const userCredential = await firebase.auth()
        .createUserWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      
      // Actualizar perfil con nombre
      await user.updateProfile({
        displayName: nombre
      });
      
      // Guardar datos adicionales en Firestore
      await db.collection('usuarios').doc(user.uid).set({
        nombre: nombre,
        email: email,
        telefono: telefono || '',
        rol: 'usuario', // usuario, admin
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        activo: true,
        emailVerificado: false
      });
      
      // Enviar email de verificación
      await user.sendEmailVerification();
      
      console.log('Usuario registrado:', user.uid);
      
      return {
        success: true,
        user: user,
        message: 'Registro exitoso. Por favor verifica tu email.'
      };
      
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Resultado del login
   */
  static async login(email, password) {
    try {
      const userCredential = await firebase.auth()
        .signInWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      
      // Actualizar última conexión
      await db.collection('usuarios').doc(user.uid).update({
        ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Login exitoso:', user.uid);
      
      return {
        success: true,
        user: user,
        message: 'Bienvenido'
      };
      
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Cerrar sesión
   * @returns {Promise<Object>} Resultado
   */
  static async logout() {
    try {
      await firebase.auth().signOut();
      
      console.log('Sesión cerrada');
      
      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      };
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return {
        success: false,
        error: 'Error al cerrar sesión'
      };
    }
  }
  
  /**
   * Obtener usuario actual
   * @returns {Object|null} Usuario actual o null
   */
  static getCurrentUser() {
    return firebase.auth().currentUser;
  }
  
  /**
   * Verificar si hay usuario autenticado
   * @returns {boolean} true si hay usuario
   */
  static isAuthenticated() {
    return firebase.auth().currentUser !== null;
  }
  
  /**
   * Obtener datos completos del usuario desde Firestore
   * @param {string} uid - ID del usuario
   * @returns {Promise<Object|null>} Datos del usuario
   */
  static async getUserData(uid) {
    try {
      const doc = await db.collection('usuarios').doc(uid).get();
      
      if (!doc.exists) {
        console.warn('Usuario no encontrado en Firestore:', uid);
        return null;
      }
      
      return {
        uid: uid,
        ...doc.data()
      };
      
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }
  
  /**
   * Obtener datos completos del usuario actual
   * @returns {Promise<Object|null>} Datos del usuario actual
   */
  static async getCurrentUserData() {
    const user = this.getCurrentUser();
    
    if (!user) {
      return null;
    }
    
    return await this.getUserData(user.uid);
  }
  
  /**
   * Actualizar perfil del usuario
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} Resultado
   */
  static async updateProfile(datos) {
    try {
      const user = this.getCurrentUser();
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Actualizar displayName en Auth si viene el nombre
      if (datos.nombre) {
        await user.updateProfile({
          displayName: datos.nombre
        });
      }
      
      // Actualizar datos en Firestore
      await db.collection('usuarios').doc(user.uid).update({
        ...datos,
        fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Perfil actualizado correctamente'
      };
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        error: 'Error al actualizar perfil'
      };
    }
  }
  
  /**
   * Cambiar contraseña
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Resultado
   */
  static async changePassword(currentPassword, newPassword) {
    try {
      const user = this.getCurrentUser();
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      // Reautenticar usuario
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await user.reauthenticateWithCredential(credential);
      
      // Cambiar contraseña
      await user.updatePassword(newPassword);
      
      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      };
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Recuperar contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Resultado
   */
  static async resetPassword(email) {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      
      return {
        success: true,
        message: 'Se ha enviado un email para restablecer tu contraseña'
      };
      
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Reenviar email de verificación
   * @returns {Promise<Object>} Resultado
   */
  static async resendVerificationEmail() {
    try {
      const user = this.getCurrentUser();
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      if (user.emailVerified) {
        return {
          success: false,
          error: 'El email ya está verificado'
        };
      }
      
      await user.sendEmailVerification();
      
      return {
        success: true,
        message: 'Email de verificación enviado'
      };
      
    } catch (error) {
      console.error('Error al enviar email de verificación:', error);
      return {
        success: false,
        error: 'Error al enviar email de verificación'
      };
    }
  }
  
  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} rol - Rol a verificar
   * @returns {Promise<boolean>} true si tiene el rol
   */
  static async hasRole(rol) {
    try {
      const userData = await this.getCurrentUserData();
      return userData && userData.rol === rol;
      
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return false;
    }
  }
  
  /**
   * Verificar si el usuario es admin
   * @returns {Promise<boolean>} true si es admin
   */
  static async isAdmin() {
    return await this.hasRole('admin');
  }
  
  /**
   * Observer de cambios de autenticación
   * @param {Function} callback - Función a ejecutar cuando cambie el estado
   */
  static onAuthStateChanged(callback) {
    return firebase.auth().onAuthStateChanged(callback);
  }
  
  /**
   * Proteger página (redirigir si no está autenticado)
   * @param {string} redirectUrl - URL de redirección
   */
  static protectPage(redirectUrl = '../auth/login.html') {
    this.onAuthStateChanged(user => {
      if (!user) {
        window.location.href = redirectUrl;
      }
    });
  }
  
  /**
   * Proteger página de admin
   * @param {string} redirectUrl - URL de redirección
   */
  static async protectAdminPage(redirectUrl = '../../index.html') {
    const isAdmin = await this.isAdmin();
    
    if (!isAdmin) {
      alert('No tienes permisos para acceder a esta página');
      window.location.href = redirectUrl;
    }
  }
  
  /**
   * Redirigir si ya está autenticado
   * @param {string} redirectUrl - URL de redirección
   */
  static redirectIfAuthenticated(redirectUrl = '../user/perfil.html') {
    this.onAuthStateChanged(user => {
      if (user) {
        window.location.href = redirectUrl;
      }
    });
  }
  
  /**
   * Obtener mensaje de error en español
   * @param {string} errorCode - Código de error de Firebase
   * @returns {string} Mensaje de error
   */
  static getErrorMessage(errorCode) {
    const errorMessages = {
      // Errores de autenticación
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/requires-recent-login': 'Por seguridad, debes iniciar sesión nuevamente',
      'auth/invalid-credential': 'Credenciales inválidas',
      
      // Errores genéricos
      'permission-denied': 'No tienes permisos para realizar esta acción',
      'unavailable': 'Servicio no disponible. Intenta más tarde',
      'default': 'Ha ocurrido un error. Por favor intenta nuevamente'
    };
    
    return errorMessages[errorCode] || errorMessages['default'];
  }
  
  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {boolean} true si es válido
   */
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  /**
   * Validar contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} {valid: boolean, message: string}
   */
  static validatePassword(password) {
    if (!password) {
      return { valid: false, message: 'La contraseña es requerida' };
    }
    
    if (password.length < 6) {
      return { valid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    // Opcional: validaciones adicionales
    // if (!/[A-Z]/.test(password)) {
    //   return { valid: false, message: 'Debe tener al menos una mayúscula' };
    // }
    
    return { valid: true, message: 'Contraseña válida' };
  }
  
  /**
   * Validar teléfono peruano
   * @param {string} telefono - Teléfono a validar
   * @returns {boolean} true si es válido
   */
  static validatePhone(telefono) {
    // Formato: +51 999 888 777 o 999888777 o 51999888777
    const re = /^(\+51|51)?[9][0-9]{8}$/;
    return re.test(telefono.replace(/\s/g, ''));
  }
  
  /**
   * Formatear teléfono
   * @param {string} telefono - Teléfono sin formato
   * @returns {string} Teléfono formateado
   */
  static formatPhone(telefono) {
    const cleaned = telefono.replace(/\D/g, '');
    
    if (cleaned.length === 9) {
      return `+51 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('51')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    return telefono;
  }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}