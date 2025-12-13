/**
 * ============================================
 * HOTELES.API.JS - Servicio de Hoteles
 * ============================================
 * Carga hoteles desde JSON (GitHub)
 */

class HotelesAPI {
  
  constructor() {
    this.cache = {
      index: null,
      ciudades: {},
      lastFetch: {}
    };
  }
  
  // ============================================
  // CARGAR ÍNDICE MAESTRO
  // ============================================
  async getIndex() {
    try {
      if (this.cache.index && this._isCacheValid('index')) {
        console.log('📦 Cache: Usando índice de hoteles cacheado');
        return this.cache.index;
      }
      
      console.log('🌐 Cargando índice de hoteles...');
      const response = await fetch(ROUTES.DATA.HOTELES.INDEX());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.index = data;
      this.cache.lastFetch.index = Date.now();
      
      console.log('✅ Índice de hoteles cargado');
      return data;
      
    } catch (error) {
      console.error('❌ Error cargando índice de hoteles:', error);
      throw new Error('No se pudo cargar el índice de hoteles');
    }
  }
  
  // ============================================
  // CARGAR HOTELES DE UNA CIUDAD
  // ============================================
  async getHotelesByCiudad(ciudad) {
    try {
      const ciudadSlug = ciudad.toLowerCase().replace(/\s+/g, '-');
      
      if (this.cache.ciudades[ciudadSlug] && this._isCacheValid(`ciudad_${ciudadSlug}`)) {
        console.log(`📦 Cache: Usando hoteles de ${ciudad} cacheados`);
        return this.cache.ciudades[ciudadSlug];
      }
      
      console.log(`🌐 Cargando hoteles de ${ciudad}...`);
      const response = await fetch(ROUTES.DATA.HOTELES.BY_CIUDAD(ciudad));
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ No hay hoteles para ${ciudad}`);
          return { ciudad: ciudadSlug, totalHoteles: 0, hoteles: [] };
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.ciudades[ciudadSlug] = data;
      this.cache.lastFetch[`ciudad_${ciudadSlug}`] = Date.now();
      
      console.log(`✅ Hoteles de ${ciudad} cargados:`, data.totalHoteles);
      return data;
      
    } catch (error) {
      console.error(`❌ Error cargando hoteles de ${ciudad}:`, error);
      throw error;
    }
  }
  
  // ============================================
  // OBTENER HOTELES PARA UN EVENTO
  // ============================================
  async getHotelesByEvento(eventoId) {
    try {
      // Primero obtener el evento para saber la ciudad
      const evento = await EventosAPI.getEventoById(eventoId);
      
      if (!evento) {
        console.warn(`⚠️ Evento no encontrado: ${eventoId}`);
        return [];
      }
      
      const ciudad = evento.ubicacion.ciudad;
      const data = await this.getHotelesByCiudad(ciudad);
      
      // Filtrar hoteles que tengan el eventoId (si está definido)
      let hoteles = data.hoteles;
      
      if (hoteles.length > 0 && hoteles[0].eventoId) {
        hoteles = hoteles.filter(h => h.eventoId === eventoId);
      }
      
      console.log(`✅ Hoteles para evento ${eventoId}:`, hoteles.length);
      return hoteles;
      
    } catch (error) {
      console.error(`❌ Error obteniendo hoteles para evento ${eventoId}:`, error);
      return [];
    }
  }
  
  // ============================================
  // BUSCAR HOTEL POR ID
  // ============================================
  async getHotelById(id, ciudad) {
    try {
      const data = await this.getHotelesByCiudad(ciudad);
      const hotel = data.hoteles.find(h => h.id === id);
      
      if (!hotel) {
        console.warn(`⚠️ Hotel no encontrado: ${id}`);
        return null;
      }
      
      return hotel;
      
    } catch (error) {
      console.error(`❌ Error buscando hotel ${id}:`, error);
      return null;
    }
  }
  
  // ============================================
  // ORDENAR HOTELES
  // ============================================
  ordenarPorDistancia(hoteles) {
    return [...hoteles].sort((a, b) => {
      const distA = a.distanciaEvento?.metros || 999999;
      const distB = b.distanciaEvento?.metros || 999999;
      return distA - distB;
    });
  }
  
  ordenarPorPrecio(hoteles) {
    return [...hoteles].sort((a, b) => {
      const precioA = a.tarifas?.simple?.precio || 999999;
      const precioB = b.tarifas?.simple?.precio || 999999;
      return precioA - precioB;
    });
  }
  
  ordenarPorEstrellas(hoteles) {
    return [...hoteles].sort((a, b) => {
      const estA = a.caracteristicas?.estrellas || 0;
      const estB = b.caracteristicas?.estrellas || 0;
      return estB - estA;
    });
  }
  
  // ============================================
  // FILTRAR HOTELES
  // ============================================
  filtrarPorEstrellas(hoteles, minEstrellas) {
    return hoteles.filter(h => 
      (h.caracteristicas?.estrellas || 0) >= minEstrellas
    );
  }
  
  filtrarPorPrecio(hoteles, maxPrecio) {
    return hoteles.filter(h => 
      (h.tarifas?.simple?.precio || 999999) <= maxPrecio
    );
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  getTelefonoPrincipal(hotel) {
    return hotel.contacto?.telefonos?.find(t => t.principal) || 
           hotel.contacto?.telefonos?.[0];
  }
  
  getTelefonoWhatsApp(hotel) {
    return hotel.contacto?.telefonos?.find(t => t.tipo === 'whatsapp');
  }
  
  getWhatsAppLink(numero, mensaje = '') {
    const numeroLimpio = numero.replace(/\D/g, '');
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  }
  
  _isCacheValid(key) {
    if (!this.cache.lastFetch[key]) return false;
    const elapsed = Date.now() - this.cache.lastFetch[key];
    return elapsed < CONSTANTS.CACHE.TTL_HOTELES;
  }
  
  clearCache() {
    this.cache = {
      index: null,
      ciudades: {},
      lastFetch: {}
    };
    console.log('🗑️ Cache de hoteles limpiado');
  }
}

// Instancia única
const hotelesAPI = new HotelesAPI();

// Exportar globalmente
window.HotelesAPI = hotelesAPI;

console.log('✅ hoteles.api.js cargado correctamente');
