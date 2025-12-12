/**
 * ============================================
 * ENV.JS - CONFIGURACIÓN DE ENTORNO
 * ============================================
 * Detecta automáticamente el entorno y configura rutas
 * NO modificar a menos que cambies de hosting
 */

const ENV = {
  // Detectar entorno
  get hostname() {
    return window.location.hostname;
  },
  
  get protocol() {
    return window.location.protocol;
  },
  
get isDev() {
  return this.hostname === 'localhost' || 
         this.hostname === '127.0.0.1' || 
         this.protocol === 'file:';  // ⬅️ AGREGAR ESTA LÍNEA
},
  
  get isGitHub() {
    return this.hostname.includes('github.io');
  },
  
  get isProd() {
    return !this.isDev && !this.isGitHub;
  },
  
  // Base path según entorno
  getBasePath() {
    if (this.isDev) return '';
    if (this.isGitHub) return '/hospitalidad_en_accion';
    return ''; // Dominio propio
  },
  
  // URLs base
  get BASE_URL() {
    return `${this.protocol}//${this.hostname}${this.getBasePath()}`;
  },
  
  get ASSETS_URL() {
    return `${this.getBasePath()}/assets`;
  },
  
  get IMAGES_URL() {
    return `${this.ASSETS_URL}/images`;
  },
  
  get DATA_URL() {
    return `${this.getBasePath()}/data`;
  },
  
  get PAGES_URL() {
    return `${this.getBasePath()}/pages`;
  },
  
  // Helpers para construir rutas
  asset(path) {
    return `${this.ASSETS_URL}${path.startsWith('/') ? path : '/' + path}`;
  },
  
  image(path) {
    return `${this.IMAGES_URL}${path.startsWith('/') ? path : '/' + path}`;
  },
  
  data(path) {
    return `${this.DATA_URL}${path.startsWith('/') ? path : '/' + path}`;
  },
  
  page(path) {
    return `${this.PAGES_URL}${path.startsWith('/') ? path : '/' + path}`;
  },
  
  // Info de debug
  getInfo() {
    return {
      entorno: this.isDev ? 'Desarrollo' : this.isGitHub ? 'GitHub Pages' : 'Producción',
      hostname: this.hostname,
      basePath: this.getBasePath(),
      baseURL: this.BASE_URL
    };
  },
  
  // Log de inicialización
  init() {
    const info = this.getInfo();
    console.log('🌍 ENV inicializado:', info);
    
    // Warning si estamos en GitHub pero las rutas no coinciden
    if (this.isGitHub && !window.location.pathname.startsWith('/hospitalidad_en_accion')) {
      console.warn('⚠️ Estás en GitHub Pages pero la ruta no empieza con /hospitalidad_en_accion');
    }
  }
};

// Auto-inicializar
ENV.init();

// Exportar para uso global
window.ENV = ENV;

console.log('✅ env.js cargado correctamente');
