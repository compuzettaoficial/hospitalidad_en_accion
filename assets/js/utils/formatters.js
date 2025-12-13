/**
 * ============================================
 * FORMATTERS.JS - Formateo de Datos
 * ============================================
 * Funciones para formatear fechas, moneda, texto, etc.
 */

const Formatters = {
  
  // ============================================
  // FECHAS
  // ============================================
  
  /**
   * Formatear fecha en español
   * @param {string|Date} fecha 
   * @param {string} formato - 'corto', 'largo', 'completo'
   */
  fecha(fecha, formato = 'largo') {
    if (!fecha) return 'Fecha no disponible';
    
    try {
      const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
      
      // Ajustar para timezone (evitar problemas de día anterior)
      const dateUTC = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      const opciones = {
        'corto': { day: 'numeric', month: 'short', year: 'numeric' },
        'largo': { day: 'numeric', month: 'long', year: 'numeric' },
        'completo': { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }
      };
      
      return dateUTC.toLocaleDateString('es-PE', opciones[formato]);
      
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  },
  
  /**
   * Formatear rango de fechas
   */
  rangoFechas(inicio, fin) {
    if (!inicio || !fin) return '';
    
    try {
      const dateInicio = new Date(inicio);
      const dateFin = new Date(fin);
      
      // Ajustar timezone
      const inicioUTC = new Date(dateInicio.getTime() + dateInicio.getTimezoneOffset() * 60000);
      const finUTC = new Date(dateFin.getTime() + dateFin.getTimezoneOffset() * 60000);
      
      const meses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      const diaInicio = inicioUTC.getDate();
      const diaFin = finUTC.getDate();
      const mesInicio = meses[inicioUTC.getMonth()];
      const mesFin = meses[finUTC.getMonth()];
      const año = inicioUTC.getFullYear();
      
      // Si es el mismo mes
      if (inicioUTC.getMonth() === finUTC.getMonth()) {
        return `${diaInicio}-${diaFin} ${mesInicio} ${año}`;
      }
      
      // Si son meses diferentes
      return `${diaInicio} ${mesInicio} - ${diaFin} ${mesFin} ${año}`;
      
    } catch (error) {
      console.error('Error formateando rango de fechas:', error);
      return 'Rango inválido';
    }
  },
  
  /**
   * Calcular días restantes
   */
  diasRestantes(fecha) {
    try {
      const hoy = new Date();
      const objetivo = new Date(fecha);
      
      // Ajustar timezone
      const objetivoUTC = new Date(objetivo.getTime() + objetivo.getTimezoneOffset() * 60000);
      
      const diff = objetivoUTC - hoy;
      const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      return dias;
      
    } catch (error) {
      console.error('Error calculando días restantes:', error);
      return null;
    }
  },
  
  /**
   * Formatear días restantes en texto
   */
  textoTiempoRestante(fecha) {
    const dias = this.diasRestantes(fecha);
    
    if (dias === null) return '';
    if (dias < 0) return 'Evento finalizado';
    if (dias === 0) return '¡Hoy!';
    if (dias === 1) return 'Mañana';
    if (dias <= 7) return `En ${dias} días`;
    if (dias <= 30) return `En ${Math.ceil(dias / 7)} semanas`;
    
    return `En ${Math.ceil(dias / 30)} meses`;
  },
  
  /**
   * Calcular duración en noches
   */
  calcularNoches(fechaInicio, fechaFin) {
    try {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diff = fin - inicio;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  },
  
  // ============================================
  // MONEDA
  // ============================================
  
  /**
   * Formatear precio en soles
   */
  moneda(precio, incluirSimbolo = true) {
    if (precio === null || precio === undefined) return 'Precio no disponible';
    
    const numeroFormateado = parseFloat(precio).toLocaleString('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return incluirSimbolo ? `S/. ${numeroFormateado}` : numeroFormateado;
  },
  
  /**
   * Formatear rango de precios
   */
  rangoPrecio(minimo, maximo) {
    if (!minimo && !maximo) return 'Precio no disponible';
    if (!maximo) return `Desde ${this.moneda(minimo)}`;
    if (!minimo) return `Hasta ${this.moneda(maximo)}`;
    
    return `${this.moneda(minimo)} - ${this.moneda(maximo)}`;
  },
  
  // ============================================
  // DISTANCIA
  // ============================================
  
  /**
   * Formatear distancia
   */
  distancia(metros) {
    if (!metros) return '';
    
    if (metros < 1000) {
      return `${metros} metros`;
    }
    
    const km = (metros / 1000).toFixed(1);
    return `${km} km`;
  },
  
  /**
   * Formatear tiempo estimado caminando
   */
  tiempoCaminando(metros) {
    if (!metros) return '';
    
    // Velocidad promedio: 80 metros/minuto
    const minutos = Math.ceil(metros / 80);
    
    if (minutos < 60) {
      return `${minutos} min`;
    }
    
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  },
  
  // ============================================
  // TEXTO
  // ============================================
  
  /**
   * Truncar texto
   */
  truncar(texto, maxLength = 100, sufijo = '...') {
    if (!texto) return '';
    if (texto.length <= maxLength) return texto;
    
    return texto.substring(0, maxLength).trim() + sufijo;
  },
  
  /**
   * Capitalizar primera letra
   */
  capitalizar(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  },
  
  /**
   * Capitalizar cada palabra
   */
  capitalizarPalabras(texto) {
    if (!texto) return '';
    return texto.split(' ')
      .map(palabra => this.capitalizar(palabra))
      .join(' ');
  },
  
  /**
   * Crear slug (URL amigable)
   */
  slug(texto) {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .normalize('NFD') // Descomponer acentos
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  },
  
  /**
   * Pluralizar
   */
  pluralizar(cantidad, singular, plural) {
    return cantidad === 1 ? singular : plural;
  },
  
  // ============================================
  // NÚMEROS
  // ============================================
  
  /**
   * Formatear número con separadores de miles
   */
  numero(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('es-PE');
  },
  
  /**
   * Formatear porcentaje
   */
  porcentaje(valor, decimales = 0) {
    if (valor === null || valor === undefined) return '0%';
    return `${valor.toFixed(decimales)}%`;
  },
  
  // ============================================
  // TELÉFONO
  // ============================================
  
  /**
   * Formatear teléfono
   */
  telefono(numero) {
    if (!numero) return '';
    
    // Limpiar
    const limpio = numero.replace(/\D/g, '');
    
    // Formato peruano: +51 999 888 777
    if (limpio.length === 11 && limpio.startsWith('51')) {
      return `+51 ${limpio.substring(2, 5)} ${limpio.substring(5, 8)} ${limpio.substring(8)}`;
    }
    
    // Formato sin código país: 999 888 777
    if (limpio.length === 9) {
      return `${limpio.substring(0, 3)} ${limpio.substring(3, 6)} ${limpio.substring(6)}`;
    }
    
    return numero;
  },
  
  // ============================================
  // ESTRELLAS (para hoteles)
  // ============================================
  
  /**
   * Generar estrellas HTML
   */
  estrellas(cantidad, tipo = 'filled') {
    if (!cantidad || cantidad < 1 || cantidad > 5) return '';
    
    const estrella = tipo === 'filled' ? '★' : '☆';
    return estrella.repeat(cantidad);
  },
  
  /**
   * Generar estrellas con ícono Font Awesome
   */
  estrellasHTML(cantidad) {
    if (!cantidad || cantidad < 1 || cantidad > 5) return '';
    
    let html = '';
    for (let i = 0; i < 5; i++) {
      if (i < cantidad) {
        html += '<i class="fas fa-star" style="color: #FFA500;"></i>';
      } else {
        html += '<i class="far fa-star" style="color: #D1D5DB;"></i>';
      }
    }
    return html;
  },
  
  // ============================================
  // ESTADO (para eventos y postulaciones)
  // ============================================
  
  /**
   * Obtener badge HTML para estado
   */
  badgeEstado(estado) {
    const estados = {
      'activo': { texto: 'Activo', clase: 'success' },
      'inactivo': { texto: 'Inactivo', clase: 'text-light' },
      'pendiente': { texto: 'Pendiente', clase: 'warning' },
      'aprobado': { texto: 'Aprobado', clase: 'success' },
      'rechazado': { texto: 'Rechazado', clase: 'error' },
      'emparejado': { texto: 'Emparejado', clase: 'success' },
      'cancelado': { texto: 'Cancelado', clase: 'text-light' }
    };
    
    const info = estados[estado] || { texto: estado, clase: 'text-light' };
    
    return `<span class="badge badge-${info.clase}">${info.texto}</span>`;
  },
  
  // ============================================
  // ARCHIVO
  // ============================================
  
  /**
   * Formatear tamaño de archivo
   */
  tamañoArchivo(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const unidades = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${unidades[i]}`;
  }
};

// Exportar globalmente
window.Formatters = Formatters;

console.log('✅ formatters.js cargado correctamente');
