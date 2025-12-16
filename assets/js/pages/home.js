/**
 * ============================================
 * HOME.JS - JavaScript para Página Principal
 * ============================================
 */

(function() {
  'use strict';
  
  // ============================================
  // SLIDER
  // ============================================
  
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;
  let slideInterval;
  
  function showSlide(index) {
    // Normalizar índice
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;
    
    // Actualizar slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
  }
  
  function nextSlide() {
    showSlide(currentSlide + 1);
  }
  
  function prevSlide() {
    showSlide(currentSlide - 1);
  }
  
  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoSlide() {
    clearInterval(slideInterval);
  }
  
  // Event Listeners del Slider
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });
  }
  
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopAutoSlide();
      showSlide(index);
      startAutoSlide();
    });
  });
  
  // Iniciar auto-slide
  startAutoSlide();
  
  // ============================================
  // NAVBAR MÓVIL
  // ============================================
  
  const navbarToggle = document.getElementById('navbarToggle');
  const navbarMenu = document.getElementById('navbarMenu');
  
  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = navbarMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navbarMenu.classList.remove('active');
      });
    });
  }
  
  // ============================================
  // CARGAR EVENTOS
  // ============================================
  
  async function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    try {
      const eventos = await EventosAPI.getAllEventos();
      
      // Filtrar solo eventos activos y ordenar por fecha
      const eventosActivos = eventos
        .filter(e => e.estado === 'activo')
        .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
        .slice(0, 3); // Mostrar solo los 3 primeros
      
      if (eventosActivos.length === 0) {
        eventsGrid.innerHTML = '<p class="text-center">No hay eventos próximos en este momento.</p>';
        return;
      }
      
      eventsGrid.innerHTML = eventosActivos.map(evento => `
        <div class="event-card">
          <div class="event-image" style="background-image: url('${evento.imagenes.thumbnail || evento.imagenes.hero}')">
            <span class="event-badge">${formatDate(evento.fechaInicio)}</span>
          </div>
          <div class="event-content">
            <h3>${evento.titulo}</h3>
            <div class="event-meta">
              <span><i class="fas fa-map-marker-alt"></i> ${evento.ubicacion.ciudadNombre}, ${evento.ubicacion.departamento}</span>
              <span><i class="fas fa-calendar"></i> ${formatDateRange(evento.fechaInicio, evento.fechaFin)}</span>
            </div>
            <p class="event-location">
              <i class="fas fa-building"></i> ${evento.ubicacion.lugar}
            </p>
            <a href="pages/eventos/detalle.html?id=${evento.id}" class="btn btn-primary btn-block">
              Ver Detalles <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      eventsGrid.innerHTML = '<p class="text-center text-error">Error al cargar eventos. Por favor, intenta más tarde.</p>';
    }
  }
  
  // ============================================
  // FORMATEO DE FECHAS
  // ============================================
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }
  
  function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.getDate()} ${months[start.getMonth()]}`;
    } else {
      return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]}`;
    }
  }
  
  // ============================================
  // ACTUALIZAR BOTÓN DE AUTH
  // ============================================
  
  function updateAuthButton() {
    const btnAuth = document.getElementById('btnAuth');
    if (!btnAuth) return;
    
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Usuario logueado
        try {
          const userData = await FirestoreService.getById('usuarios', user.uid);
          
          btnAuth.innerHTML = `<i class="fas fa-user-circle"></i> Mi Cuenta`;
          btnAuth.href = ROUTES.USER.DASHBOARD();
          
        } catch (error) {
          console.error('Error obteniendo datos del usuario:', error);
        }
      } else {
        // No logueado
        btnAuth.innerHTML = `<i class="fas fa-sign-in-alt"></i> Iniciar Sesión`;
        btnAuth.href = ROUTES.AUTH.LOGIN();
      }
    });
  }
  
  // ============================================
  // SCROLL SUAVE PARA ANCLAS
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const offsetTop = target.offsetTop - 80; // 80px para el header fijo
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    updateAuthButton();
    
    if (ENV.isDev) {
      console.log('✅ Home page initialized');
    }
  });
  
})();
