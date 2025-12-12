/**
 * ============================================
 * CONSTANTS.JS - CONSTANTES GLOBALES
 * ============================================
 * Valores que se usan en todo el proyecto
 */

const CONSTANTS = {
  
  // ============================================
  // APLICACIÓN
  // ============================================
  APP: {
    NAME: 'Hospitalidad en Acción',
    VERSION: '2.0.0',
    DESCRIPTION: 'Plataforma de hospitalidad cristiana para eventos en Perú',
    CONTACT_EMAIL: 'info@hospitalidadenaccion.pe',
    CONTACT_PHONE: '+51 999 888 777'
  },
  
  // ============================================
  // ROLES DE USUARIO
  // ============================================
  ROLES: {
    USER: 'user',           // Usuario normal
    EDITOR: 'editor',       // Puede crear eventos/hoteles
    ADMIN: 'admin'          // Control total
  },
  
  // ============================================
  // ESTADOS DE POSTULACIONES
  // ============================================
  ESTADOS: {
    PENDIENTE: 'pendiente',
    APROBADO: 'aprobado',
    RECHAZADO: 'rechazado',
    EMPAREJADO: 'emparejado',
    ASIGNADO: 'asignado',
    CANCELADO: 'cancelado',
    COMPLETADO: 'completado'
  },
  
  // ============================================
  // TIPOS DE POSTULACIÓN
  // ============================================
  TIPOS_POSTULACION: {
    VISITANTE: 'visitante',
    ANFITRION: 'anfitrion'
  },
  
  // ============================================
  // CIUDADES DISPONIBLES
  // ============================================
  CIUDADES: [
    'Chimbote',
    'Lima',
    'Arequipa',
    'Trujillo',
    'Cusco',
    'Chiclayo',
    'Piura',
    'Iquitos',
    'Huancayo',
    'Tacna'
  ],
  
  // ============================================
  // DEPARTAMENTOS
  // ============================================
  DEPARTAMENTOS: {
    'Áncash': ['Chimbote', 'Huaraz', 'Casma'],
    'Lima': ['Lima', 'Callao'],
    'Arequipa': ['Arequipa'],
    'La Libertad': ['Trujillo'],
    'Cusco': ['Cusco'],
    'Lambayeque': ['Chiclayo'],
    'Piura': ['Piura'],
    'Loreto': ['Iquitos'],
    'Junín': ['Huancayo'],
    'Tacna': ['Tacna']
  },
  
  // ============================================
  // AÑOS DISPONIBLES
  // ============================================
  AÑOS: {
    ACTUAL: 2025,
    DISPONIBLES: [2026, 2027, 2028],
    MIN: 2026,
    MAX: 2030
  },
  
  // ============================================
  // CATEGORÍAS DE EVENTOS
  // ============================================
  CATEGORIAS_EVENTOS: [
    'Convención',
    'Conferencia',
    'Retiro',
    'Congreso',
    'Seminario',
    'Culto Especial',
    'Campaña'
  ],
  
  // ============================================
  // SERVICIOS DE HOTELES
  // ============================================
  SERVICIOS_HOTEL: [
    'WiFi gratuito',
    'Desayuno incluido',
    'Estacionamiento gratuito',
    'Aire acondicionado',
    'TV por cable',
    'Room service',
    'Lavandería',
    'Restaurant',
    'Bar',
    'Piscina',
    'Gimnasio',
    'Spa'
  ],
  
  // ============================================
  // VALIDACIONES
  // ============================================
  VALIDACIONES: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 50,
    MIN_NOMBRE_LENGTH: 3,
    MAX_NOMBRE_LENGTH: 100,
    MIN_TELEFONO_LENGTH: 9,
    MAX_TELEFONO_LENGTH: 15,
    MAX_PERSONAS_HOSPEDAJE: 10,
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  },
  
  // ============================================
  // LÍMITES DE PAGINACIÓN
  // ============================================
  PAGINATION: {
    EVENTOS_PER_PAGE: 9,
    HOTELES_PER_PAGE: 6,
    POSTULACIONES_PER_PAGE: 10,
    USUARIOS_PER_PAGE: 20
  },
  
  // ============================================
  // ÍCONOS POR ESTADO
  // ============================================
  ICONOS: {
    ESTADOS: {
      pendiente: 'fa-clock',
      aprobado: 'fa-check-circle',
      rechazado: 'fa-times-circle',
      emparejado: 'fa-handshake',
      asignado: 'fa-users',
      cancelado: 'fa-ban',
      completado: 'fa-check-double'
    },
    TIPOS: {
      visitante: 'fa-hand-holding-heart',
      anfitrion: 'fa-home'
    }
  },
  
  // ============================================
  // COLORES POR ESTADO
  // ============================================
  COLORES: {
    ESTADOS: {
      pendiente: 'warning',
      aprobado: 'success',
      rechazado: 'error',
      emparejado: 'success',
      asignado: 'success',
      cancelado: 'text-light',
      completado: 'success'
    }
  },
  
  // ============================================
  // MENSAJES
  // ============================================
  MENSAJES: {
    ERROR_GENERICO: 'Ocurrió un error. Por favor intenta nuevamente.',
    ERROR_RED: 'Error de conexión. Verifica tu internet.',
    ERROR_PERMISOS: 'No tienes permisos para realizar esta acción.',
    EXITO_GUARDADO: 'Guardado correctamente.',
    EXITO_ELIMINADO: 'Eliminado correctamente.',
    CONFIRMACION_ELIMINAR: '¿Estás seguro de eliminar? Esta acción no se puede deshacer.',
    SIN_RESULTADOS: 'No se encontraron resultados.',
    CARGANDO: 'Cargando...'
  },
  
  // ============================================
  // FIREBASE COLLECTIONS
  // ============================================
  COLLECTIONS: {
    USUARIOS: 'usuarios',
    POSTULACIONES: 'postulaciones',
    EMPAREJAMIENTOS: 'emparejamientos',
    VALORACIONES: 'valoraciones',
    NOTIFICACIONES: 'notificaciones'
  },
  
  // ============================================
  // CACHE
  // ============================================
  CACHE: {
    TTL_EVENTOS: 1000 * 60 * 10,      // 10 minutos
    TTL_HOTELES: 1000 * 60 * 30,      // 30 minutos
    TTL_METADATA: 1000 * 60 * 60      // 1 hora
  },
  
  // ============================================
  // REGEX PATTERNS
  // ============================================
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONO: /^[\+]?[0-9\s]{9,15}$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    URL: /^https?:\/\/.+/
  }
};

// Congelar objeto para evitar modificaciones
Object.freeze(CONSTANTS);
Object.freeze(CONSTANTS.APP);
Object.freeze(CONSTANTS.ROLES);
Object.freeze(CONSTANTS.ESTADOS);
Object.freeze(CONSTANTS.VALIDACIONES);
Object.freeze(CONSTANTS.PAGINATION);

// Exportar globalmente
window.CONSTANTS = CONSTANTS;

console.log('✅ constants.js cargado correctamente');
