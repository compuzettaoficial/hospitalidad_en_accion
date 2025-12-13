/**
 * ============================================
 * NOTIFICATIONS.JS - Sistema de Notificaciones Toast
 * ============================================
 * Sistema moderno de notificaciones con 4 tipos:
 * - Success (verde)
 * - Error (rojo)
 * - Warning (amarillo)
 * - Info (azul)
 * 
 * NOTA: Requiere notifications.css incluido en el HTML
 */

const Notify = {
  
  // Configuración por defecto
  defaults: {
    duration: 4000,           // Duración en ms (0 = no auto-cerrar)
    position: 'top-right',    // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    showProgress: true,       // Mostrar barra de progreso
    pauseOnHover: true,       // Pausar timer al pasar mouse
    closeButton: true,        // Mostrar botón cerrar
    maxNotifications: 5       // Máximo de notificaciones simultáneas
  },
  
  // Stack de notificaciones activas
  notifications: [],
  container: null,
  initialized: false,
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  /**
   * Inicializar el sistema de notificaciones
   */
  init() {
    if (this.initialized) return;
    
    // Verificar que el CSS esté cargado
    if (ENV.isDev) {
      this._checkStyles();
    }
    
    // Crear contenedor
    this.container = document.createElement('div');
    this.container.id = 'notify-container';
    this.container.className = `notify-container notify-${this.defaults.position}`;
    document.body.appendChild(this.container);
    
    this.initialized = true;
    
    if (ENV.isDev) {
      console.log('✅ Sistema de notificaciones inicializado');
    }
  },
  
  /**
   * Verificar que los estilos CSS estén cargados
   * @private
   */
  _checkStyles() {
    const testElement = document.createElement('div');
    testElement.className = 'notify-toast';
    testElement.style.visibility = 'hidden';
    testElement.style.position = 'absolute';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const hasStyles = styles.display === 'flex';
    
    document.body.removeChild(testElement);
    
    if (!hasStyles) {
      console.warn('⚠️ Notify: CSS no detectado. Incluye notifications.css en tu HTML');
    }
  },
  
  // ============================================
  // MÉTODOS PÚBLICOS
  // ============================================
  
  /**
   * Notificación de éxito
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales
   * @returns {string} ID de la notificación
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  },
  
  /**
   * Notificación de error
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales
   * @returns {string} ID de la notificación
   */
  error(message, options = {}) {
    return this.show(message, 'error', options);
  },
  
  /**
   * Notificación de advertencia
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales
   * @returns {string} ID de la notificación
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  },
  
  /**
   * Notificación informativa
   * @param {string} message - Mensaje a mostrar
   * @param {Object} options - Opciones adicionales
   * @returns {string} ID de la notificación
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  },
  
  /**
   * Mostrar notificación (método base)
   * @param {string} message - Mensaje principal
   * @param {string} type - Tipo: success, error, warning, info
   * @param {Object} options - Opciones personalizadas
   * @returns {string} ID de la notificación
   */
  show(message, type = 'info', options = {}) {
    // Inicializar si es necesario
    if (!this.initialized) {
      this.init();
    }
    
    // Validar mensaje
    if (!message) {
      if (ENV.isDev) {
        console.warn('⚠️ Notify: Mensaje vacío');
      }
      return null;
    }
    
    // Combinar opciones
    const config = { ...this.defaults, ...options };
    
    // Limitar cantidad de notificaciones
    if (this.notifications.length >= config.maxNotifications) {
      this.remove(this.notifications[0].id);
    }
    
    // Generar ID único
    const id = `notify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear elemento
    const toast = this._createToast(id, message, type, config);
    
    // Añadir al contenedor
    this.container.appendChild(toast);
    
    // Guardar referencia
    const notification = {
      id,
      element: toast,
      type,
      timer: null,
      startTime: Date.now(),
      remainingTime: config.duration
    };
    
    this.notifications.push(notification);
    
    // Auto-cerrar
    if (config.duration > 0) {
      this._startTimer(notification, config);
    }
    
    // Log en desarrollo
    if (ENV.isDev) {
      const emoji = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
      console.log(`${emoji[type]} Notify [${type}]:`, message);
    }
    
    return id;
  },
  
  /**
   * Crear elemento HTML de la notificación
   * @private
   */
  _createToast(id, message, type, config) {
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `notify-toast notify-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    // Icono según tipo
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    
    // Construir HTML
    let html = `
      <div class="notify-icon">
        <i class="fas ${icons[type]}"></i>
      </div>
      <div class="notify-content">
        ${config.title ? `<div class="notify-title">${config.title}</div>` : ''}
        <div class="notify-message">${message}</div>
      </div>
    `;
    
    // Botón cerrar
    if (config.closeButton) {
      html += `
        <button class="notify-close" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      `;
    }
    
    toast.innerHTML = html;
    
    // Barra de progreso
    if (config.showProgress && config.duration > 0) {
      const progress = document.createElement('div');
      progress.className = 'notify-progress';
      progress.style.width = '100%';
      progress.style.transitionDuration = `${config.duration}ms`;
      toast.appendChild(progress);
      
      // Animar barra
      setTimeout(() => {
        progress.style.width = '0%';
      }, 10);
    }
    
    // Event listeners
    const closeBtn = toast.querySelector('.notify-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.remove(id));
    }
    
    // Pausar al hover
    if (config.pauseOnHover && config.duration > 0) {
      toast.addEventListener('mouseenter', () => this._pauseTimer(id));
      toast.addEventListener('mouseleave', () => this._resumeTimer(id));
    }
    
    return toast;
  },
  
  /**
   * Iniciar timer de auto-cierre
   * @private
   */
  _startTimer(notification, config) {
    notification.timer = setTimeout(() => {
      this.remove(notification.id);
    }, notification.remainingTime);
  },
  
  /**
   * Pausar timer
   * @private
   */
  _pauseTimer(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification || !notification.timer) return;
    
    clearTimeout(notification.timer);
    notification.remainingTime -= Date.now() - notification.startTime;
    
    // Pausar barra de progreso
    const progress = notification.element.querySelector('.notify-progress');
    if (progress) {
      const computedStyle = window.getComputedStyle(progress);
      progress.style.width = computedStyle.width;
      progress.style.transitionDuration = '0ms';
    }
  },
  
  /**
   * Reanudar timer
   * @private
   */
  _resumeTimer(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return;
    
    notification.startTime = Date.now();
    
    // Reanudar barra de progreso
    const progress = notification.element.querySelector('.notify-progress');
    if (progress) {
      progress.style.transitionDuration = `${notification.remainingTime}ms`;
      progress.style.width = '0%';
    }
    
    this._startTimer(notification, { duration: notification.remainingTime });
  },
  
  /**
   * Cerrar notificación específica
   * @param {string} id - ID de la notificación
   */
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return;
    
    const notification = this.notifications[index];
    
    // Limpiar timer
    if (notification.timer) {
      clearTimeout(notification.timer);
    }
    
    // Animar salida
    notification.element.classList.add('removing');
    
    // Remover del DOM después de la animación
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      
      // Remover del array
      this.notifications.splice(index, 1);
    }, 300);
  },
  
  /**
   * Cerrar todas las notificaciones
   */
  clear() {
    const ids = this.notifications.map(n => n.id);
    ids.forEach(id => this.remove(id));
  },
  
  /**
   * Cambiar posición del contenedor
   * @param {string} position - Nueva posición
   */
  setPosition(position) {
    if (!this.container) return;
    
    // Remover clases de posición anteriores
    this.container.className = this.container.className
      .replace(/notify-(top|bottom)-(left|right|center)/g, '');
    
    this.container.classList.add('notify-container', `notify-${position}`);
    this.defaults.position = position;
  },
  
  /**
   * Obtener cantidad de notificaciones activas
   * @returns {number}
   */
  count() {
    return this.notifications.length;
  },
  
  /**
   * Verificar si hay notificaciones activas
   * @returns {boolean}
   */
  hasActive() {
    return this.notifications.length > 0;
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Notify.init());
} else {
  Notify.init();
}

// Exportar globalmente
window.Notify = Notify;

console.log('✅ notifications.js cargado correctamente');
