/**
 * ============================================
 * HELPERS.JS - Funciones Helper Generales
 * ============================================
 * Utilidades comunes para toda la aplicación
 * Integrado con ENV, ROUTES y CONSTANTS
 */

const Helpers = {
  
  // ============================================
  // DOM MANIPULATION
  // ============================================
  
  /**
   * Obtener parámetros de la URL
   * @returns {Object} Objeto con todos los parámetros
   */
  getURLParams() {
    return ROUTES.getQueryParams();
  },
  
  /**
   * Obtener un parámetro específico de la URL
   * @param {string} key - Nombre del parámetro
   * @returns {string|null} Valor del parámetro o null
   */
  getURLParam(key) {
    const params = this.getURLParams();
    return params[key] || null;
  },
  
  /**
   * Scroll suave a un elemento
   * @param {string} elementId - ID del elemento
   * @param {number} offset - Offset en píxeles (negativo para subir)
   */
  scrollTo(elementId, offset = 0) {
    const element = document.getElementById(elementId);
    if (!element) {
      this.logWarning('scrollTo', `Elemento no encontrado: ${elementId}`);
      return;
    }
    
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
   * @param {string} elementId - ID del elemento
   * @param {string} className - Nombre de la clase
   */
  toggleClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle(className);
    }
  },
  
  /**
   * Mostrar/Ocultar elemento
   * @param {string} elementId - ID del elemento
   */
  toggle(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.display = element.style.display === 'none' ? '' : 'none';
  },
  
  /**
   * Mostrar elemento
   * @param {string} elementId - ID del elemento
   * @param {string} displayType - Tipo de display (block, flex, grid, etc)
   */
  show(elementId, displayType = 'block') {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = displayType;
    }
  },
  
  /**
   * Ocultar elemento
   * @param {string} elementId - ID del elemento
   */
  hide(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'none';
    }
  },
  
  // ============================================
  // LOADING STATES
  // ============================================
  
  /**
   * Mostrar indicador de carga en un elemento
   * @param {string} elementId - ID del elemento
   * @param {string} mensaje - Mensaje a mostrar
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
   * @param {string} elementId - ID del elemento
   * @param {string} mensaje - Mensaje a mostrar
   * @param {string} icono - Clase del icono FontAwesome
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
   * @param {string} elementId - ID del elemento
   * @param {string} mensaje - Mensaje de error
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
  // CLIPBOARD
  // ============================================
  
  /**
   * Copiar texto al portapapeles
   * @param {string} text - Texto a copiar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.debug('Texto copiado al portapapeles', text);
      return { success: true, message: 'Copiado al portapapeles' };
    } catch (error) {
      this.logError(error, 'copyToClipboard');
      return { success: false, message: 'Error al copiar' };
    }
  },
  
  /**
   * Copiar contenido de un elemento al portapapeles
   * @param {string} elementId - ID del elemento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async copyElementText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      return { success: false, message: 'Elemento no encontrado' };
    }
    
    return this.copyToClipboard(element.textContent);
  },
  
  // ============================================
  // DOWNLOAD
  // ============================================
  
  /**
   * Descargar texto como archivo
   * @param {string} text - Contenido del archivo
   * @param {string} filename - Nombre del archivo
   * @param {string} mimeType - Tipo MIME
   */
  downloadText(text, filename, mimeType = 'text/plain') {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    this.debug('Archivo descargado', filename);
  },
  
  /**
   * Descargar JSON
   * @param {Object} data - Datos a descargar
   * @param {string} filename - Nombre del archivo
   */
  downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    this.downloadText(json, filename, 'application/json');
  },
  
  // ============================================
  // TIMING UTILITIES
  // ============================================
  
  /**
   * Delay (espera asíncrona)
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Debounce - Ejecutar función después de un tiempo sin llamadas
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función debounced
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
   * @param {Function} func - Función a ejecutar
   * @param {number} limit - Tiempo mínimo entre ejecuciones en ms
   * @returns {Function} Función throttled
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // ============================================
  // IMAGE MANAGEMENT
  // ============================================
  
  /**
   * Obtener ruta de imagen con fallback automático
   * @param {string} type - Tipo: 'expositor', 'evento', 'hotel', 'cochera'
   * @param {string} path - Ruta relativa de la imagen
   * @param {boolean} useFallback - Usar imagen placeholder si no existe
   * @returns {string} URL completa de la imagen
   */
  getImagePath(type, path, useFallback = true) {
    if (!path) {
      return this._getFallbackImage(type);
    }
    
    // Si ya viene con ruta completa, usar ENV.image()
    if (path.startsWith('/assets/images') || path.startsWith('assets/images')) {
      return ENV.image(path.replace(/^\/?(assets\/images)?/, ''));
    }
    
    // Construir según tipo
    let fullPath;
    switch(type) {
      case 'expositor':
        fullPath = `/expositores/${path}`;
        break;
      case 'evento':
        fullPath = `/eventos/${path}`;
        break;
      case 'hotel':
        fullPath = `/hoteles/${path}`;
        break;
      case 'cochera':
        fullPath = `/cocheras/${path}`;
        break;
      default:
        fullPath = `/${path}`;
    }
    
    return ENV.image(fullPath);
  },
  
  /**
   * Obtener imagen de expositor con fallback
   * @param {string} filename - Nombre del archivo (ej: "pastor-juan-perez.jpg")
   * @returns {string} URL de la imagen
   */
  getExpositorImage(filename) {
    if (!filename) {
      return this.getImagePath('expositor', 'placeholder-speaker.jpg');
    }
    return this.getImagePath('expositor', filename);
  },
  
  /**
   * Obtener imagen de evento
   * @param {number} año - Año del evento
   * @param {string} mes - Mes en formato slug (ej: "02-febrero")
   * @param {string} slug - Slug del evento
   * @param {string} imageName - Nombre de la imagen
   * @returns {string} URL de la imagen
   */
  getEventoImage(año, mes, slug, imageName) {
    const path = `${año}/${mes}/${slug}/${imageName}`;
    return this.getImagePath('evento', path);
  },
  
  /**
   * Obtener imagen de hotel
   * @param {string} ciudad - Ciudad en slug
   * @param {string} slug - Slug del hotel
   * @param {string} imageName - Nombre de la imagen
   * @returns {string} URL de la imagen
   */
  getHotelImage(ciudad, slug, imageName) {
    const path = `${ciudad}/${slug}/${imageName}`;
    return this.getImagePath('hotel', path);
  },
  
  /**
   * Obtener imagen de cochera
   * @param {string} ciudad - Ciudad en slug
   * @param {string} slug - Slug de la cochera
   * @param {string} imageName - Nombre de la imagen
   * @returns {string} URL de la imagen
   */
  getCocheraImage(ciudad, slug, imageName) {
    const path = `${ciudad}/${slug}/${imageName}`;
    return this.getImagePath('cochera', path);
  },
  
  /**
   * Verificar si una imagen existe
   * @param {string} url - URL de la imagen
   * @returns {Promise<boolean>}
   */
  async checkImageExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      this.debug('Imagen no existe', url);
      return false;
    }
  },
  
  /**
   * Obtener imagen placeholder según tipo
   * @private
   * @param {string} type - Tipo de imagen
   * @returns {string} URL del placeholder
   */
  _getFallbackImage(type) {
    const fallbacks = {
      'expositor': ENV.image('/expositores/placeholder-speaker.jpg'),
      'evento': ENV.image('/eventos/placeholder-event.jpg'),
      'hotel': ENV.image('/hoteles/placeholder-hotel.jpg'),
      'cochera': ENV.image('/cocheras/placeholder-parking.jpg')
    };
    
    return fallbacks[type] || ENV.image('/placeholder.jpg');
  },
  
  // ============================================
  // SLUGIFY HELPERS
  // ============================================
  
  /**
   * Convertir texto a slug
   * @param {string} text - Texto a convertir
   * @returns {string} Slug generado
   * @example
   * slugify("Pastor Juan Pérez") // "pastor-juan-perez"
   */
  slugify(text) {
    if (!text) return '';
    
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD') // Normalizar caracteres Unicode
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/fin
  },
  
  /**
   * Convertir slug a texto legible
   * @param {string} slug - Slug a convertir
   * @returns {string} Texto formateado
   * @example
   * unslugify("pastor-juan-perez") // "Pastor Juan Perez"
   */
  unslugify(slug) {
    if (!slug) return '';
    
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  },
  
  /**
   * Generar slug desde nombre
   * @param {string} text - Texto a convertir
   * @returns {string} Slug único
   */
  generateSlug(text) {
    return this.slugify(text);
  },
  
  // ============================================
  // ARRAY & DATA HELPERS
  // ============================================
  
  /**
   * Ordenar array por campo
   * @param {Array} array - Array a ordenar
   * @param {string} field - Campo por el cual ordenar
   * @param {string} order - 'asc' o 'desc'
   * @returns {Array} Array ordenado
   */
  sortByField(array, field, order = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
      const aVal = this._getNestedValue(a, field);
      const bVal = this._getNestedValue(b, field);
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return order === 'asc' ? comparison : -comparison;
    });
  },
  
  /**
   * Agrupar array por campo
   * @param {Array} array - Array a agrupar
   * @param {string} key - Campo por el cual agrupar
   * @returns {Object} Objeto agrupado
   */
  groupBy(array, key) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((result, item) => {
      const group = this._getNestedValue(item, key);
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  },
  
  /**
   * Filtrar valores únicos por campo
   * @param {Array} array - Array a filtrar
   * @param {string} key - Campo único
   * @returns {Array} Array sin duplicados
   */
  filterUnique(array, key) {
    if (!Array.isArray(array)) return [];
    
    const seen = new Set();
    return array.filter(item => {
      const value = this._getNestedValue(item, key);
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },
  
  /**
   * Extraer un campo de todos los elementos
   * @param {Array} array - Array fuente
   * @param {string} key - Campo a extraer
   * @returns {Array} Array de valores
   */
  pluck(array, key) {
    if (!Array.isArray(array)) return [];
    
    return array.map(item => this._getNestedValue(item, key));
  },
  
  /**
   * Dividir array en chunks
   * @param {Array} array - Array a dividir
   * @param {number} size - Tamaño de cada chunk
   * @returns {Array} Array de arrays
   */
  chunk(array, size) {
    if (!Array.isArray(array)) return [];
    
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  /**
   * Obtener valor anidado de un objeto
   * @private
   * @param {Object} obj - Objeto fuente
   * @param {string} path - Ruta del campo (ej: "ubicacion.ciudad")
   * @returns {*} Valor encontrado
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  },
  
  // ============================================
  // WHATSAPP HELPER
  // ============================================
  
  /**
   * Generar enlace de WhatsApp
   * @param {string} numero - Número de teléfono
   * @param {string} mensaje - Mensaje predefinido (opcional)
   * @returns {string} URL de WhatsApp
   */
  getWhatsAppLink(numero, mensaje = '') {
    if (!numero) return '#';
    
    const numeroLimpio = numero.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    return `https://wa.me/${numeroLimpio}${mensaje ? '?text=' + mensajeCodificado : ''}`;
  },
  
  // ============================================
  // DEBUG SYSTEM
  // ============================================
  
  /**
   * Log de debug (solo en desarrollo)
   * @param {string} message - Mensaje
   * @param {*} data - Datos adicionales
   * @param {string} level - Nivel: 'info', 'warn', 'error'
   */
  debug(message, data = null, level = 'info') {
    if (!ENV.isDev) return;
    
    const emoji = {
      info: '🔍',
      warn: '⚠️',
      error: '❌'
    };
    
    const style = `color: ${level === 'error' ? '#ef4444' : level === 'warn' ? '#f59e0b' : '#3b82f6'}; font-weight: bold;`;
    
    console.log(`%c${emoji[level]} [Helpers] ${message}`, style);
    if (data !== null) {
      console.log(data);
    }
  },
  
  /**
   * Log de error
   * @param {Error} error - Objeto de error
   * @param {string} context - Contexto donde ocurrió
   */
  logError(error, context = 'Unknown') {
    const errorData = {
      context: context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    if (ENV.isDev) {
      console.error('❌ [Helpers Error]', errorData);
    } else {
      // En producción, podrías enviar a un servicio de logging
      console.error('Error:', error.message);
    }
  },
  
  /**
   * Log de advertencia
   * @param {string} context - Contexto
   * @param {string} message - Mensaje
   */
  logWarning(context, message) {
    if (ENV.isDev) {
      console.warn(`⚠️ [Helpers Warning] ${context}:`, message);
    }
  },
  
  // ============================================
  // RANDOM UTILITIES
  // ============================================
  
  /**
   * Generar ID único
   * @returns {string} ID único
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  /**
   * Truncar texto
   * @param {string} text - Texto a truncar
   * @param {number} length - Longitud máxima
   * @param {string} suffix - Sufijo (ej: "...")
   * @returns {string} Texto truncado
   */
  truncate(text, length = 100, suffix = '...') {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  },
  
  /**
   * Capitalizar primera letra
   * @param {string} text - Texto
   * @returns {string} Texto capitalizado
   */
  capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },
  
  /**
   * Formatear número con separadores de miles
   * @param {number} num - Número
   * @returns {string} Número formateado
   */
  formatNumber(num) {
    return new Intl.NumberFormat('es-PE').format(num);
  },
  
  /**
   * Escapar HTML
   * @param {string} text - Texto con posible HTML
   * @returns {string} Texto escapado
   */
  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Exportar globalmente
window.Helpers = Helpers;

// Log de inicialización
if (ENV.isDev) {
  console.log('✅ helpers.js cargado correctamente');
  console.log('📦 Helpers disponibles:', Object.keys(Helpers).length, 'funciones');
}
