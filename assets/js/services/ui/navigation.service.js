
/**
 * ============================================
 * NAVIGATION.SERVICE.JS - Servicio de Navegación
 * ============================================
 * Gestión de navegación y rutas en la aplicación
 */

const NavigationService = {
  
  // ============================================
  // NAVEGACIÓN BÁSICA
  // ============================================
  
  /**
   * Navegar a una URL
   * @param {string} url - URL destino
   * @param {boolean} newTab - Abrir en nueva pestaña
   */
  goto(url, newTab = false) {
    if (newTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  },
  
  /**
   * Navegar a la página de inicio
   */
  goHome() {
    this.goto(ROUTES.HOME());
  },
  
  /**
   * Volver atrás
   */
  goBack() {
    window.history.back();
  },
  
  /**
   * Recargar página
   */
  reload() {
    window.location.reload();
  },
  
  // ============================================
  // NAVEGACIÓN CON AUTENTICACIÓN
  // ============================================
  
  /**
   * Navegar a login
   * @param {string} returnUrl - URL de retorno después del login
   */
  goLogin(returnUrl = null) {
    const url = ROUTES.AUTH.LOGIN();
    
    if (returnUrl) {
      this.goto(ROUTES.buildURL(url, { returnUrl }));
    } else {
      this.goto(url);
    }
  },
  
  /**
   * Navegar a registro
   */
  goRegister() {
    this.goto(ROUTES.AUTH.REGISTER());
  },
  
  /**
   * Navegar a dashboard según rol
   * @param {string} rol - Rol del usuario
   */
  goDashboard(rol) {
    if (rol === CONSTANTS.ROLES.ADMIN || rol === CONSTANTS.ROLES.EDITOR) {
      this.goto(ROUTES.ADMIN.DASHBOARD());
    } else {
      this.goto(ROUTES.USER.DASHBOARD());
    }
  },
  
  /**
   * Navegar a perfil
   */
  goPerfil() {
    this.goto(ROUTES.USER.PERFIL.INDEX());
  },
  
  // ============================================
  // NAVEGACIÓN DE EVENTOS
  // ============================================
  
  /**
   * Navegar a lista de eventos
   */
  goEventos() {
    this.goto(ROUTES.EVENTOS.LISTA());
  },
  
  /**
   * Navegar a detalle de evento
   * @param {string} eventoId - ID del evento
   */
  goEventoDetalle(eventoId) {
    this.goto(ROUTES.EVENTOS.DETALLE(eventoId));
  },
  
  /**
   * Navegar a postular como visitante
   * @param {string} eventoId - ID del evento
   */
  goPostularVisitante(eventoId) {
    const user = firebase.auth().currentUser;
    
    if (!user) {
      this.goLogin(ROUTES.USER.HOSPITALIDAD.SOLICITAR(eventoId));
      return;
    }
    
    this.goto(ROUTES.USER.HOSPITALIDAD.SOLICITAR(eventoId));
  },
  
  /**
   * Navegar a postular como anfitrión
   * @param {string} eventoId - ID del evento
   */
  goPostularAnfitrion(eventoId) {
    const user = firebase.auth().currentUser;
    
    if (!user) {
      this.goLogin(ROUTES.USER.HOSPITALIDAD.OFRECER(eventoId));
      return;
    }
    
    this.goto(ROUTES.USER.HOSPITALIDAD.OFRECER(eventoId));
  },
  
  // ============================================
  // NAVEGACIÓN ADMIN
  // ============================================
  
  /**
   * Navegar a crear evento
   */
  goCrearEvento() {
    this.goto(ROUTES.ADMIN.EVENTOS.CREAR());
  },
  
  /**
   * Navegar a editar evento
   * @param {string} eventoId - ID del evento
   */
  goEditarEvento(eventoId) {
    this.goto(ROUTES.ADMIN.EVENTOS.EDITAR(eventoId));
  },
  
  /**
   * Navegar a gestión de hoteles
   */
  goGestionHoteles() {
    this.goto(ROUTES.ADMIN.HOTELES.LISTA());
  },
  
  /**
   * Navegar a sistema de matching
   */
  goMatching() {
    this.goto(ROUTES.ADMIN.POSTULACIONES.MATCHING());
  },
  
  // ============================================
  // QUERY PARAMS
  // ============================================
  
  /**
   * Obtener parámetros de la URL actual
   * @returns {Object}
   */
  getParams() {
    return ROUTES.getQueryParams();
  },
  
  /**
   * Obtener un parámetro específico
   * @param {string} key - Nombre del parámetro
   * @returns {string|null}
   */
  getParam(key) {
    const params = this.getParams();
    return params[key] || null;
  },
  
  /**
   * Actualizar URL con nuevos parámetros sin recargar
   * @param {Object} params - Nuevos parámetros
   */
  updateParams(params) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, params[key]);
      }
    });
    
    window.history.pushState({}, '', url);
  },
  
  /**
   * Limpiar parámetros de la URL
   */
  clearParams() {
    const url = window.location.pathname;
    window.history.pushState({}, '', url);
  },
  
  // ============================================
  // BREADCRUMBS
  // ============================================
  
  /**
   * Generar breadcrumbs para la página actual
   * @returns {Array}
   */
  getBreadcrumbs() {
    const path = window.location.pathname.replace(ENV.getBasePath(), '');
    const segments = path.split('/').filter(s => s);
    
    const breadcrumbs = [{
      label: 'Inicio',
      url: ROUTES.HOME()
    }];
    
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += '/' + segment;
      
      // Mapear rutas a etiquetas
      const labels = {
        'eventos': 'Eventos',
        'auth': 'Autenticación',
        'user': 'Usuario',
        'admin': 'Administración',
        'perfil': 'Perfil',
        'hospitalidad': 'Hospitalidad',
        'postulaciones': 'Postulaciones',
        'hoteles': 'Hoteles'
      };
      
      const label = labels[segment] || this._capitalize(segment);
      
      breadcrumbs.push({
        label,
        url: ENV.getBasePath() + currentPath,
        active: index === segments.length - 1
      });
    });
    
    return breadcrumbs;
  },
  
  /**
   * Capitalizar texto
   * @private
   */
  _capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
  
  // ============================================
  // PROTECCIÓN DE RUTAS
  // ============================================
  
  /**
   * Verificar si el usuario puede acceder a una ruta
   * @param {string} requiredRol - Rol requerido (opcional)
   * @returns {Promise<boolean>}
   */
  async canAccess(requiredRol = null) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        return false;
      }
      
      if (!requiredRol) {
        return true;
      }
      
      const userData = await UsuariosService.getByUid(user.uid);
      
      if (!userData || !userData.activo) {
        return false;
      }
      
      // Admin tiene acceso a todo
      if (userData.rol === CONSTANTS.ROLES.ADMIN) {
        return true;
      }
      
      // Verificar rol específico
      if (requiredRol === CONSTANTS.ROLES.EDITOR) {
        return userData.rol === CONSTANTS.ROLES.EDITOR;
      }
      
      return userData.rol === requiredRol;
      
    } catch (error) {
      console.error('Error verificando acceso:', error);
      return false;
    }
  },
  
  /**
   * Proteger página actual
   * @param {string} requiredRol - Rol requerido (opcional)
   */
  async protectPage(requiredRol = null) {
    try {
      const user = firebase.auth().currentUser;
      
      if (!user) {
        this.goLogin(window.location.pathname);
        return;
      }
      
      if (requiredRol) {
        const hasAccess = await this.canAccess(requiredRol);
        
        if (!hasAccess) {
          Notify.error('No tienes permisos para acceder a esta página');
          this.goDashboard(CONSTANTS.ROLES.USER);
          return;
        }
      }
      
    } catch (error) {
      console.error('Error protegiendo página:', error);
      this.goLogin();
    }
  },
  
  // ============================================
  // ENLACES EXTERNOS
  // ============================================
  
  /**
   * Abrir Google Maps con dirección
   * @param {string} direccion - Dirección a buscar
   */
  openMaps(direccion) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  },
  
  /**
   * Abrir WhatsApp
   * @param {string} numero - Número de teléfono
   * @param {string} mensaje - Mensaje predefinido
   */
  openWhatsApp(numero, mensaje = '') {
    const url = Helpers.getWhatsAppLink(numero, mensaje);
    window.open(url, '_blank');
  },
  
  /**
   * Abrir email
   * @param {string} email - Dirección de email
   * @param {string} asunto - Asunto del email
   * @param {string} cuerpo - Cuerpo del email
   */
  openEmail(email, asunto = '', cuerpo = '') {
    const url = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = url;
  },
  
  /**
   * Hacer llamada telefónica
   * @param {string} numero - Número de teléfono
   */
  call(numero) {
    const numeroLimpio = numero.replace(/\D/g, '');
    window.location.href = `tel:${numeroLimpio}`;
  },
  
  // ============================================
  // HISTORIAL
  // ============================================
  
  /**
   * Verificar si hay historial previo
   * @returns {boolean}
   */
  hasHistory() {
    return window.history.length > 1;
  },
  
  /**
   * Obtener URL anterior (si existe en sessionStorage)
   * @returns {string|null}
   */
  getPreviousUrl() {
    return sessionStorage.getItem('previousUrl');
  },
  
  /**
   * Guardar URL actual como anterior
   */
  savePreviousUrl() {
    sessionStorage.setItem('previousUrl', window.location.href);
  },
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Verificar si estamos en una página específica
   * @param {string} pageName - Nombre de la página
   * @returns {boolean}
   */
  isPage(pageName) {
    const path = window.location.pathname.replace(ENV.getBasePath(), '');
    return path.includes(pageName);
  },
  
  /**
   * Obtener nombre de la página actual
   * @returns {string}
   */
  getCurrentPage() {
    const path = window.location.pathname.replace(ENV.getBasePath(), '');
    const segments = path.split('/').filter(s => s);
    return segments[segments.length - 1] || 'home';
  },
  
  /**
   * Scroll a un elemento de la página
   * @param {string} elementId - ID del elemento
   * @param {number} offset - Offset en píxeles
   */
  scrollTo(elementId, offset = -80) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  },
  
  /**
   * Scroll al inicio de la página
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Guardar URL anterior en cada cambio
window.addEventListener('beforeunload', () => {
  NavigationService.savePreviousUrl();
});

// Exportar globalmente
window.NavigationService = NavigationService;

console.log('✅ navigation.service.js cargado correctamente');
