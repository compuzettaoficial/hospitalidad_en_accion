// ============================================
// AUTH.SERVICE.JS - Servicio de Autenticación
// Gestión completa de usuarios con Firebase
// ============================================

class AuthService {
  
  // ============================================
  // REGISTRO DE NUEVO USUARIO (CON RETRY Y VERIFICACIÓN)
  // ============================================
  static async register(datos) {
    try {
      console.log('📝 Iniciando registro para:', datos.email);
      
      // Validaciones previas
      if (!datos.email || !datos.password || !datos.nombre || !datos.telefono) {
        throw new Error('Todos los campos son obligatorios');
      }
      
      if (datos.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // 1. Crear usuario en Firebase Auth
      console.log('🔐 Creando usuario en Firebase Auth...');
      const userCredential = await firebase.auth()
        .createUserWithEmailAndPassword(datos.email, datos.password);
      
      const user = userCredential.user;
      console.log('✅ Usuario creado en Auth con UID:', user.uid);
      
      // 2. Preparar datos para Firestore
      const userData = {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        rol: 'usuario',
        activo: true,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // 3. Guardar en Firestore CON RETRY (3 intentos)
      let intentos = 0;
      const maxIntentos = 3;
      let guardado = false;
      
      while (intentos < maxIntentos && !guardado) {
        try {
          intentos++;
          console.log(`📝 Intento ${intentos}/${maxIntentos} de guardar en Firestore...`);
          
          await firebase.firestore()
            .collection('usuarios')
            .doc(user.uid)
            .set(userData);
          
          guardado = true;
          console.log('✅ Datos guardados exitosamente en Firestore');
          
        } catch (firestoreError) {
          console.error(`❌ Error en intento ${intentos}:`, firestoreError.code, firestoreError.message);
          
          if (intentos < maxIntentos) {
            console.log(`⏳ Esperando 1 segundo antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // Si fallan todos los intentos, eliminar usuario de Auth
            console.error('❌ CRÍTICO: No se pudo guardar en Firestore después de 3 intentos');
            console.log('🗑️ Eliminando usuario de Auth para mantener consistencia...');
            
            try {
              await user.delete();
              console.log('✅ Usuario eliminado de Auth');
            } catch (deleteError) {
              console.error('❌ Error al eliminar usuario:', deleteError);
            }
            
            throw new Error('No se pudieron guardar tus datos. Por favor intenta nuevamente en unos momentos.');
          }
        }
      }
      
      // 4. Verificar que el documento existe
      console.log('🔍 Verificando que los datos se guardaron correctamente...');
      
      const docVerify = await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .get();
      
      if (!docVerify.exists) {
        console.error('❌ CRÍTICO: Verificación falló - documento no existe');
        console.log('🗑️ Eliminando usuario de Auth...');
        
        try {
          await user.delete();
        } catch (deleteError) {
          console.error('❌ Error al eliminar usuario:', deleteError);
        }
        
        throw new Error('Error al verificar tus datos. Por favor intenta nuevamente.');
      }
      
      console.log('✅ Verificación exitosa - documento existe en Firestore');
      console.log('✅✅✅ REGISTRO COMPLETADO EXITOSAMENTE');
      
      return user;
      
    } catch (error) {
      console.error('❌ Error en registro:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      throw error;
    }
  }
  
  // ============================================
  // LOGIN
  // ============================================
  static async login(email, password) {
    try {
      console.log('🔐 Iniciando login para:', email);
      
      // Validaciones previas
      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
      }
      
      // Intentar login
      const userCredential = await firebase.auth()
        .signInWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      console.log('✅ Auth exitoso. UID:', user.uid);
      
      // Verificar si el usuario existe en Firestore
      const docRef = firebase.firestore()
        .collection('usuarios')
        .doc(user.uid);
      
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.error('❌ Usuario no existe en Firestore');
        await firebase.auth().signOut();
        throw new Error('Usuario no encontrado en base de datos. Por favor contacta al administrador.');
      }
      
      const userData = doc.data();
      console.log('✅ Datos Firestore obtenidos');
      
      // Verificar si la cuenta está activa
      if (userData.activo === false) {
        await firebase.auth().signOut();
        throw new Error('Tu cuenta ha sido deshabilitada. Contacta al administrador.');
      }
      
      // Actualizar última conexión
      await docRef.update({
        ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ Última conexión actualizada');
      console.log('✅✅✅ LOGIN COMPLETADO EXITOSAMENTE');
      
      return user;
      
    } catch (error) {
      console.error('❌ Error en login:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      throw error;
    }
  }
  
  // ============================================
  // LOGOUT
  // ============================================
  static async logout() {
    try {
      console.log('👋 Cerrando sesión...');
      
      const user = firebase.auth().currentUser;
      if (user) {
        console.log('Usuario actual:', user.email);
      }
      
      await firebase.auth().signOut();
      console.log('✅ Sesión cerrada exitosamente');
      
      // Redirigir al login usando AppConfig
      window.location.href = AppConfig.PAGES.LOGIN();
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }
  
  // ============================================
  // OBSERVAR ESTADO DE AUTENTICACIÓN (CON ESPERA Y MEJOR MANEJO)
  // ============================================
  static observarEstadoAuth(callback) {
    console.log('👁️ Iniciando observador de autenticación...');
    
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log('👤 Usuario autenticado detectado');
        console.log('📧 Email:', user.email);
        console.log('🔑 UID:', user.uid);
        
        try {
          // Esperar 500ms para asegurar que Firestore tenga los datos
          // Esto es importante en registros recientes
          console.log('⏳ Esperando sincronización con Firestore...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Obtener datos de Firestore
          const doc = await firebase.firestore()
            .collection('usuarios')
            .doc(user.uid)
            .get();
          
          if (doc.exists) {
            const firestoreData = doc.data();
            console.log('✅ Datos Firestore obtenidos:', firestoreData);
            
            // Combinar datos de Auth y Firestore
            const fullUserData = {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              ...firestoreData
            };
            
            callback(fullUserData);
          } else {
            console.error('❌ Documento no existe en Firestore para UID:', user.uid);
            console.error('🔍 Ruta buscada: usuarios/' + user.uid);
            console.error('⚠️ Esto puede indicar:');
            console.error('   1. Problema con las reglas de Firestore');
            console.error('   2. El documento no se creó durante el registro');
            console.error('   3. El documento fue eliminado manualmente');
            
            // Cerrar sesión para evitar bucle infinito
            console.log('🚪 Cerrando sesión automáticamente para evitar bucle...');
            await firebase.auth().signOut();
            callback(null);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos de Firestore:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Si es error de permisos, cerrar sesión
          if (error.code === 'permission-denied') {
            console.error('⚠️ Error de permisos de Firestore');
            console.error('⚠️ Verifica las reglas en Firebase Console');
            console.log('🚪 Cerrando sesión...');
            await firebase.auth().signOut();
          }
          
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
    const user = firebase.auth().currentUser;
    if (user) {
      console.log('👤 Usuario actual:', user.email);
      return user;
    } else {
      console.log('🚫 No hay usuario autenticado');
      return null;
    }
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
        const data = doc.data();
        console.log('✅ Datos encontrados:', data);
        return data;
      } else {
        console.error('❌ No se encontró el documento para UID:', uid);
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
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      if (user.emailVerified) {
        console.log('✅ El email ya está verificado');
        return { success: true, message: 'El email ya está verificado' };
      }
      
      console.log('📧 Enviando email de verificación a:', user.email);
      
      await user.sendEmailVerification({
        url: window.location.origin + AppConfig.PAGES.LOGIN(),
        handleCodeInApp: false
      });
      
      console.log('✅ Email de verificación reenviado');
      return { success: true, message: 'Email enviado correctamente' };
      
    } catch (error) {
      console.error('❌ Error reenviando email:', error);
      
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Espera unos minutos antes de intentar nuevamente.');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // RESETEAR CONTRASEÑA
  // ============================================
  static async resetPassword(email) {
    try {
      if (!email) {
        throw new Error('El email es obligatorio');
      }
      
      console.log('🔑 Enviando email de recuperación a:', email);
      
      await firebase.auth().sendPasswordResetEmail(email, {
        url: window.location.origin + AppConfig.PAGES.LOGIN(),
        handleCodeInApp: false
      });
      
      console.log('✅ Email de recuperación enviado');
      return { success: true, message: 'Email enviado correctamente' };
      
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe una cuenta con este email');
      }
      
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // ACTUALIZAR PERFIL
  // ============================================
  static async actualizarPerfil(uid, datos) {
    try {
      console.log('📝 Actualizando perfil para UID:', uid);
      console.log('Datos a actualizar:', datos);
      
      // Validar que no se intente cambiar campos restringidos
      const camposPermitidos = ['nombre', 'telefono'];
      const datosLimpios = {};
      
      for (const key of camposPermitidos) {
        if (datos.hasOwnProperty(key)) {
          datosLimpios[key] = datos[key];
        }
      }
      
      if (Object.keys(datosLimpios).length === 0) {
        throw new Error('No hay datos válidos para actualizar');
      }
      
      await firebase.firestore()
        .collection('usuarios')
        .doc(uid)
        .update(datosLimpios);
      
      console.log('✅ Perfil actualizado exitosamente');
      return { success: true, message: 'Perfil actualizado' };
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }
  
  // ============================================
  // CAMBIAR CONTRASEÑA
  // ============================================
  static async cambiarPassword(passwordActual, passwordNueva) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      console.log('🔑 Cambiando contraseña para:', user.email);
      
      // Re-autenticar usuario
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        passwordActual
      );
      
      await user.reauthenticateWithCredential(credential);
      console.log('✅ Re-autenticación exitosa');
      
      // Cambiar contraseña
      await user.updatePassword(passwordNueva);
      console.log('✅ Contraseña actualizada');
      
      return { success: true, message: 'Contraseña actualizada correctamente' };
      
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('La contraseña actual es incorrecta');
      }
      
      if (error.code === 'auth/weak-password') {
        throw new Error('La nueva contraseña es demasiado débil');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // VERIFICAR SI ES ADMIN
  // ============================================
  static async isAdmin(uid) {
    try {
      const userData = await this.getUserData(uid);
      const esAdmin = userData?.rol === 'admin';
      console.log('🔐 ¿Es admin?:', esAdmin);
      return esAdmin;
    } catch (error) {
      console.error('❌ Error verificando admin:', error);
      return false;
    }
  }
  
  // ============================================
  // PROTEGER PÁGINA (Requiere autenticación)
  // ============================================
  static protegerPagina(requiereAdmin = false) {
    console.log('🔒 Protegiendo página. Requiere admin:', requiereAdmin);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        unsubscribe(); // Desuscribirse después de la primera verificación
        
        if (!user) {
          console.log('🚫 No hay usuario autenticado');
          console.log('🔄 Redirigiendo a login...');
          window.location.href = AppConfig.PAGES.LOGIN();
          reject(new Error('No autenticado'));
          return;
        }
        
        console.log('✅ Usuario autenticado:', user.email);
        
        // Si requiere admin, verificar rol
        if (requiereAdmin) {
          console.log('🔐 Verificando permisos de administrador...');
          const esAdmin = await this.isAdmin(user.uid);
          
          if (!esAdmin) {
            console.log('🚫 Usuario no es admin');
            console.log('🔄 Redirigiendo a perfil...');
            window.location.href = AppConfig.PAGES.PERFIL();
            reject(new Error('No autorizado'));
            return;
          }
          
          console.log('✅ Usuario es admin, acceso permitido');
        }
        
        console.log('✅ Acceso permitido');
        resolve(user);
      });
    });
  }
  
  // ============================================
  // ELIMINAR CUENTA
  // ============================================
  static async eliminarCuenta(password) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      console.log('⚠️ Eliminando cuenta para:', user.email);
      
      // Re-autenticar usuario
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
      );
      
      await user.reauthenticateWithCredential(credential);
      console.log('✅ Re-autenticación exitosa');
      
      // Eliminar datos de Firestore
      await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .delete();
      
      console.log('✅ Datos de Firestore eliminados');
      
      // Eliminar cuenta de Auth
      await user.delete();
      console.log('✅ Cuenta de Auth eliminada');
      
      // Redirigir a home
      window.location.href = AppConfig.PAGES.HOME();
      
      return { success: true, message: 'Cuenta eliminada correctamente' };
      
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      }
      
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Por seguridad, debes iniciar sesión nuevamente antes de eliminar tu cuenta');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // REFRESCAR TOKEN
  // ============================================
  static async refrescarToken() {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        const token = await user.getIdToken(true);
        console.log('✅ Token refrescado');
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      throw error;
    }
  }
}

// Log de inicialización
console.log('✅ AuthService cargado correctamente');
