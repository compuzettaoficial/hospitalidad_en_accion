/**
 * ============================================
 * ROUTES.JS - MAPEO DE RUTAS
 * ============================================
 * Todas las rutas del sitio centralizadas
 * Usa ENV para construir rutas dinámicas
 */

const ROUTES = {
  
  // ============================================
  // PÁGINAS PÚBLICAS
  // ============================================
  HOME: () => `${ENV.getBasePath()}/pages/home.html`,
  
  EVENTOS: {
    LISTA: () => `${ENV.page('/eventos/lista.html')}`,
    DETALLE: (id) => `${ENV.page('/eventos/detalle.html')}${id ? '?id=' + id : ''}`
  },
  
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  AUTH: {
    LOGIN: () => `${ENV.page('/auth/login.html')}`,
    REGISTER: () => `${ENV.page('/auth/register.html')}`,
    RECUPERAR: () => `${ENV.page('/auth/recuperar.html')}`
  },
  
  // ============================================
  // USUARIO
  // ============================================
  USER: {
    DASHBOARD: () => `${ENV.page('/user/dashboard.html')}`,
    
    PERFIL: {
      INDEX: () => `${ENV.page('/user/perfil/index.html')}`,
      EDITAR: () => `${ENV.page('/user/perfil/editar.html')}`,
      SEGURIDAD: () => `${ENV.page('/user/perfil/seguridad.html')}`
    },
    
    HOSPITALIDAD: {
      SOLICITAR: (eventoId) => `${ENV.page('/user/hospitalidad/solicitar.html')}${eventoId ? '?eventoId=' + eventoId : ''}`,
      OFRECER: (eventoId) => `${ENV.page('/user/hospitalidad/ofrecer.html')}${eventoId ? '?eventoId=' + eventoId : ''}`,
      MIS_POSTULACIONES: () => `${ENV.page('/user/hospitalidad/mis-postulaciones.html')}`
    },
    
    EVENTOS: {
      MIS_EVENTOS: () => `${ENV.page('/user/eventos/mis-eventos.html')}`
    }
  },
  
  // ============================================
  // ADMIN
  // ============================================
  ADMIN: {
    DASHBOARD: () => `${ENV.page('/admin/dashboard.html')}`,
    
    EVENTOS: {
      LISTA: () => `${ENV.page('/admin/eventos/lista.html')}`,
      CREAR: () => `${ENV.page('/admin/eventos/crear.html')}`,
      EDITAR: (id) => `${ENV.page('/admin/eventos/editar.html')}${id ? '?id=' + id : ''}`
    },
    
    HOTELES: {
      LISTA: () => `${ENV.page('/admin/hoteles/lista.html')}`,
      CREAR: (eventoId) => `${ENV.page('/admin/hoteles/crear.html')}${eventoId ? '?eventoId=' + eventoId : ''}`,
      EDITAR: (id) => `${ENV.page('/admin/hoteles/editar.html')}${id ? '?id=' + id : ''}`
    },
    
    POSTULACIONES: {
      DASHBOARD: () => `${ENV.page('/admin/postulaciones/dashboard.html')}`,
      MATCHING: () => `${ENV.page('/admin/postulaciones/matching.html')}`
    },
    
    USUARIOS: {
      LISTA: () => `${ENV.page('/admin/usuarios/lista.html')}`
    }
  },
  
  // ============================================
  // API/DATA
  // ============================================
  DATA: {
    EVENTOS: {
      INDEX: () => `${ENV.data('/eventos/index.json')}`,
      BY_YEAR: (year) => `${ENV.data(`/eventos/${year}.json`)}`
    },
    
    HOTELES: {
      INDEX: () => `${ENV.data('/hoteles/index.json')}`,
      BY_CIUDAD: (ciudad) => `${ENV.data(`/hoteles/${ciudad.toLowerCase().replace(/\s+/g, '-')}.json`)}`
    },
    
    COCHERAS: {
      BY_CIUDAD: (ciudad) => `${ENV.data(`/cocheras/${ciudad.toLowerCase().replace(/\s+/g, '-')}.json`)}`
    },
    
    METADATA: {
      CIUDADES: () => `${ENV.data('/metadata/ciudades.json')}`
    }
  },
  
  // ============================================
  // ASSETS
  // ============================================
  ASSETS: {
    CSS: (file) => `${ENV.asset(`/css/${file}`)}`,
    JS: (file) => `${ENV.asset(`/js/${file}`)}`,
    IMAGE: (path) => `${ENV.image(path)}`
  },
  
  // ============================================
  // HELPERS
  // ============================================
  
  // Construir URL con query params
  buildURL(base, params = {}) {
    const url = new URL(base, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.pathname + url.search;
  },
  
  // Obtener query params de URL actual
  getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  },
  
  // Redirigir a una ruta
  navigate(url) {
    window.location.href = url;
  },
  
  // Recargar página actual
  reload() {
    window.location.reload();
  },
  
  // Volver atrás
  back() {
    window.history.back();
  }
};

// Exportar globalmente
window.ROUTES = ROUTES;

console.log('✅ routes.js cargado correctamente');
