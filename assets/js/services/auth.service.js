// ============================================
// AUTH.SERVICE.JS - Servicio de Autenticación
// Gestión completa de usuarios con Firebase
// ============================================

class AuthService {
  
  // ============================================
  // REGISTRO DE NUEVO USUARIO
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
      
      // 2. Preparar datos completos para Firestore
      const userData = {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        rol: 'usuario',
        activo: true,
        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
        ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // 3. Guardar en Firestore con retry
      let intentos = 0;
      const maxIntentos = 3;
      let guardado = false;
      let ultimoError = null;
      
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
          ultimoError = firestoreError;
          console.error(`❌ Error en intento ${intentos}:`, firestoreError.code || firestoreError);
          console.error('Mensaje:', firestoreError.message);

          if (intentos < maxIntentos) {
            console.log(`⏳ Esperando ${intentos} segundo(s) antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, intentos * 1000));
          }
        }
      }
      
      // Si fallaron todos los intentos
      if (!guardado) {
        console.error('❌ No se pudo guardar en Firestore después de', maxIntentos, 'intentos');
        console.log('🗑️ Eliminando usuario de Auth...');
        
        try {
          await user.delete();
          console.log('✅ Usuario eliminado de Auth');
        } catch (deleteError) {
          console.error('❌ Error al eliminar usuario:', deleteError);
        }
        
        throw new Error('No se pudieron guardar tus datos. ' + (ultimoError?.message || 'Intenta nuevamente.'));
      }
      
      // 4. Verificar que el documento existe
      console.log('🔍 Verificando documento...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const docVerify = await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .get();
      
      if (!docVerify.exists) {
        console.error('❌ Verificación falló');
        
        try {
          await user.delete();
        } catch (e) {}
        
        throw new Error('Error al verificar datos. Intenta nuevamente.');
      }
      
      console.log('✅✅✅ REGISTRO COMPLETADO');
      return user;
      
    } catch (error) {
      console.error('❌ Error en registro:', error.code, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email ya está registrado');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña es demasiado débil');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // LOGIN
  // ============================================
  static async login(email, password) {
    try {
      console.log('🔐 Iniciando login para:', email);
      
      if (!email || !password) {
        throw new Error('Email y contraseña son obligatorios');
      }
      
      const userCredential = await firebase.auth()
        .signInWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      console.log('✅ Auth exitoso. UID:', user.uid);
      
      const docRef = firebase.firestore()
        .collection('usuarios')
        .doc(user.uid);
      
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.error('❌ Usuario no existe en Firestore');
        await firebase.auth().signOut();
        throw new Error('Usuario no encontrado. Contacta al administrador.');
      }
      
      const userData = doc.data();
      console.log('✅ Datos obtenidos');
      
      if (userData.activo === false) {
        await firebase.auth().signOut();
        throw new Error('Cuenta deshabilitada. Contacta al administrador.');
      }
      
      try {
        await docRef.update({
          ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('⚠️ No se actualizó ultimaConexion');
      }
      
      console.log('✅✅✅ LOGIN COMPLETADO');
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
      
      const user = firebase.auth().currentUser;
      if (user) {
        console.log('Usuario actual:', user.email);
      }
      
      await firebase.auth().signOut();
      console.log('✅ Sesión cerrada');
      
      window.location.href = AppConfig.PAGES.LOGIN();
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  }
  
  // ============================================
  // OBSERVAR ESTADO DE AUTENTICACIÓN
  // ============================================
  static observarEstadoAuth(callback) {
    console.log('👁️ Iniciando observador...');
    
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log('👤 Usuario detectado:', user.email, user.uid);
        
        try {
          console.log('⏳ Esperando sincronización...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const doc = await firebase.firestore()
            .collection('usuarios')
            .doc(user.uid)
            .get();
          
          if (doc.exists) {
            const firestoreData = doc.data();
            console.log('✅ Datos Firestore obtenidos');
            
            const fullUserData = {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              ...firestoreData
            };
            
            callback(fullUserData);
          } else {
            console.error('❌ Documento no existe:', user.uid);
            console.log('🚪 Cerrando sesión...');
            await firebase.auth().signOut();
            callback(null);
          }
        } catch (error) {
          console.error('❌ Error obteniendo datos:', error.code, error.message);
          
          if (error.code === 'permission-denied') {
            console.error('⚠️ Error de permisos');
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
      console.log('🚫 No hay usuario');
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
        console.log('✅ Datos encontrados');
        return data;
      } else {
        console.error('❌ No se encontró documento');
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
        return { success: true, message: 'Email ya verificado' };
      }
      
      console.log('📧 Enviando email a:', user.email);
      
      await user.sendEmailVerification({
        url: window.location.origin + AppConfig.PAGES.LOGIN(),
        handleCodeInApp: false
      });
      
      console.log('✅ Email reenviado');
      return { success: true, message: 'Email enviado' };
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Espera unos minutos.');
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
        throw new Error('Email obligatorio');
      }
      
      console.log('🔑 Enviando email de recuperación:', email);
      
      await firebase.auth().sendPasswordResetEmail(email, {
        url: window.location.origin + AppConfig.PAGES.LOGIN(),
        handleCodeInApp: false
      });
      
      console.log('✅ Email enviado');
      return { success: true, message: 'Email enviado' };
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe cuenta con este email');
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
      console.log('📝 Actualizando perfil:', uid);
      
      const camposPermitidos = ['nombre', 'telefono'];
      const datosLimpios = {};
      
      for (const key of camposPermitidos) {
        if (datos.hasOwnProperty(key)) {
          datosLimpios[key] = datos[key];
        }
      }
      
      if (Object.keys(datosLimpios).length === 0) {
        throw new Error('No hay datos válidos');
      }
      
      await firebase.firestore()
        .collection('usuarios')
        .doc(uid)
        .update(datosLimpios);
      
      console.log('✅ Perfil actualizado');
      return { success: true, message: 'Perfil actualizado' };
      
    } catch (error) {
      console.error('❌ Error:', error);
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
      
      console.log('🔑 Cambiando contraseña:', user.email);
      
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        passwordActual
      );
      
      await user.reauthenticateWithCredential(credential);
      console.log('✅ Re-autenticación exitosa');
      
      await user.updatePassword(passwordNueva);
      console.log('✅ Contraseña actualizada');
      
      return { success: true, message: 'Contraseña actualizada' };
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña actual incorrecta');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Nueva contraseña demasiado débil');
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
      console.error('❌ Error:', error);
      return false;
    }
  }
  
  // ============================================
  // PROTEGER PÁGINA
  // ============================================
  static protegerPagina(requiereAdmin = false) {
    console.log('🔒 Protegiendo página. Admin:', requiereAdmin);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        unsubscribe();
        
        if (!user) {
          console.log('🚫 No autenticado');
          window.location.href = AppConfig.PAGES.LOGIN();
          reject(new Error('No autenticado'));
          return;
        }
        
        console.log('✅ Usuario autenticado:', user.email);
        
        if (requiereAdmin) {
          console.log('🔐 Verificando admin...');
          const esAdmin = await this.isAdmin(user.uid);
          
          if (!esAdmin) {
            console.log('🚫 No es admin');
            window.location.href = AppConfig.PAGES.PERFIL();
            reject(new Error('No autorizado'));
            return;
          }
          
          console.log('✅ Es admin');
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
      
      console.log('⚠️ Eliminando cuenta:', user.email);
      
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
      );
      
      await user.reauthenticateWithCredential(credential);
      console.log('✅ Re-autenticación exitosa');
      
      await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .delete();
      
      console.log('✅ Datos Firestore eliminados');
      
      await user.delete();
      console.log('✅ Cuenta Auth eliminada');
      
      window.location.href = AppConfig.PAGES.HOME();
      
      return { success: true, message: 'Cuenta eliminada' };
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      }
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Debes iniciar sesión nuevamente');
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
      console.error('❌ Error:', error);
      throw error;
    }
  }
}

console.log('✅ AuthService cargado correctamente');
