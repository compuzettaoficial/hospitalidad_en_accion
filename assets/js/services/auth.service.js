// ============================================
// AUTH.SERVICE.JS - Servicio de Autenticación
// ============================================

class AuthService {
  
  // ============================================
  // REGISTRO DE NUEVO USUARIO
  // ============================================
  static async register(datos) {
    try {
      console.log('📝 Iniciando registro...');
      
      // Crear usuario en Firebase Auth
      const userCredential = await firebase.auth()
        .createUserWithEmailAndPassword(datos.email, datos.password);
      
      const user = userCredential.user;
      console.log('✅ Usuario creado en Auth:', user.uid);
      
      // Enviar email de verificación
      await user.sendEmailVerification();
      console.log('📧 Email de verificación enviado');
      
      // Guardar datos adicionales en Firestore
      await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .set({
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono,
          rol: 'usuario',
          emailVerificado: false,
          activo: true,
          fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
          ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
        });
      
      console.log('✅ Datos guardados en Firestore');
      return user;
      
    } catch (error) {
      console.error('❌ Error en registro:', error.code, error.message);
      throw error;
    }
  }
  
  // ============================================
  // LOGIN
  // ============================================
  static async login(email, password) {
    try {
      console.log('🔐 Iniciando login para:', email);
      
      const userCredential = await firebase.auth()
        .signInWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      console.log('✅ Auth exitoso. UID:', user.uid);
      
      // Actualizar última conexión
      await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .update({
          ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
        });
      
      console.log('✅ Última conexión actualizada');
      
      // Verificar si existe en Firestore
      const doc = await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .get();
      
      if (!doc.exists) {
        console.error('❌ Usuario no existe en Firestore');
        throw new Error('Usuario no encontrado en base de datos');
      }
      
      console.log('✅ Datos Firestore:', doc.data());
      return user;
      
    } catch (error) {
      console.error('❌ Error en login:', error.code, error.message);
      throw error;
    }
  }
  
  // ============================================
  // LOGOUT
  // ============================================
  static async logout() {
    try {
      console.log('👋 Cerrando sesión...');
      await firebase.auth().signOut();
      console.log('✅ Sesión cerrada');
      window.location.href = '/hospitalidad_en_accion/pages/auth/login.html';
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }
  
  // ============================================
  // OBSERVAR ESTADO DE AUTENTICACIÓN
  // ============================================
  static observarEstadoAuth(callback) {
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log('👤 Usuario autenticado:', user.email);
        console.log('🔑 UID:', user.uid);
        
        try {
          // Obtener datos de Firestore
          const doc = await firebase.firestore()
            .collection('usuarios')
            .doc(user.uid)
            .get();
          
          if (doc.exists) {
            const userData = doc.data();
            console.log('✅ Datos obtenidos:', userData);
            
            // Combinar datos de Auth y Firestore
            const fullUserData = {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              ...userData
            };
            
            callback(fullUserData);
          } else {
            console.error('❌ Documento no existe en Firestore');
            console.log('🔍 Ruta buscada: usuarios/' + user.uid);
            callback(null);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos Firestore:', error);
          callback(null);
        }
      } else {
        console.log('🚫 No hay usuario autenticado');
        callback(null);
      }
    });
  }
  
  // ============================================
  // OBTENER USUARIO ACTUAL
  // ============================================
  static getCurrentUser() {
    return firebase.auth().currentUser;
  }
  
  // ============================================
  // OBTENER DATOS DE FIRESTORE
  // ============================================
  static async getUserData(uid) {
    try {
      console.log('📊 Obteniendo datos para UID:', uid);
      
      const doc = await firebase.firestore()
        .collection('usuarios')
        .doc(uid)
        .get();
      
      if (doc.exists) {
        console.log('✅ Datos encontrados');
        return doc.data();
      } else {
        console.error('❌ No se encontró el documento');
        return null;
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos:', error);
      throw error;
    }
  }
  
  // ============================================
  // REENVIAR EMAIL DE VERIFICACIÓN
  // ============================================
  static async reenviarVerificacion() {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await user.sendEmailVerification();
        console.log('✅ Email de verificación reenviado');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error reenviando email:', error);
      throw error;
    }
  }
  
  // ============================================
  // RESETEAR CONTRASEÑA
  // ============================================
  static async resetPassword(email) {
    try {
      console.log('🔑 Enviando email de recuperación a:', email);
      await firebase.auth().sendPasswordResetEmail(email);
      console.log('✅ Email enviado');
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }
  
  // ============================================
  // ACTUALIZAR PERFIL
  // ============================================
  static async actualizarPerfil(uid, datos) {
    try {
      console.log('📝 Actualizando perfil:', uid);
      
      await firebase.firestore()
        .collection('usuarios')
        .doc(uid)
        .update(datos);
      
      console.log('✅ Perfil actualizado');
      return true;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }
  
  // ============================================
  // VERIFICAR SI ES ADMIN
  // ============================================
  static async isAdmin(uid) {
    try {
      const userData = await this.getUserData(uid);
      return userData?.rol === 'admin';
    } catch (error) {
      console.error('❌ Error verificando admin:', error);
      return false;
    }
  }
  
  // ============================================
  // PROTEGER PÁGINA (Requiere login)
  // ============================================
  static protegerPagina(requiereAdmin = false) {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        unsubscribe(); // Desuscribirse después de la primera verificación
        
        if (!user) {
          console.log('🚫 No autenticado, redirigiendo a login...');
          window.location.href = '/pages/auth/login.html';
          reject('No autenticado');
          return;
        }
        
        if (requiereAdmin) {
          const esAdmin = await this.isAdmin(user.uid);
          if (!esAdmin) {
            console.log('🚫 No es admin, redirigiendo...');
            window.location.href = '/pages/user/perfil.html';
            reject('No autorizado');
            return;
          }
        }
        
        console.log('✅ Acceso permitido');
        resolve(user);
      });
    });
  }
}
