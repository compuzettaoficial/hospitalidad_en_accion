// ============================================
// ROUTES.JS - Configuración de Rutas
// ============================================

const ROUTES = {
  BASE: '/hospitalidad_en_accion',
  
  // Páginas públicas
  HOME: '/hospitalidad_en_accion/index.html',
  EVENTOS: '/hospitalidad_en_accion/pages/eventos.html',
  EVENTO_DETALLE: '/hospitalidad_en_accion/pages/evento-detalle.html',
  
  // Auth
  LOGIN: '/hospitalidad_en_accion/pages/auth/login.html',
  REGISTER: '/hospitalidad_en_accion/pages/auth/register.html',
  RESET_PASSWORD: '/hospitalidad_en_accion/pages/auth/reset-password.html',
  
  // User
  PERFIL: '/hospitalidad_en_accion/pages/user/perfil.html',
  MIS_POSTULACIONES: '/hospitalidad_en_accion/pages/user/mis-postulaciones.html',
  
  // Admin
  ADMIN_DASHBOARD: '/hospitalidad_en_accion/pages/admin/dashboard.html',
  
  // Data
  EVENTOS_JSON: '/hospitalidad_en_accion/data/eventos.json',
  HOTELES_JSON: '/hospitalidad_en_accion/data/hoteles.json',
  COCHERAS_JSON: '/hospitalidad_en_accion/data/cocheras.json',
};

// Función helper para navegar
function navigateTo(route) {
  window.location.href = route;
}
