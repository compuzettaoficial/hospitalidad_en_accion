
/**
 * ============================================
 * UI.SERVICE.JS - Servicio de Utilidades UI
 * ============================================
 * Funciones comunes para interacción con la interfaz
 */

const UIService = {
  
  // ============================================
  // MODALES
  // ============================================
  
  /**
   * Mostrar modal de confirmación
   * @param {Object} options - Opciones del modal
   * @returns {Promise<boolean>}
   */
  async confirm(options = {}) {
    const {
      title = '¿Estás seguro?',
      message = '¿Deseas continuar con esta acción?',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      type = 'warning' // warning, error, info, success
    } = options;
    
    return new Promise((resolve) => {
      // Crear modal
      const modalId = 'confirm-modal-' + Date.now();
      const modal = this._createConfirmModal(modalId, title, message, confirmText, cancelText, type);
      
      document.body.appendChild(modal);
      
      // Event listeners
      const confirmBtn = modal.querySelector('.btn-confirm');
      const cancelBtn = modal.querySelector('.btn-cancel');
      const closeBtn = modal.querySelector('.modal-close');
      
      const cleanup = () => {
        modal.remove();
      };
      
      confirmBtn.addEventListener('click', () => {
        cleanup();
        resolve(true);
      });
      
      cancelBtn.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      closeBtn.addEventListener('click', () => {
        cleanup();
        resolve(false);
      });
      
      // Mostrar modal
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    });
  },
  
  /**
   * Crear modal de confirmación
   * @private
   */
  _createConfirmModal(id, title, message, confirmText, cancelText, type) {
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal modal-confirm';
    
    const icons = {
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      info: 'fa-info-circle',
      success: 'fa-check-circle'
    };
    
    modal.innerHTML = `
      <div class="modal-backdrop active"></div>
      <div class="modal-dialog">
        <div class="modal-body">
          <div class="modal-confirm-icon ${type}">
            <i class="fas ${icons[type]}"></i>
          </div>
          <h3 class="modal-confirm-title">${title}</h3>
          <p class="modal-confirm-message">${message}</p>
          <div class="modal-footer">
            <button class="btn btn-outline btn-cancel">${cancelText}</button>
            <button class="btn btn-${type === 'error' ? 'error' : 'primary'} btn-confirm">${confirmText}</button>
          </div>
        </div>
        <button class="modal-close" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    return modal;
  },
  
  /**
   * Mostrar modal simple con mensaje
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: success, error, warning, info
   */
  alert(message, type = 'info') {
    const titles = {
      success: '¡Éxito!',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    
    return this.confirm({
      title: titles[type],
      message,
      confirmText: 'Aceptar',
      cancelText: '',
      type
    });
  },
  
  // ============================================
  // LOADING
  // ============================================
  
  /**
   * Mostrar overlay de carga global
   * @param {string} message - Mensaje de carga
   */
  showLoading(message = 'Cargando...') {
    let overlay = document.getElementById('global-loading-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-loading-overlay';
      overlay.className = 'modal-backdrop active';
      overlay.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white;">
          <div style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;"></div>
          <div id="loading-message">${message}</div>
        </div>
      `;
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = 'block';
      const messageEl = overlay.querySelector('#loading-message');
      if (messageEl) messageEl.textContent = message;
    }
  },
  
  /**
   * Ocultar overlay de carga global
   */
  hideLoading() {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  },
  
  /**
   * Mostrar loading en un botón
   * @param {HTMLElement} button - Elemento del botón
   * @param {boolean} loading - Estado de carga
   */
  setButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.classList.add('btn-loading');
    } else {
      button.disabled = false;
      button.classList.remove('btn-loading');
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  },
  
  // ============================================
  // TABLES
  // ============================================
  
  /**
   * Renderizar tabla con datos
   * @param {string} containerId - ID del contenedor
   * @param {Array} data - Datos a mostrar
   * @param {Array} columns - Configuración de columnas
   * @param {Object} options - Opciones adicionales
   */
  renderTable(containerId, data, columns, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="table-empty">
          <i class="fas fa-inbox"></i>
          <p>${options.emptyMessage || 'No hay datos para mostrar'}</p>
        </div>
      `;
      return;
    }
    
    let tableHTML = '<div class="table-container"><table class="table">';
    
    // Header
    tableHTML += '<thead><tr>';
    columns.forEach(col => {
      const align = col.align ? `class="text-${col.align}"` : '';
      tableHTML += `<th ${align}>${col.label}</th>`;
    });
    if (options.actions) {
      tableHTML += '<th class="text-center">Acciones</th>';
    }
    tableHTML += '</tr></thead>';
    
    // Body
    tableHTML += '<tbody>';
    data.forEach(row => {
      tableHTML += '<tr>';
      columns.forEach(col => {
        const align = col.align ? `class="text-${col.align}"` : '';
        let value = col.field ? Helpers._getNestedValue(row, col.field) : '';
        
        if (col.render) {
          value = col.render(row);
        }
        
        tableHTML += `<td ${align}>${value}</td>`;
      });
      
      if (options.actions) {
        tableHTML += '<td class="text-center"><div class="table-actions">';
        options.actions.forEach(action => {
          tableHTML += `
            <button class="table-action-btn ${action.class || ''}" 
                    onclick="(${action.onClick.toString()})(${JSON.stringify(row).replace(/"/g, '&quot;')})">
              <i class="fas ${action.icon}"></i>
            </button>
          `;
        });
        tableHTML += '</div></td>';
      }
      
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table></div>';
    
    container.innerHTML = tableHTML;
  },
  
  // ============================================
  // FORMS
  // ============================================
  
  /**
   * Obtener datos de un formulario
   * @param {string} formId - ID del formulario
   * @returns {Object}
   */
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      // Manejar checkboxes múltiples
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }
    
    return data;
  },
  
  /**
   * Llenar formulario con datos
   * @param {string} formId - ID del formulario
   * @param {Object} data - Datos a llenar
   */
  fillForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
      const element = form.elements[key];
      if (!element) return;
      
      if (element.type === 'checkbox') {
        element.checked = Boolean(data[key]);
      } else if (element.type === 'radio') {
        const radio = form.querySelector(`input[name="${key}"][value="${data[key]}"]`);
        if (radio) radio.checked = true;
      } else {
        element.value = data[key];
      }
    });
  },
  
  /**
   * Validar formulario
   * @param {string} formId - ID del formulario
   * @returns {boolean}
   */
  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    return form.checkValidity();
  },
  
  /**
   * Resetear formulario
   * @param {string} formId - ID del formulario
   */
  resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      
      // Limpiar estados de validación
      const inputs = form.querySelectorAll('.is-valid, .is-invalid');
      inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
      });
    }
  },
  
  // ============================================
  // CARDS
  // ============================================
  
  /**
   * Renderizar grid de cards
   * @param {string} containerId - ID del contenedor
   * @param {Array} items - Items a mostrar
   * @param {Function} renderCard - Función para renderizar cada card
   */
  renderCards(containerId, items, renderCard) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No hay elementos para mostrar</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = items.map(item => renderCard(item)).join('');
  },
  
  // ============================================
  // TABS
  // ============================================
  
  /**
   * Inicializar sistema de tabs
   * @param {string} containerId - ID del contenedor de tabs
   */
  initTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const tabs = container.querySelectorAll('[data-tab]');
    const contents = container.querySelectorAll('[data-tab-content]');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.dataset.tab;
        
        // Desactivar todos
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Activar seleccionado
        tab.classList.add('active');
        const targetContent = container.querySelector(`[data-tab-content="${targetId}"]`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  },
  
  // ============================================
  // TOOLTIPS
  // ============================================
  
  /**
   * Inicializar tooltips
   */
  initTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    
    elements.forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        this._showTooltip(e.target, e.target.dataset.tooltip);
      });
      
      el.addEventListener('mouseleave', () => {
        this._hideTooltip();
      });
    });
  },
  
  /**
   * Mostrar tooltip
   * @private
   */
  _showTooltip(element, text) {
    let tooltip = document.getElementById('global-tooltip');
    
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'global-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 10000;
        pointer-events: none;
      `;
      document.body.appendChild(tooltip);
    }
    
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
  },
  
  /**
   * Ocultar tooltip
   * @private
   */
  _hideTooltip() {
    const tooltip = document.getElementById('global-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  },
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Deshabilitar/habilitar elemento
   * @param {string} elementId - ID del elemento
   * @param {boolean} disabled - Estado
   */
  setDisabled(elementId, disabled) {
    const element = document.getElementById(elementId);
    if (element) {
      element.disabled = disabled;
    }
  },
  
  /**
   * Mostrar/ocultar elemento
   * @param {string} elementId - ID del elemento
   * @param {boolean} visible - Visible o no
   */
  setVisible(elementId, visible) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = visible ? '' : 'none';
    }
  },
  
  /**
   * Agregar clase a elemento
   * @param {string} elementId - ID del elemento
   * @param {string} className - Clase a agregar
   */
  addClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add(className);
    }
  },
  
  /**
   * Remover clase de elemento
   * @param {string} elementId - ID del elemento
   * @param {string} className - Clase a remover
   */
  removeClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove(className);
    }
  }
};

// Inicializar tooltips cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UIService.initTooltips());
} else {
  UIService.initTooltips();
}

// Exportar globalmente
window.UIService = UIService;

console.log('✅ ui.service.js cargado correctamente');
