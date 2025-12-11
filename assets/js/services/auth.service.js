static async logout() {
  try {
    console.log('👋 Cerrando sesión...');
    await firebase.auth().signOut();
    console.log('✅ Sesión cerrada');
    window.location.href = AppConfig.PAGES.LOGIN();
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    throw error;
  }
}

static protegerPagina(requiereAdmin = false) {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      unsubscribe();
      
      if (!user) {
        console.log('🚫 No autenticado, redirigiendo...');
        window.location.href = AppConfig.PAGES.LOGIN();
        reject('No autenticado');
        return;
      }
      
      if (requiereAdmin) {
        const esAdmin = await this.isAdmin(user.uid);
        if (!esAdmin) {
          console.log('🚫 No es admin');
          window.location.href = AppConfig.PAGES.PERFIL();
          reject('No autorizado');
          return;
        }
      }
      
      resolve(user);
    });
  });
}
