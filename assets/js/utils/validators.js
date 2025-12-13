/**
 * ============================================
 * VALIDATORS.JS - Validaciones
 * ============================================
 * Funciones para validar formularios y datos
 */

const Validators = {
  
  // ============================================
  // EMAIL
  // ============================================
  
  email(email) {
    if (!email) {
      return { valid: false, message: 'El email es requerido' };
    }
    
    const pattern = CONSTANTS.PATTERNS.EMAIL;
    
    if (!pattern.test(email.toLowerCase())) {
      return { valid: false, message: 'Email inválido' };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // TELÉFONO
  // ============================================
  
  telefono(telefono) {
    if (!telefono) {
      return { valid: false, message: 'El teléfono es requerido' };
    }
    
    const pattern = CONSTANTS.PATTERNS.TELEFONO;
    const limpio = telefono.trim();
    
    if (!pattern.test(limpio)) {
      return { 
        valid: false, 
        message: 'Teléfono inválido. Debe tener entre 9 y 15 dígitos' 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // CONTRASEÑA
  // ============================================
  
  password(password) {
    if (!password) {
      return { valid: false, message: 'La contraseña es requerida' };
    }
    
    const min = CONSTANTS.VALIDACIONES.MIN_PASSWORD_LENGTH;
    const max = CONSTANTS.VALIDACIONES.MAX_PASSWORD_LENGTH;
    
    if (password.length < min) {
      return { 
        valid: false, 
        message: `La contraseña debe tener al menos ${min} caracteres` 
      };
    }
    
    if (password.length > max) {
      return { 
        valid: false, 
        message: `La contraseña no puede tener más de ${max} caracteres` 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  /**
   * Validar fortaleza de contraseña
   */
  passwordStrength(password) {
    if (!password) return { strength: 'none', score: 0, message: '' };
    
    let score = 0;
    
    // Longitud
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    
    // Mayúsculas y minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    
    // Números
    if (/\d/.test(password)) score++;
    
    // Caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const levels = {
      0: { strength: 'none', message: '' },
      1: { strength: 'weak', message: 'Contraseña débil' },
      2: { strength: 'weak', message: 'Contraseña débil' },
      3: { strength: 'medium', message: 'Contraseña media' },
      4: { strength: 'medium', message: 'Contraseña media' },
      5: { strength: 'strong', message: 'Contraseña fuerte' }
    };
    
    return { ...levels[score], score };
  },
  
  /**
   * Validar que las contraseñas coincidan
   */
  passwordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      return { valid: false, message: 'Las contraseñas no coinciden' };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // NOMBRE
  // ============================================
  
  nombre(nombre) {
    if (!nombre) {
      return { valid: false, message: 'El nombre es requerido' };
    }
    
    const limpio = nombre.trim();
    const min = CONSTANTS.VALIDACIONES.MIN_NOMBRE_LENGTH;
    const max = CONSTANTS.VALIDACIONES.MAX_NOMBRE_LENGTH;
    
    if (limpio.length < min) {
      return { 
        valid: false, 
        message: `El nombre debe tener al menos ${min} caracteres` 
      };
    }
    
    if (limpio.length > max) {
      return { 
        valid: false, 
        message: `El nombre no puede tener más de ${max} caracteres` 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // FECHAS
  // ============================================
  
  fecha(fecha) {
    if (!fecha) {
      return { valid: false, message: 'La fecha es requerida' };
    }
    
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) {
      return { valid: false, message: 'Fecha inválida' };
    }
    
    return { valid: true, message: '' };
  },
  
  /**
   * Validar rango de fechas
   */
  rangoFechas(fechaInicio, fechaFin) {
    const validacionInicio = this.fecha(fechaInicio);
    if (!validacionInicio.valid) return validacionInicio;
    
    const validacionFin = this.fecha(fechaFin);
    if (!validacionFin.valid) return validacionFin;
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (fin <= inicio) {
      return { 
        valid: false, 
        message: 'La fecha de fin debe ser posterior a la de inicio' 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  /**
   * Validar que la fecha no esté en el pasado
   */
  fechaFutura(fecha) {
    const validacion = this.fecha(fecha);
    if (!validacion.valid) return validacion;
    
    const date = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (date < hoy) {
      return { 
        valid: false, 
        message: 'La fecha no puede estar en el pasado' 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // NÚMEROS
  // ============================================
  
  numero(valor, min = null, max = null) {
    if (valor === null || valor === undefined || valor === '') {
      return { valid: false, message: 'El valor es requerido' };
    }
    
    const num = parseFloat(valor);
    
    if (isNaN(num)) {
      return { valid: false, message: 'Debe ser un número válido' };
    }
    
    if (min !== null && num < min) {
      return { 
        valid: false, 
        message: `El valor mínimo es ${min}` 
      };
    }
    
    if (max !== null && num > max) {
      return { 
        valid: false, 
        message: `El valor máximo es ${max}` 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  /**
   * Validar número entero
   */
  entero(valor, min = null, max = null) {
    const validacion = this.numero(valor, min, max);
    if (!validacion.valid) return validacion;
    
    const num = parseFloat(valor);
    
    if (!Number.isInteger(num)) {
      return { valid: false, message: 'Debe ser un número entero' };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // URL
  // ============================================
  
  url(url) {
    if (!url) {
      return { valid: false, message: 'La URL es requerida' };
    }
    
    const pattern = CONSTANTS.PATTERNS.URL;
    
    if (!pattern.test(url)) {
      return { valid: false, message: 'URL inválida' };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // ARCHIVO
  // ============================================
  
  archivo(file, maxSizeMB = null, allowedTypes = null) {
    if (!file) {
      return { valid: false, message: 'Debe seleccionar un archivo' };
    }
    
    // Validar tamaño
    const maxSize = maxSizeMB || CONSTANTS.VALIDACIONES.MAX_FILE_SIZE_MB;
    const sizeMB = file.size / (1024 * 1024);
    
    if (sizeMB > maxSize) {
      return { 
        valid: false, 
        message: `El archivo no puede superar ${maxSize}MB` 
      };
    }
    
    // Validar tipo
    const types = allowedTypes || CONSTANTS.VALIDACIONES.ALLOWED_IMAGE_TYPES;
    
    if (!types.includes(file.type)) {
      return { 
        valid: false, 
        message: `Tipo de archivo no permitido. Permitidos: ${types.join(', ')}` 
      };
    }
    
    return { valid: true, message: '' };
  },
  
  // ============================================
  // FORMULARIO COMPLETO
  // ============================================
  
  /**
   * Validar un formulario completo
   * @param {Object} rules - { campo: validador }
   * @param {Object} data - { campo: valor }
   */
  formulario(rules, data) {
    const errors = {};
    let isValid = true;
    
    for (const [campo, validador] of Object.entries(rules)) {
      const valor = data[campo];
      const resultado = validador(valor);
      
      if (!resultado.valid) {
        errors[campo] = resultado.message;
        isValid = false;
      }
    }
    
    return {
      valid: isValid,
      errors: errors
    };
  },
  
  /**
   * Mostrar errores en el DOM
   */
  mostrarErrores(errors, formId) {
    // Limpiar errores previos
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
    });
    
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.style.borderColor = '';
    });
    
    // Mostrar nuevos errores
    for (const [campo, mensaje] of Object.entries(errors)) {
      const input = form.querySelector(`#${campo}`);
      const errorEl = form.querySelector(`#${campo}Error`);
      
      if (input) {
        input.style.borderColor = 'var(--color-error)';
      }
      
      if (errorEl) {
        errorEl.textContent = mensaje;
      }
    }
  }
};

// Exportar globalmente
window.Validators = Validators;

console.log('✅ validators.js cargado correctamente');
