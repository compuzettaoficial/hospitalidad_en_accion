/* ============================================
   HOTELES.SERVICE.JS
   Servicio para manejar hoteles desde GitHub (JSON)
   ============================================ */

class HotelesService {
  
  /**
   * Obtener todos los hoteles
   * @returns {Promise<Array>} Lista de hoteles
   */
  static async getHoteles() {
    try {
      const response = await fetch('/hospitalidad_en_accion/data/hoteles.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.hoteles || [];
      
    } catch (error) {
      console.error('Error al obtener hoteles:', error);
      return [];
    }
  }
  
  /**
   * Obtener hoteles por evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Array>} Lista de hoteles del evento
   */
  static async getHotelesByEvento(eventoId) {
    try {
      const hoteles = await this.getHoteles();
      return hoteles.filter(h => h.eventoId === eventoId);
      
    } catch (error) {
      console.error('Error al obtener hoteles por evento:', error);
      return [];
    }
  }
  
  /**
   * Obtener un hotel por ID
   * @param {string} id - ID del hotel
   * @returns {Promise<Object|null>} Hotel encontrado o null
   */
  static async getHotelById(id) {
    try {
      const hoteles = await this.getHoteles();
      const hotel = hoteles.find(h => h.id === id);
      
      if (!hotel) {
        console.warn(`Hotel con ID "${id}" no encontrado`);
        return null;
      }
      
      return hotel;
      
    } catch (error) {
      console.error('Error al obtener hotel por ID:', error);
      return null;
    }
  }
  
  /**
   * Obtener hoteles recomendados por evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Array>} Lista de hoteles recomendados
   */
  static async getHotelesRecomendados(eventoId) {
    try {
      const hoteles = await this.getHotelesByEvento(eventoId);
      return hoteles.filter(h => h.recomendado === true);
      
    } catch (error) {
      console.error('Error al obtener hoteles recomendados:', error);
      return [];
    }
  }
  
  /**
   * Obtener hoteles destacados por evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Array>} Lista de hoteles destacados
   */
  static async getHotelesDestacados(eventoId) {
    try {
      const hoteles = await this.getHotelesByEvento(eventoId);
      return hoteles.filter(h => h.destacado === true);
      
    } catch (error) {
      console.error('Error al obtener hoteles destacados:', error);
      return [];
    }
  }
  
  /**
   * Ordenar hoteles por distancia al evento
   * @param {Array} hoteles - Lista de hoteles
   * @returns {Array} Hoteles ordenados por distancia
   */
  static ordenarPorDistancia(hoteles) {
    return [...hoteles].sort((a, b) => {
      const distA = a.distanciaEvento?.metros || Infinity;
      const distB = b.distanciaEvento?.metros || Infinity;
      return distA - distB;
    });
  }
  
  /**
   * Ordenar hoteles por precio (menor a mayor)
   * @param {Array} hoteles - Lista de hoteles
   * @param {string} tipoHabitacion - 'simple', 'doble', 'triple'
   * @returns {Array} Hoteles ordenados por precio
   */
  static ordenarPorPrecio(hoteles, tipoHabitacion = 'simple') {
    return [...hoteles].sort((a, b) => {
      const precioA = a.tarifas?.[tipoHabitacion]?.precio || Infinity;
      const precioB = b.tarifas?.[tipoHabitacion]?.precio || Infinity;
      return precioA - precioB;
    });
  }
  
  /**
   * Ordenar hoteles por estrellas (mayor a menor)
   * @param {Array} hoteles - Lista de hoteles
   * @returns {Array} Hoteles ordenados por estrellas
   */
  static ordenarPorEstrellas(hoteles) {
    return [...hoteles].sort((a, b) => {
      const estrellasA = a.caracteristicas?.estrellas || 0;
      const estrellasB = b.caracteristicas?.estrellas || 0;
      return estrellasB - estrellasA;
    });
  }
  
  /**
   * Filtrar hoteles por rango de precio
   * @param {Array} hoteles - Lista de hoteles
   * @param {number} min - Precio mínimo
   * @param {number} max - Precio máximo
   * @param {string} tipoHabitacion - Tipo de habitación
   * @returns {Array} Hoteles filtrados
   */
  static filtrarPorPrecio(hoteles, min, max, tipoHabitacion = 'simple') {
    return hoteles.filter(h => {
      const precio = h.tarifas?.[tipoHabitacion]?.precio;
      return precio && precio >= min && precio <= max;
    });
  }
  
  /**
   * Filtrar hoteles por estrellas
   * @param {Array} hoteles - Lista de hoteles
   * @param {number} estrellas - Número de estrellas mínimo
   * @returns {Array} Hoteles filtrados
   */
  static filtrarPorEstrellas(hoteles, estrellas) {
    return hoteles.filter(h => {
      const hotelEstrellas = h.caracteristicas?.estrellas || 0;
      return hotelEstrellas >= estrellas;
    });
  }
  
  /**
   * Filtrar hoteles por servicios
   * @param {Array} hoteles - Lista de hoteles
   * @param {Array} serviciosRequeridos - Lista de servicios buscados
   * @returns {Array} Hoteles que tienen todos los servicios
   */
  static filtrarPorServicios(hoteles, serviciosRequeridos) {
    return hoteles.filter(h => {
      const serviciosHotel = h.servicios || [];
      return serviciosRequeridos.every(servicio =>
        serviciosHotel.some(s => 
          s.toLowerCase().includes(servicio.toLowerCase())
        )
      );
    });
  }
  
  /**
   * Buscar hoteles por término
   * @param {string} eventoId - ID del evento
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<Array>} Hoteles que coinciden
   */
  static async buscarHoteles(eventoId, termino) {
    try {
      const hoteles = await this.getHotelesByEvento(eventoId);
      const terminoLower = termino.toLowerCase();
      
      return hoteles.filter(h =>
        h.nombre.toLowerCase().includes(terminoLower) ||
        h.direccion.toLowerCase().includes(terminoLower) ||
        h.servicios.some(s => s.toLowerCase().includes(terminoLower))
      );
      
    } catch (error) {
      console.error('Error al buscar hoteles:', error);
      return [];
    }
  }
  
  /**
   * Obtener rango de precios de hoteles de un evento
   * @param {string} eventoId - ID del evento
   * @param {string} tipoHabitacion - Tipo de habitación
   * @returns {Promise<Object>} {min, max}
   */
  static async getRangoPreciosEvento(eventoId, tipoHabitacion = 'simple') {
    try {
      const hoteles = await this.getHotelesByEvento(eventoId);
      const precios = hoteles
        .map(h => h.tarifas?.[tipoHabitacion]?.precio)
        .filter(p => p !== undefined);
      
      if (precios.length === 0) {
        return { min: 0, max: 0 };
      }
      
      return {
        min: Math.min(...precios),
        max: Math.max(...precios)
      };
      
    } catch (error) {
      console.error('Error al obtener rango de precios:', error);
      return { min: 0, max: 0 };
    }
  }
  
  /**
   * Calcular precio total de estadía
   * @param {Object} hotel - Objeto hotel
   * @param {string} tipoHabitacion - Tipo de habitación
   * @param {number} noches - Número de noches
   * @returns {number} Precio total
   */
  static calcularPrecioTotal(hotel, tipoHabitacion, noches) {
    const precioPorNoche = hotel.tarifas?.[tipoHabitacion]?.precio || 0;
    return precioPorNoche * noches;
  }
  
  /**
   * Calcular número de noches entre fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   * @returns {number} Número de noches
   */
  static calcularNoches(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = fin - inicio;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Obtener tipos de habitación disponibles
   * @param {Object} hotel - Objeto hotel
   * @returns {Array} Lista de tipos disponibles
   */
  static getTiposHabitacion(hotel) {
    if (!hotel.tarifas) return [];
    return Object.keys(hotel.tarifas);
  }
  
  /**
   * Formatear precio con moneda
   * @param {number} precio - Precio numérico
   * @param {string} moneda - Código de moneda
   * @returns {string} Precio formateado
   */
  static formatearPrecio(precio, moneda = 'PEN') {
    const simbolos = {
      'PEN': 'S/.',
      'USD': '$',
      'EUR': '€'
    };
    
    const simbolo = simbolos[moneda] || moneda;
    return `${simbolo} ${precio.toFixed(2)}`;
  }
  
  /**
   * Obtener teléfono principal del hotel
   * @param {Object} hotel - Objeto hotel
   * @returns {Object|null} Teléfono principal
   */
  static getTelefonoPrincipal(hotel) {
    const telefonos = hotel.contacto?.telefonos || [];
    return telefonos.find(t => t.principal === true) || telefonos[0] || null;
  }
  
  /**
   * Obtener teléfono de WhatsApp
   * @param {Object} hotel - Objeto hotel
   * @returns {Object|null} Teléfono de WhatsApp
   */
  static getTelefonoWhatsApp(hotel) {
    const telefonos = hotel.contacto?.telefonos || [];
    return telefonos.find(t => t.tipo === 'whatsapp') || null;
  }
  
  /**
   * Generar enlace de WhatsApp
   * @param {string} numero - Número de teléfono
   * @param {string} mensaje - Mensaje predeterminado
   * @returns {string} URL de WhatsApp
   */
  static getWhatsAppLink(numero, mensaje = '') {
    const numeroLimpio = numero.replace(/\D/g, '');
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
  }
  
  /**
   * Generar mensaje de WhatsApp para reserva
   * @param {Object} hotel - Objeto hotel
   * @param {Object} datos - {fechaInicio, fechaFin, tipoHabitacion}
   * @returns {string} Mensaje formateado
   */
  static generarMensajeReserva(hotel, datos) {
    const { fechaInicio, fechaFin, tipoHabitacion } = datos;
    const noches = this.calcularNoches(fechaInicio, fechaFin);
    
    return `Hola, quisiera reservar una habitación ${tipoHabitacion} en ${hotel.nombre}:
    
📅 Entrada: ${fechaInicio}
📅 Salida: ${fechaFin}
🛏️ Tipo: ${tipoHabitacion}
🌙 Noches: ${noches}

¿Hay disponibilidad?`;
  }
  
  /**
   * Verificar si hotel tiene servicio específico
   * @param {Object} hotel - Objeto hotel
   * @param {string} servicio - Nombre del servicio
   * @returns {boolean} true si tiene el servicio
   */
  static tieneServicio(hotel, servicio) {
    const servicios = hotel.servicios || [];
    return servicios.some(s => 
      s.toLowerCase().includes(servicio.toLowerCase())
    );
  }
  
  /**
   * Obtener estadísticas de hoteles de un evento
   * @param {string} eventoId - ID del evento
   * @returns {Promise<Object>} Estadísticas
   */
  static async getEstadisticasEvento(eventoId) {
    try {
      const hoteles = await this.getHotelesByEvento(eventoId);
      
      const precios = hoteles
        .map(h => h.tarifas?.simple?.precio)
        .filter(p => p !== undefined);
      
      const estrellas = hoteles
        .map(h => h.caracteristicas?.estrellas)
        .filter(e => e !== undefined);
      
      return {
        total: hoteles.length,
        recomendados: hoteles.filter(h => h.recomendado).length,
        destacados: hoteles.filter(h => h.destacado).length,
        verificados: hoteles.filter(h => h.verificado).length,
        precioMinimo: precios.length ? Math.min(...precios) : 0,
        precioMaximo: precios.length ? Math.max(...precios) : 0,
        precioPromedio: precios.length ? 
          precios.reduce((a, b) => a + b, 0) / precios.length : 0,
        estrellasPromedio: estrellas.length ?
          estrellas.reduce((a, b) => a + b, 0) / estrellas.length : 0
      };
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }
  
  /**
   * Agrupar hoteles por estrellas
   * @param {Array} hoteles - Lista de hoteles
   * @returns {Object} Hoteles agrupados {1: [...], 2: [...], ...}
   */
  static agruparPorEstrellas(hoteles) {
    return hoteles.reduce((grupos, hotel) => {
      const estrellas = hotel.caracteristicas?.estrellas || 0;
      if (!grupos[estrellas]) {
        grupos[estrellas] = [];
      }
      grupos[estrellas].push(hotel);
      return grupos;
    }, {});
  }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HotelesService;
}
