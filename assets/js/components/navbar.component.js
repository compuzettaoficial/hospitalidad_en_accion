/**
 * ============================================
 * NAVBAR.COMPONENT.JS - Barra de Navegación
 * ============================================
 * Navbar responsive con menú móvil
 */

const NavbarComponent = {
  
  /**
   * Renderizar navbar
   * @param {string} containerId - ID del contenedor
   * @param {Object} user - Datos del usuario (opcional)
   * @param {string} activePage - Página activa
   */
  render(containerId, user = null, activePage = 'home') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Contenedor navbar no encontrado:', containerId);
      return;
    }
    
    container.innerHTML = `
      <nav class="navbar">
        <div class="navbar-container">
          <!-- Logo -->
          <a href="${ROUTES.HOME()}" class="navbar-brand">
            <i class="fas fa-heart"></i>
            <span>${CONSTANTS.APP.NAME}</span>
          </a>
          
          <!-- Menu Desktop -->
          <div class="navbar-menu" id="navbarMenu">
            ${this._renderMenuItems(activePage, user)}
          </div>
          
          <!-- User Section -->
          <div class="navbar-actions">
            ${user ? this._renderUserMenu(user) : this._renderAuthButtons()}
          </div>
          
          <!-- Mobile Toggle -->
          <button class="navbar-toggle" onclick="NavbarComponent.toggleMobile()">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </nav>
    `;
    
    this._initializeDropdowns();
  },
  
  /**
   * Renderizar items del menú
   * @private
   */
  _renderMenuItems(activePage, user) {
    const items = [
      { id: 'home', label: 'Inicio', url: ROUTES.HOME(), public: true },
      { id: 'eventos', label: 'Eventos', url: ROUTES.EVENTOS.LISTA(), public: true },
      { id: 'dashboard', label: 'Dashboard', url: ROUTES.USER.DASHBOARD(), auth: true },
      { id: 'admin', label: 'Admin', url: ROUTES.ADMIN.DASHBOARD(), admin: true }
    ];
    
    return items
      .filter(item => {
        if (item.public) return true;
        if (item.auth && user) return true;
        if (item.admin && user?.rol === 'admin') return true;
        return false;
      })
      .map(item => {
        const isActive = activePage === item.id;
        return `
          <a href="${item.url}" class="navbar-link ${isActive ? 'active' : ''}">
            ${item.label}
          </a>
        `;
      })
      .join('');
  },
  
  /**
   * Renderizar menú de usuario
   * @private
   */
  _renderUserMenu(user) {
    return `
      <div class="navbar-user-menu">
        <button class="navbar-user-btn" onclick="NavbarComponent.toggleUserDropdown()">
          <div class="navbar-user-avatar">${this._getInitials(user.nombre)}</div>
          <span class="navbar-user-name">${user.nombre}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        
        <div class="navbar-dropdown" id="userDropdown">
          <a href="${ROUTES.USER.PERFIL.INDEX()}" class="navbar-dropdown-item">
            <i class="fas fa-user"></i>
            Mi Perfil
          </a>
          <a href="${ROUTES.USER.HOSPITALIDAD.MIS_POSTULACIONES()}" class="navbar-dropdown-item">
            <i class="fas fa-file-alt"></i>
            Mis Postulaciones
          </a>
          ${user.rol === 'admin' ? `
            <a href="${ROUTES.ADMIN.DASHBOARD()}" class="navbar-dropdown-item">
              <i class="fas fa-shield-alt"></i>
              Panel Admin
            </a>
          ` : ''}
          <div class="navbar-dropdown-divider"></div>
          <button onclick="AuthService.logout()" class="navbar-dropdown-item">
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    `;
  },
  
  /**
   * Renderizar botones de autenticación
   * @private
   */
  _renderAuthButtons() {
    return `
      <div class="navbar-auth-buttons">
        <a href="${ROUTES.AUTH.LOGIN()}" class="btn btn-text">
          Iniciar Sesión
        </a>
        <a href="${ROUTES.AUTH.REGISTER()}" class="btn btn-primary">
          Registrarse
        </a>
      </div>
    `;
  },
  
  /**
   * Toggle menú móvil
   */
  toggleMobile() {
    const menu = document.getElementById('navbarMenu');
    if (menu) {
      menu.classList.toggle('active');
    }
  },
  
  /**
   * Toggle dropdown de usuario
   */
  toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.classList.toggle('active');
    }
  },
  
  /**
   * Inicializar dropdowns
   * @private
   */
  _initializeDropdowns() {
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
      const userBtn = e.target.closest('.navbar-user-btn');
      const dropdown = document.getElementById('userDropdown');
      
      if (!userBtn && dropdown) {
        dropdown.classList.remove('active');
      }
    });
  },
  
  /**
   * Obtener iniciales
   * @private
   */
  _getInitials(nombre) {
    if (!nombre) return 'U';
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
};

// Exportar globalmente
window.NavbarComponent = NavbarComponent;

console.log('✅ navbar.component.js cargado correctamente');
