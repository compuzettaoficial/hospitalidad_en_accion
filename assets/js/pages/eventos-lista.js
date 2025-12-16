/**
 * ============================================
 * EVENTOS-LISTA.JS - Página de Lista de Eventos
 * ============================================
 */

(function() {
  'use strict';
  
  // Variables globales
  let todosLosEventos = [];
  let eventosFiltrados = [];
  let filtrosActivos = {
    busqueda: '',
    departamento: '',
    ciudad: '',
    categoria: '',
    orden: 'fecha-asc'
  };
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  async function init() {
    try {
      // Cargar eventos
      await cargarEventos();
      
      // Poblar filtros
      poblarFiltros();
      
      // Inicializar event listeners
      initEventListeners();
      
      // Aplicar filtros iniciales
      aplicarFiltros();
      
      // Actualizar botón de auth
      updateAuthButton();
      
      // Navbar móvil
      initNavbarMobile();
      
    } catch (error) {
      console.error('Error inicializando página:', error);
      Notify.error('Error al cargar la página');
    }
  }
  
  // ============================================
  // CARGAR EVENTOS
  // ============================================
  
  async function cargarEventos() {
    try {
      todosLosEventos = await EventosAPI.getAllEventos();
      
      // Filtrar solo eventos activos
      todosLosEventos = todosLosEventos.filter(e => e.estado === 'activo');
      
      if (ENV.isDev) {
        console.log('Eventos cargados:', todosLosEventos.length);
      }
      
    } catch (error) {
      console.error('Error cargando eventos:', error);
      throw error;
    }
  }
  
  // ============================================
  // POBLAR FILTROS
  // ============================================
  
  function poblarFiltros() {
    // Departamentos únicos
    const departamentos = [...new Set(todosLosEventos.map(e => e.ubicacion.departamento))].sort();
    const selectDepartamento = document.getElementById('filterDepartamento');
    departamentos.forEach(dep => {
      const option = document.createElement('option');
      option.value = dep;
      option.textContent = dep;
      selectDepartamento.appendChild(option);
    });
    
    // Ciudades únicas
    const ciudades = [...new Set(todosLosEventos.map(e => e.ubicacion.ciudadNombre))].sort();
    const selectCiudad = document.getElementById('filterCiudad');
    ciudades.forEach(ciudad => {
      const option = document.createElement('option');
      option.value = ciudad.toLowerCase();
      option.textContent = ciudad;
      selectCiudad.appendChild(option);
    });
    
    // Categorías únicas
    const categorias = [...new Set(todosLosEventos.map(e => e.categoria))].sort();
    const selectCategoria = document.getElementById('filterCategoria');
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      selectCategoria.appendChild(option);
    });
  }
  
  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  function initEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    
    if (searchInput) {
      searchInput.addEventListener('input', Helpers.debounce((e) => {
        filtrosActivos.busqueda = e.target.value;
        aplicarFiltros();
        
        if (e.target.value) {
          searchClear.style.display = 'block';
          searchInput.closest('.search-input').classList.add('has-value');
        } else {
          searchClear.style.display = 'none';
          searchInput.closest('.search-input').classList.remove('has-value');
        }
      }, 300));
    }
    
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        filtrosActivos.busqueda = '';
        searchClear.style.display = 'none';
        searchInput.closest('.search-input').classList.remove('has-value');
        aplicarFiltros();
      });
    }
    
    // Filtros de select
    document.getElementById('filterDepartamento')?.addEventListener('change', (e) => {
      filtrosActivos.departamento = e.target.value;
      aplicarFiltros();
    });
    
    document.getElementById('filterCiudad')?.addEventListener('change', (e) => {
      filtrosActivos.ciudad = e.target.value;
      aplicarFiltros();
    });
    
    document.getElementById('filterCategoria')?.addEventListener('change', (e) => {
      filtrosActivos.categoria = e.target.value;
      aplicarFiltros();
    });
    
    document.getElementById('filterOrden')?.addEventListener('change', (e) => {
      filtrosActivos.orden = e.target.value;
      aplicarFiltros();
    });
    
    // Limpiar filtros
    document.getElementById('btnClearFilters')?.addEventListener('click', limpiarFiltros);
  }
  
  // ============================================
  // APLICAR FILTROS
  // ============================================
  
  function aplicarFiltros() {
    eventosFiltrados = [...todosLosEventos];
    
    // Filtro de búsqueda
    if (filtrosActivos.busqueda) {
      const busqueda = filtrosActivos.busqueda.toLowerCase();
      eventosFiltrados = eventosFiltrados.filter(e =>
        e.titulo.toLowerCase().includes(busqueda) ||
        e.ubicacion.ciudadNombre.toLowerCase().includes(busqueda) ||
        e.ubicacion.lugar.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro de departamento
    if (filtrosActivos.departamento) {
      eventosFiltrados = eventosFiltrados.filter(e =>
        e.ubicacion.departamento === filtrosActivos.departamento
      );
    }
    
    // Filtro de ciudad
    if (filtrosActivos.ciudad) {
      eventosFiltrados = eventosFiltrados.filter(e =>
        e.ubicacion.ciudad === filtrosActivos.ciudad
      );
    }
    
    // Filtro de categoría
    if (filtrosActivos.categoria) {
      eventosFiltrados = eventosFiltrados.filter(e =>
        e.categoria === filtrosActivos.categoria
      );
    }
    
    // Ordenamiento
    ordenarEventos();
    
    // Actualizar vista
    renderEventos();
    actualizarContador();
    mostrarFiltrosActivos();
  }
  
  // ============================================
  // ORDENAR EVENTOS
  // ============================================
  
  function ordenarEventos() {
    switch (filtrosActivos.orden) {
      case 'fecha-asc':
        eventosFiltrados.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
        break;
      case 'fecha-desc':
        eventosFiltrados.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
        break;
      case 'nombre-asc':
        eventosFiltrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'nombre-desc':
        eventosFiltrados.sort((a, b) => b.titulo.localeCompare(a.titulo));
        break;
    }
  }
  
  // ============================================
  // RENDER EVENTOS
  // ============================================
  
  function renderEventos() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    
    if (eventosFiltrados.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-search"></i>
          <p>No se encontraron eventos con los filtros seleccionados</p>
          <button class="btn btn-primary" onclick="location.reload()">Ver todos los eventos</button>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = eventosFiltrados.map(evento => `
      <div class="event-card">
        <div class="event-image" style="background-image: url('${evento.imagenes.thumbnail || evento.imagenes.hero}')">
          <span class="event-badge">${Formatters.formatShortDate(evento.fechaInicio)}</span>
          ${evento.destacado ? '<span class="event-badge" style="top: auto; bottom: 1rem; background-color: var(--color-warning);">Destacado</span>' : ''}
        </div>
        <div class="event-content">
          <h3>${evento.titulo}</h3>
          <div class="event-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${evento.ubicacion.ciudadNombre}, ${evento.ubicacion.departamento}</span>
            <span><i class="fas fa-calendar"></i> ${Formatters.formatDateRange(evento.fechaInicio, evento.fechaFin)}</span>
          </div>
          <p class="event-location">
            <i class="fas fa-building"></i> ${evento.ubicacion.lugar}
          </p>
          <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem;">
            <span class="badge badge-info">${evento.categoria}</span>
            ${evento.hospitalidad?.habilitada ? '<span class="badge badge-success"><i class="fas fa-home"></i> Hospitalidad</span>' : ''}
          </div>
          <a href="detalle.html?id=${evento.id}" class="btn btn-primary btn-block">
            Ver Detalles <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `).join('');
  }
  
  // ============================================
  // ACTUALIZAR CONTADOR
  // ============================================
  
  function actualizarContador() {
    const counter = document.getElementById('resultsCount');
    if (!counter) return;
    
    const total = todosLosEventos.length;
    const mostrados = eventosFiltrados.length;
    
    if (mostrados === total) {
      counter.textContent = `Mostrando ${total} evento${total !== 1 ? 's' : ''}`;
    } else {
      counter.textContent = `Mostrando ${mostrados} de ${total} evento${total !== 1 ? 's' : ''}`;
    }
  }
  
  // ============================================
  // MOSTRAR FILTROS ACTIVOS
  // ============================================
  
  function mostrarFiltrosActivos() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    
    const filtros = [];
    
    if (filtrosActivos.busqueda) {
      filtros.push({ tipo: 'busqueda', label: `Búsqueda: "${filtrosActivos.busqueda}"` });
    }
    
    if (filtrosActivos.departamento) {
      filtros.push({ tipo: 'departamento', label: `Departamento: ${filtrosActivos.departamento}` });
    }
    
    if (filtrosActivos.ciudad) {
      const ciudadNombre = document.querySelector(`#filterCiudad option[value="${filtrosActivos.ciudad}"]`)?.textContent || filtrosActivos.ciudad;
      filtros.push({ tipo: 'ciudad', label: `Ciudad: ${ciudadNombre}` });
    }
    
    if (filtrosActivos.categoria) {
      filtros.push({ tipo: 'categoria', label: `Categoría: ${filtrosActivos.categoria}` });
    }
    
    if (filtros.length > 0) {
      container.style.display = 'flex';
      container.innerHTML = filtros.map(filtro => `
        <span class="filter-tag">
          ${filtro.label}
          <button onclick="window.eventosListaPage.quitarFiltro('${filtro.tipo}')">
            <i class="fas fa-times"></i>
          </button>
        </span>
      `).join('');
    } else {
      container.style.display = 'none';
    }
  }
  
  // ============================================
  // QUITAR FILTRO
  // ============================================
  
  function quitarFiltro(tipo) {
    switch (tipo) {
      case 'busqueda':
        document.getElementById('searchInput').value = '';
        filtrosActivos.busqueda = '';
        break;
      case 'departamento':
        document.getElementById('filterDepartamento').value = '';
        filtrosActivos.departamento = '';
        break;
      case 'ciudad':
        document.getElementById('filterCiudad').value = '';
        filtrosActivos.ciudad = '';
        break;
      case 'categoria':
        document.getElementById('filterCategoria').value = '';
        filtrosActivos.categoria = '';
        break;
    }
    
    aplicarFiltros();
  }
  
  // ============================================
  // LIMPIAR FILTROS
  // ============================================
  
  function limpiarFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterDepartamento').value = '';
    document.getElementById('filterCiudad').value = '';
    document.getElementById('filterCategoria').value = '';
    document.getElementById('filterOrden').value = 'fecha-asc';
    
    filtrosActivos = {
      busqueda: '',
      departamento: '',
      ciudad: '',
      categoria: '',
      orden: 'fecha-asc'
    };
    
    aplicarFiltros();
  }
  
  // ============================================
  // NAVBAR MÓVIL
  // ============================================
  
  function initNavbarMobile() {
    const toggle = document.getElementById('navbarToggle');
    const menu = document.getElementById('navbarMenu');
    
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        menu.classList.toggle('active');
      });
      
      menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menu.classList.remove('active');
        });
      });
    }
  }
  
  // ============================================
  // ACTUALIZAR BOTÓN AUTH
  // ============================================
  
  function updateAuthButton() {
    const btnAuth = document.getElementById('btnAuth');
    if (!btnAuth) return;
    
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        btnAuth.innerHTML = `<i class="fas fa-user-circle"></i> Mi Cuenta`;
        btnAuth.href = '../../' + ROUTES.USER.DASHBOARD();
      } else {
        btnAuth.innerHTML = `<i class="fas fa-sign-in-alt"></i> Iniciar Sesión`;
        btnAuth.href = '../auth/login.html';
      }
    });
  }
  
  // ============================================
  // EXPORTAR FUNCIONES PÚBLICAS
  // ============================================
  
  window.eventosListaPage = {
    quitarFiltro
  };
  
  // ============================================
  // INICIALIZAR AL CARGAR DOM
  // ============================================
  
  document.addEventListener('DOMContentLoaded', init);
  
})();
