// ============================================
// APP-CONFIG.JS - Configuración Central
// ============================================

const AppConfig = {
  // Detectar automáticamente si estamos en GitHub Pages o dominio propio
  getBasePath() {
    const hostname = window.location.hostname;
    
    // Si es GitHub Pages
    if (hostname.includes('github.io')) {
      return '/hospitalidad_en_accion';
    }
    
    // Si es dominio propio (ej: www.hospitalidad.com)
    return '';
  },
  
  // URLs automáticas
  get BASE_URL() {
    return this.getBasePath();
  },
  
  get ASSETS_URL() {
    return `${this.BASE_URL}/assets`;
  },
  
  get IMAGES_URL() {
    return `${this.ASSETS_URL}/images`;
  },
  
  get DATA_URL() {
    return `${this.BASE_URL}/data`;
  },
  
  // Rutas de páginas
  PAGES: {
    HOME: () => `${AppConfig.BASE_URL}/index.html`,
    EVENTOS: () => `${AppConfig.BASE_URL}/pages/eventos.html`,
    EVENTO_DETALLE: () => `${AppConfig.BASE_URL}/pages/evento-detalle.html`,
    LOGIN: () => `${AppConfig.BASE_URL}/pages/auth/login.html`,
    REGISTER: () => `${AppConfig.BASE_URL}/pages/auth/register.html`,
    PERFIL: () => `${AppConfig.BASE_URL}/pages/user/perfil.html`,
  },
  
  // Helpers para imágenes
  getImageUrl(relativePath) {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    
    // Si ya tiene el base path, no agregarlo de nuevo
    if (relativePath.startsWith(this.BASE_URL)) {
      return relativePath;
    }
    
    // Si empieza con /, agregar base path
    if (relativePath.startsWith('/')) {
      return `${this.BASE_URL}${relativePath}`;
    }
    
    // Si no, asumir que es relativa desde images
    return `${this.IMAGES_URL}/${relativePath}`;
  },
  
  // Helper para JSON
  getDataUrl(jsonFile) {
    return `${this.DATA_URL}/${jsonFile}`;
  }
};

// Log para debug
console.log('📍 Base URL detectada:', AppConfig.BASE_URL);
console.log('🖼️ Images URL:', AppConfig.IMAGES_URL);
console.log('📊 Data URL:', AppConfig.DATA_URL);
