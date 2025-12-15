// ============================================
// AUTH.SERVICE.JS - Servicio de AutenticaciÃ³n
// GestiÃ³n completa de usuarios con Firebase
// ============================================

class AuthService {
  
  // ============================================
  // REGISTRO DE NUEVO USUARIO
  // ============================================
  static async register(datos) {
    try {
      console.log('ðŸ“ Iniciando registro para:', datos.email);
      
      // Validaciones previas
      if (!datos.email || !datos.password || !datos.nombre || !datos.telefono) {
        throw new Error('Todos los campos son obligatorios');
      }
      
      if (datos.password.length < 6) {
        throw new Error('La contraseÃ±a debe tener al menos 6 caracteres');
      }
      
      // 1. Crear usuario en Firebase Auth
      console.log('ðŸ” Creando usuario en Firebase Auth...');
      const userCredential = await firebase.auth()
        .createUserWithEmailAndPassword(datos.email, datos.password);
      
      const user = userCredential.user;
      console.log('âœ… Usuario creado en Auth con UID:', user.uid);
      
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
          console.log(`ðŸ“ Intento ${intentos}/${maxIntentos} de guardar en Firestore...`);
          
          await firebase.firestore()
            .collection('usuarios')
            .doc(user.uid)
            .set(userData);

          guardado = true;
          console.log('âœ… Datos guardados exitosamente en Firestore');
          
        } catch (firestoreError) {
          ultimoError = firestoreError;
          console.error(`âŒ Error en intento ${intentos}:`, firestoreError.code || firestoreError);
          console.error('Mensaje:', firestoreError.message);

          if (intentos < maxIntentos) {
            console.log(`â³ Esperando ${intentos} segundo(s) antes de reintentar...`);
            await new Promise(resolve => setTimeout(resolve, intentos * 1000));
          }
        }
      }
      
      // Si fallaron todos los intentos
      if (!guardado) {
        console.error('âŒ No se pudo guardar en Firestore despuÃ©s de', maxIntentos, 'intentos');
        console.log('ðŸ—‘ï¸ Eliminando usuario de Auth...');
        
        try {
          await user.delete();
          console.log('âœ… Usuario eliminado de Auth');
        } catch (deleteError) {
          console.error('âŒ Error al eliminar usuario:', deleteError);
        }
        
        throw new Error('No se pudieron guardar tus datos. ' + (ultimoError?.message || 'Intenta nuevamente.'));
      }
      
      // 4. Verificar que el documento existe
      console.log('ðŸ” Verificando documento...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const docVerify = await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .get();
      
      if (!docVerify.exists) {
        console.error('âŒ VerificaciÃ³n fallÃ³');
        
        try {
          await user.delete();
        } catch (e) {}
        
        throw new Error('Error al verificar datos. Intenta nuevamente.');
      }
      
      console.log('âœ…âœ…âœ… REGISTRO COMPLETADO');
      return user;
      
    } catch (error) {
      console.error('âŒ Error en registro:', error.code, error.message);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email ya estÃ¡ registrado');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email invÃ¡lido');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('La contraseÃ±a es demasiado dÃ©bil');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // LOGIN
  // ============================================
  static async login(email, password) {
    try {
      console.log('ðŸ” Iniciando login para:', email);
      
      if (!email || !password) {
        throw new Error('Email y contraseÃ±a son obligatorios');
      }
      
      const userCredential = await firebase.auth()
        .signInWithEmailAndPassword(email, password);
      
      const user = userCredential.user;
      console.log('âœ… Auth exitoso. UID:', user.uid);
      
      const docRef = firebase.firestore()
        .collection('usuarios')
        .doc(user.uid);
      
      const doc = await docRef.get();
      
      if (!doc.exists) {
        console.error('âŒ Usuario no existe en Firestore');
        await firebase.auth().signOut();
        throw new Error('Usuario no encontrado. Contacta al administrador.');
      }
      
      const userData = doc.data();
      console.log('âœ… Datos obtenidos');
      
      if (userData.activo === false) {
        await firebase.auth().signOut();
        throw new Error('Cuenta deshabilitada. Contacta al administrador.');
      }
      
      try {
        await docRef.update({
          ultimaConexion: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('âš ï¸ No se actualizÃ³ ultimaConexion');
      }
      
      console.log('âœ…âœ…âœ… LOGIN COMPLETADO');
      return user;
      
    } catch (error) {
      console.error('âŒ Error en login:', error.code, error.message);
      throw error;
    }
  }
  
  // ============================================
  // LOGOUT
  // ============================================
  static async logout() {
    try {
      console.log('ðŸ‘‹ Cerrando sesiÃ³n...');
      
      const user = firebase.auth().currentUser;
      if (user) {
        console.log('Usuario actual:', user.email);
      }
      
      await firebase.auth().signOut();
      console.log('âœ… SesiÃ³n cerrada');
      
      window.location.href = AppConfig.PAGES.LOGIN();
      
    } catch (error) {
      console.error('âŒ Error al cerrar sesiÃ³n:', error);
      throw error;
    }
  }
  
  // ============================================
  // OBSERVAR ESTADO DE AUTENTICACIÃ“N
  // ============================================
  static observarEstadoAuth(callback) {
    console.log('ðŸ‘ï¸ Iniciando observador...');
    
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log('ðŸ‘¤ Usuario detectado:', user.email, user.uid);
        
        try {
          console.log('â³ Esperando sincronizaciÃ³n...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const doc = await firebase.firestore()
            .collection('usuarios')
            .doc(user.uid)
            .get();
          
          if (doc.exists) {
            const firestoreData = doc.data();
            console.log('âœ… Datos Firestore obtenidos');
            
            const fullUserData = {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              ...firestoreData
            };
            
            callback(fullUserData);
          } else {
            console.error('âŒ Documento no existe:', user.uid);
            console.log('ðŸšª Cerrando sesiÃ³n...');
            await firebase.auth().signOut();
            callback(null);
          }
        } catch (error) {
          console.error('âŒ Error obteniendo datos:', error.code, error.message);
          
          if (error.code === 'permission-denied') {
            console.error('âš ï¸ Error de permisos');
            await firebase.auth().signOut();
          }
          
          callback(null);
        }
      } else {
        console.log('ðŸš« No hay usuario autenticado');
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
      console.log('ðŸ‘¤ Usuario actual:', user.email);
      return user;
    } else {
      console.log('ðŸš« No hay usuario');
      return null;
    }
  }
  
  // ============================================
  // OBTENER DATOS DE FIRESTORE
  // ============================================
  static async getUserData(uid) {
    try {
      console.log('ðŸ“Š Obteniendo datos para UID:', uid);
      
      const doc = await firebase.firestore()
        .collection('usuarios')
        .doc(uid)
        .get();
      
      if (doc.exists) {
        const data = doc.data();
        console.log('âœ… Datos encontrados');
        return data;
      } else {
        console.error('âŒ No se encontrÃ³ documento');
        return null;
      }
    } catch (error) {
      console.error('âŒ Error obteniendo datos:', error);
      throw error;
    }
  }
  
  // ============================================
  // REENVIAR EMAIL DE VERIFICACIÃ“N
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
      
      console.log('ðŸ“§ Enviando email a:', user.email);
      
      await user.sendEmailVerification({
        url: window.location.origin + AppConfig.PAGES.LOGIN(),
        handleCodeInApp: false
      });
      
      console.log('âœ… Email reenviado');
      return { success: true, message: 'Email enviado' };
      
    } catch (error) {
      console.error('âŒ Error:', error);
      
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos. Espera unos minutos.');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // RESETEAR CONTRASEÃ‘A
  // ============================================
  static async resetPassword(email) {
    try {
      if (!email) {
        throw new Error('Email obligatorio');
      }
      
      console.log('ðŸ”‘ Enviando email de recuperaciÃ³n:', email);
      
      await firebase.auth().sendPasswordResetEmail(email, {
        url: window.location.origin + AppConfig.PAGES.LOGIN(),
        handleCodeInApp: false
      });
      
      console.log('âœ… Email enviado');
      return { success: true, message: 'Email enviado' };
      
    } catch (error) {
      console.error('âŒ Error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No existe cuenta con este email');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Email invÃ¡lido');
      }
      
      throw error;
    }
  }
  
  // ============================================
  // ACTUALIZAR PERFIL
  // ============================================
  static async actualizarPerfil(uid, datos) {
    try {
      console.log('ðŸ“ Actualizando perfil:', uid);
      
      const camposPermitidos = ['nombre', 'telefono'];
      const datosLimpios = {};
      
      for (const key of camposPermitidos) {
        if (datos.hasOwnProperty(key)) {
          datosLimpios[key] = datos[key];
        }
      }
      
      if (Object.keys(datosLimpios).length === 0) {
        throw new Error('No hay datos vÃ¡lidos');
      }
      
      await firebase.firestore()
        .collection('usuarios')
        .doc(uid)
        .update(datosLimpios);
      
      console.log('âœ… Perfil actualizado');
      return { success: true, message: 'Perfil actualizado' };
      
    } catch (error) {
      console.error('âŒ Error:', error);
      throw error;
    }
  }
  
  // ============================================
  // CAMBIAR CONTRASEÃ‘A
  // ============================================
  static async cambiarPassword(passwordActual, passwordNueva) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }
      
      console.log('ðŸ”‘ Cambiando contraseÃ±a:', user.email);
      
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        passwordActual
      );
      
      await user.reauthenticateWithCredential(credential);
      console.log('âœ… Re-autenticaciÃ³n exitosa');
      
      await user.updatePassword(passwordNueva);
      console.log('âœ… ContraseÃ±a actualizada');
      
      return { success: true, message: 'ContraseÃ±a actualizada' };
      
    } catch (error) {
      console.error('âŒ Error:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('ContraseÃ±a actual incorrecta');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Nueva contraseÃ±a demasiado dÃ©bil');
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
      console.log('ðŸ” Â¿Es admin?:', esAdmin);
      return esAdmin;
    } catch (error) {
      console.error('âŒ Error:', error);
      return false;
    }
  }
  
  // ============================================
  // PROTEGER PÃGINA
  // ============================================
  static protegerPagina(requiereAdmin = false) {
    console.log('ðŸ”’ Protegiendo pÃ¡gina. Admin:', requiereAdmin);
    
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        unsubscribe();
        
        if (!user) {
          console.log('ðŸš« No autenticado');
          window.location.href = AppConfig.PAGES.LOGIN();
          reject(new Error('No autenticado'));
          return;
        }
        
        console.log('âœ… Usuario autenticado:', user.email);
        
        if (requiereAdmin) {
          console.log('ðŸ” Verificando admin...');
          const esAdmin = await this.isAdmin(user.uid);
          
          if (!esAdmin) {
            console.log('ðŸš« No es admin');
            window.location.href = AppConfig.PAGES.PERFIL();
            reject(new Error('No autorizado'));
            return;
          }
          
          console.log('âœ… Es admin');
        }
        
        console.log('âœ… Acceso permitido');
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
      
      console.log('âš ï¸ Eliminando cuenta:', user.email);
      
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
      );
      
      await user.reauthenticateWithCredential(credential);
      console.log('âœ… Re-autenticaciÃ³n exitosa');
      
      await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .delete();
      
      console.log('âœ… Datos Firestore eliminados');
      
      await user.delete();
      console.log('âœ… Cuenta Auth eliminada');
      
      window.location.href = AppConfig.PAGES.HOME();
      
      return { success: true, message: 'Cuenta eliminada' };
      
    } catch (error) {
      console.error('âŒ Error:', error);
      
      if (error.code === 'auth/wrong-password') {
        throw new Error('ContraseÃ±a incorrecta');
      }
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Debes iniciar sesiÃ³n nuevamente');
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
        console.log('âœ… Token refrescado');
        return token;
      }
      return null;
    } catch (error) {
      console.error('âŒ Error:', error);
      throw error;
    }
  }
}

console.log('âœ… AuthService cargado correctamente');
