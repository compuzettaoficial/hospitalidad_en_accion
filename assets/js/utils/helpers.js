/**
 * ============================================
 * HELPERS.JS - Funciones Helper Generales
 * ============================================
 */

const Helpers = {
  
  // ============================================
  // DOM
  // ============================================
  
  /**
   * Obtener parámetros de la URL
   */
  getURLParams() {
    return ROUTES.getQueryParams();
  },
  
  /**
   * Obtener un parámetro específico de la URL
   */
  getURLParam(key) {
    const params = this.getURLParams();
    return params[key] || null;
  },
  
  /**
   * Scroll suave a un elemento
   */
  scrollTo(elementId, offset = 0) {
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
  },
  
  /**
   * Toggle clase en un elemento
   */
  toggleClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle(className);
    }
  },
  
  /**
   * Mostrar/Ocultar elemento
   */
  toggle(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.display = element.style.display === 'none' ? '' : 'none';
  },
  
  /**
   * Mostrar elemento
   */
  show(elementId, displayType = 'block') {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = displayType;
    }
  },
  
  /**
   * Ocultar elemento
   */
  hide(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'none';
    }
  },
  
  // ============================================
  // LOADING
  // ============================================
  
  /**
   * Mostrar indicador de carga en un elemento
   */
  showLoading(elementId, mensaje = 'Cargando...') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i> ${mensaje}
      </div>
    `;
  },
  
  /**
   * Mostrar estado vacío
   */
  showEmpty(elementId, mensaje = 'No hay resultados', icono = 'fa-inbox') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
      <div class="empty-state">
        <i class="fas ${icono}"></i>
        <p>${mensaje}</p>
      </div>
    `;
  },
  
  /**
   * Mostrar error
   */
  showError(elementId, mensaje = 'Ocurrió un error') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `
      <div class="alert alert-error">
        <i class="fas fa-exclamation-circle"></i>
        ${mensaje}
      </div>
    `;
  },
  
  // ============================================
  // COPIAR AL PORTAPAPELES
  // ============================================
  
  /**
   * Copiar texto al portapapeles
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, message: 'Copiado al portapapeles' };
    } catch (error) {
      console.error('Error copiando:', error);
      return { success: false, message: 'Error al copiar' };
    }
  },
  
  /**
   * Copiar contenido de un elemento al portapapeles
   */
  async copyElementText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      return { success: false, message: 'Elemento no encontrado' };
    }
    
    return this.copyToClipboard(element.textContent);
  },
  
  // ============================================
  // DESCARGAR
  // ============================================
  
  /**
   * Descargar texto como archivo
   */
  downloadText(text, filename, mimeType = 'text/plain') {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  /**
   * Descargar JSON
   */
  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    this.downloadText(json, filename, 'application/json');
  },
  
  // ============================================
  // DELAY
  // ============================================
  
  /**
   * Delay (espera)
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Debounce - Ejecutar función después de un tiempo sin llamadas
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  /**
   * Throttle - Limitar frecuencia de ejecución
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...
