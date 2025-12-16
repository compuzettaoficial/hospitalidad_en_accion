/**
 * ============================================
 * EVENTO-DETALLE.JS - Página de Detalle de Evento
 * ============================================
 */

(function() {
  'use strict';
  
  let evento = null;
  let eventoId = null;
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  async function init() {
    try {
      // Obtener ID del evento de la URL
      eventoId = Helpers.getURLParam('id');
      
      if (!eventoId) {
        Notify.error('Evento no especificado');
        setTimeout(() => NavigationService.goEventos(), 2000);
        return;
      }
      
      // Cargar evento
      await cargarEvento();
      
      // Cargar información adicional
      await Promise.all([
        cargarHoteles(),
        cargarCocheras()
      ]);
      
      // Inicializar componentes
      initEventListeners();
      updateAuthButton();
      initNavbarMobile();
      
    } catch (error) {
      console.error('Error inicializando:', error);
      mostrarError();
    }
  }
  
  // ============================================
  // CARGAR EVENTO
  // ============================================
  
  async function cargarEvento() {
    try {
      evento = await EventosAPI.getEventoById(eventoId);
      
      if (!evento) {
        throw new Error('Evento no encontrado');
      }
      
      renderEvento();
      
      // Ocultar loading, mostrar contenido
      document.getElementById('pageLoading').style.display = 'none';
      document.getElementById('eventoContent').style.display = 'block';
      
    } catch (error) {
      console.error('Error cargando evento:', error);
      throw error;
    }
  }
  
  // ============================================
  // RENDER EVENTO
  // ============================================
  
  function renderEvento() {
    // Hero
    const hero = document.getElementById('eventoHero');
    hero.style.backgroundImage = `url('${evento.imagenes.hero || evento.imagenes.thumbnail}')`;
    
    document.getElementById('eventoCategoria').textContent = evento.categoria;
    document.getElementById('eventoTitulo').textContent = evento.titulo;
    
    // Meta Hero
    const metaHero = document.getElementById('eventoMetaHero');
    metaHero.innerHTML = `
      <span><i class="fas fa-map-marker-alt"></i> ${evento.ubicacion.ciudadNombre}, ${evento.ubicacion.departamento}</span>
      <span><i class="fas fa-calendar"></i> ${Formatters.formatDateRange(evento.fechaInicio, evento.fechaFin)}</span>
      <span><i class="fas fa-clock"></i> ${evento.duracionDias} día${evento.duracionDias > 1 ? 's' : ''}</span>
    `;
    
    // Descripción
    document.getElementById('eventoDescripcion').textContent = evento.descripcion;
    
    // Programa
    if (evento.programa?.definido && evento.programa.dias?.length > 0) {
      document.getElementById('seccionPrograma').style.display = 'block';
      renderPrograma(evento.programa.dias);
    }
    
    // Expositores
    if (evento.expositores?.lista?.length > 0) {
      document.getElementById('seccionExpositores').style.display = 'block';
      renderExpositores(evento.expositores.lista);
    }
    
    // Sidebar Info
    renderInfo();
    
    // Hospitalidad
    if (evento.hospitalidad?.habilitada) {
      document.getElementById('seccionHospitalidad').style.display = 'block';
    }
    
    // Organizador
    renderOrganizador();
    
    // Actualizar SEO
    document.title = `${evento.titulo} - Hospitalidad en Acción`;
  }
  
  // ============================================
  // RENDER INFO SIDEBAR
  // ============================================
  
  function renderInfo() {
    const infoContainer = document.getElementById('eventoInfo');
    
    infoContainer.innerHTML = `
      <div class="evento-info-item">
        <div class="evento-info-icon">
          <i class="fas fa-calendar"></i>
        </div>
        <div class="evento-info-content">
          <div class="evento-info-label">Fecha</div>
          <div class="evento-info-value">${Formatters.formatDateRange(evento.fechaInicio, evento.fechaFin)}</div>
        </div>
      </div>
      
      <div class="evento-info-item">
        <div class="evento-info-icon">
          <i class="fas fa-building"></i>
        </div>
        <div class="evento-info-content">
          <div class="evento-info-label">Lugar</div>
          <div class="evento-info-value">${evento.ubicacion.lugar}</div>
        </div>
      </div>
      
      <div class="evento-info-item">
        <div class="evento-info-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="evento-info-content">
          <div class="evento-info-label">Dirección</div>
          <div class="evento-info-value">${evento.ubicacion.direccion}</div>
          ${evento.ubicacion.maps ? `
            <a href="${evento.ubicacion.maps}" target="_blank" class="btn btn-sm btn-outline" style="margin-top: 0.5rem;">
              <i class="fas fa-map"></i> Ver en Mapa
            </a>
          ` : ''}
        </div>
      </div>
      
      ${evento.inscripcion?.habilitada ? `
        <div class="evento-info-item">
          <div class="evento-info-icon">
            <i class="fas fa-ticket-alt"></i>
          </div>
          <div class="evento-info-content">
            <div class="evento-info-label">Inscripción</div>
            <div class="evento-info-value">${evento.inscripcion.tipoInscripcion === 'gratuita' ? 'Gratuita' : Formatters.formatCurrency(evento.inscripcion.costoInscripcion)}</div>
          </div>
        </div>
      ` : ''}
    `;
  }
  
  // ============================================
  // RENDER ORGANIZADOR
  // ============================================
  
  function renderOrganizador() {
    const container = document.getElementById('eventoOrganizador');
    
    container.innerHTML = `
      ${evento.organizador.logo ? `
        <img src="${evento.organizador.logo}" alt="${evento.organizador.nombre}" class="organizador-logo">
      ` : ''}
      <div class="organizador-name">${evento.organizador.nombre}</div>
      <p style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
        ${evento.organizador.descripcion || ''}
      </p>
      ${evento.organizador.website || evento.organizador.contacto ? `
        <div class="organizador-links">
          ${evento.organizador.website ? `
            <a href="${evento.organizador.website}" target="_blank" title="Sitio Web">
              <i class="fas fa-globe"></i>
            </a>
          ` : ''}
          ${evento.organizador.contacto?.whatsapp ? `
            <a href="${Helpers.getWhatsAppLink(evento.organizador.contacto.whatsapp)}" target="_blank" title="WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
          ` : ''}
          ${evento.organizador.contacto?.email ? `
            <a href="mailto:${evento.organizador.contacto.email}" title="Email">
              <i class="fas fa-envelope"></i>
            </a>
          ` : ''}
        </div>
      ` : ''}
    `;
  }
  
  // ============================================
  // RENDER EXPOSITORES
  // ============================================
  
  function renderExpositores(expositores) {
    const container = document.getElementById('eventosExpositores');
    
    container.innerHTML = expositores.map(expositor => `
      <div class="expositor-card">
        <img src="${Helpers.getExpositorImage(expositor.foto)}" 
             alt="${expositor.nombre}" 
             class="expositor-foto"
             onerror="this.src='${Helpers.getExpositorImage('')}'">
        <div class="expositor-nombre">${expositor.nombre}</div>
        <div class="expositor-pais">${expositor.pais || 'Perú'}</div>
      </div>
    `).join('');
  }
  
  // ============================================
  // RENDER PROGRAMA
  // ============================================
  
  function renderPrograma(dias) {
    const container = document.getElementById('eventoPrograma');
    
    container.innerHTML = dias.map(dia => `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.125rem; margin-bottom: 0.75rem;">
          ${dia.titulo || `Día ${dia.numero}`}
        </h3>
        ${dia.actividades?.map(act => `
          <div style="display: flex; gap: 1rem; margin-bottom: 0.75rem; padding: 0.75rem; background: var(--color-bg-light); border-radius: var(--border-radius-md);">
            <div style="font-weight: 600; color: var(--color-primary);">${act.hora}</div>
            <div style="flex: 1;">
              <div style="font-weight: 600;">${act.titulo}</div>
              ${act.descripcion ? `<div style="font-size: 0.875rem; color: var(--color-text-secondary);">${act.descripcion}</div>` : ''}
            </div>
          </div>
        `).join('') || '<p>Programa por confirmar</p>'}
      </div>
    `).join('');
  }
  
  // ============================================
  // CARGAR HOTELES
  // ============================================
  
  async function cargarHoteles() {
    try {
      const hoteles = await HotelesAPI.getHotelesByEvento(eventoId);
      const container = document.getElementById('eventoHoteles');
      
      if (hoteles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No hay hoteles registrados para este evento</p>';
        return;
      }
      
      container.innerHTML = hoteles.map(hotel => `
        <div class="hotel-card">
          <div class="card-image-container">
            <img src="${hotel.imagenes?.principal || Helpers.getImagePath('hotel', 'placeholder.jpg')}" alt="${hotel.nombre}">
          </div>
          <div class="hotel-content">
            <div class="hotel-name">${hotel.nombre}</div>
            ${hotel.caracteristicas?.estrellas ? `
              <div class="hotel-stars">
                ${Array(hotel.caracteristicas.estrellas).fill('<i class="fas fa-star"></i>').join('')}
              </div>
            ` : ''}
            <div class="hotel-info">
              ${hotel.distanciaEvento ? `<span><i class="fas fa-map-marker-alt"></i> ${(hotel.distanciaEvento.metros / 1000).toFixed(1)} km del evento</span>` : ''}
              ${hotel.contacto?.direccion ? `<span><i class="fas fa-location-dot"></i> ${hotel.contacto.direccion}</span>` : ''}
            </div>
            ${hotel.tarifas?.simple ? `
              <div class="hotel-price">
                <div>
                  <div class="hotel-price-amount">${Formatters.formatCurrency(hotel.tarifas.simple.precio)}</div>
                  <div class="hotel-price-label">por noche</div>
                </div>
                ${hotel.contacto?.telefonos?.[0] ? `
                  <a href="${Helpers.getWhatsAppLink(hotel.contacto.telefonos[0].numero, `Hola, consulto por habitación para el evento ${evento.titulo}`)}" 
                     class="btn btn-sm btn-primary" target="_blank">
                    <i class="fab fa-whatsapp"></i> Contactar
                  </a>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Error cargando hoteles:', error);
      document.getElementById('eventoHoteles').innerHTML = '<p style="text-align: center; color: var(--color-error);">Error al cargar hoteles</p>';
    }
  }
  
  // ============================================
  // CARGAR COCHERAS
  // ============================================
  
  async function cargarCocheras() {
    try {
      const cocheras = await CocherasAPI.getCocherasByEvento(eventoId);
      const container = document.getElementById('eventoCocheras');
      
      if (cocheras.length === 0) {
        document.getElementById('seccionCocheras').style.display = 'none';
        return;
      }
      
      container.innerHTML = cocheras.map(cochera => `
        <div class="card">
          <div class="card-body">
            <h4>${cochera.nombre}</h4>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary);">
              <i class="fas fa-map-marker-alt"></i> ${cochera.direccion}
            </p>
            ${cochera.distanciaEvento ? `
              <p style="font-size: 0.875rem;">
                <i class="fas fa-route"></i> ${(cochera.distanciaEvento.metros / 1000).toFixed(1)} km del evento
              </p>
            ` : ''}
            ${cochera.tarifas?.porDia ? `
              <p style="font-weight: 600; color: var(--color-primary); margin: 1rem 0;">
                ${Formatters.formatCurrency(cochera.tarifas.porDia)} / día
              </p>
            ` : ''}
            ${cochera.contacto?.whatsapp ? `
              <a href="${Helpers.getWhatsAppLink(cochera.contacto.whatsapp)}" class="btn btn-sm btn-outline btn-block" target="_blank">
                <i class="fab fa-whatsapp"></i> Contactar
              </a>
            ` : ''}
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Error cargando cocheras:', error);
    }
  }
  
  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  function initEventListeners() {
    // Postular como visitante
    document.getElementById('btnPostularVisitante')?.addEventListener('click', () => {
      NavigationService.goPostularVisitante(eventoId);
    });
    
    // Postular como anfitrión
    document.getElementById('btnPostularAnfitrion')?.addEventListener('click', () => {
      NavigationService.goPostularAnfitrion(eventoId);
    });
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
  // MOSTRAR ERROR
  // ============================================
  
  function mostrarError() {
    document.getElementById('pageLoading').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>No se pudo cargar el evento</p>
        <a href="lista.html" class="btn btn-primary">Volver a Eventos</a>
      </div>
    `;
  }
  
  // ============================================
  // INICIALIZAR
  // ============================================
  
  document.addEventListener('DOMContentLoaded', init);
  
})();
