/**
 * ============================================
 * SIDEBAR.COMPONENT.JS - Navegación Lateral
 * ============================================
 * Sidebar reutilizable para perfil de usuario
 */

const SidebarComponent = {
  
  /**
   * Renderizar sidebar
   * @param {string} containerId - ID del contenedor
   * @param {Object} user - Datos del usuario
   * @param {string} activeSection - Sección activa
   */
  render(containerId, user, activeSection = 'perfil') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Contenedor sidebar no encontrado:', containerId);
      return;
    }
    
    const menuItems = this._getMenuItems(user);
    
    container.innerHTML = `
      <aside class="sidebar">
        <!-- Header Usuario -->
        <div class="sidebar-header">
          <div class="sidebar-avatar">
            ${this._getInitials(user.nombre)}
          </div>
          <div class="sidebar-user-info">
            <h3 class="sidebar-user-name">${user.nombre}</h3>
            <span class="sidebar-user-role badge badge-${this._getRoleBadgeColor(user.rol)}">
              ${UsuariosService.getRolLabel(user.rol)}
            </span>
          </div>
        </div>
        
        <!-- Menu -->
        <nav class="sidebar-nav">
          ${menuItems.map(item => this._renderMenuItem(item, activeSection)).join('')}
        </nav>
        
        <!-- Footer -->
        <div class="sidebar-footer">
          <button class="btn btn-text btn-full" onclick="AuthService.logout()">
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    `;
  },
  
  /**
   * Obtener items del menú según rol
   * @private
   */
  _getMenuItems(user) {
    const items = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fa-home',
        url: ROUTES.USER.DASHBOARD(),
        roles: ['user', 'editor', 'admin']
      },
      {
        id: 'perfil',
        label: 'Mi Perfil',
        icon: 'fa-user',
        url: ROUTES.USER.PERFIL.INDEX(),
        roles: ['user', 'editor', 'admin']
      },
      {
        id: 'seguridad',
        label: 'Seguridad',
        icon: 'fa-lock',
        url: ROUTES.USER.PERFIL.SEGURIDAD(),
        roles: ['user', 'editor', 'admin']
      },
      {
        id: 'postulaciones',
        label: 'Mis Postulaciones',
        icon: 'fa-file-alt',
        url: ROUTES.USER.HOSPITALIDAD.MIS_POSTULACIONES(),
        roles: ['user', 'editor', 'admin']
      },
      {
        id: 'admin',
        label: 'Panel Admin',
        icon: 'fa-shield-alt',
        url: ROUTES.ADMIN.DASHBOARD(),
        roles: ['admin']
      },
      {
        id: 'editor',
        label: 'Panel Editor',
        icon: 'fa-edit',
        url: ROUTES.ADMIN.EVENTOS.LISTA(),
        roles: ['editor', 'admin']
      }
    ];
    
    // Filtrar por rol
    return items.filter(item => item.roles.includes(user.rol));
  },
  
  /**
   * Renderizar item del menú
   * @private
   */
  _renderMenuItem(item, activeSection) {
    const isActive = activeSection === item.id;
    const activeClass = isActive ? 'active' : '';
    
    return `
      <a href="${item.url}" class="sidebar-item ${activeClass}">
        <i class="fas ${item.icon}"></i>
        <span>${item.label}</span>
        ${isActive ? '<i class="fas fa-chevron-right"></i>' : ''}
      </a>
    `;
  },
  
  /**
   * Obtener iniciales del nombre
   * @private
   */
  _getInitials(nombre) {
    if (!nombre) return 'U';
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },
  
  /**
   * Color del badge según rol
   * @private
   */
  _getRoleBadgeColor(rol) {
    const colors = {
      'admin': 'error',
      'editor': 'warning',
      'user': 'info'
    };
    return colors[rol] || 'text-light';
  },
  
  /**
   * Marcar sección como activa
   */
  setActive(section) {
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.sidebar-item[data-section="${section}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }
};

// Exportar globalmente
window.SidebarComponent = SidebarComponent;

console.log('✅ sidebar.component.js cargado correctamente');
