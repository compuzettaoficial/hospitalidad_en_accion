/**
 * ============================================
 * COCHERAS.API.JS - Servicio de Cocheras
 * ============================================
 * Carga cocheras desde JSON (GitHub)
 */

class CocherasAPI {
  
  constructor() {
    this.cache = {
      ciudades: {},
      lastFetch: {}
    };
  }
  
  // ============================================
  // CARGAR COCHERAS DE UNA CIUDAD
  // ============================================
  async getCocherasByCiudad(ciudad) {
    try {
      const ciudadSlug = ciudad.toLowerCase().replace(/\s+/g, '-');
      
      if (this.cache.ciudades[ciudadSlug] && this._isCacheValid(`ciudad_${ciudadSlug}`)) {
        console.log(`📦 Cache: Usando cocheras de ${ciudad} cacheadas`);
        return this.cache.ciudades[ciudadSlug];
      }
      
      console.log(`🌐 Cargando cocheras de ${ciudad}...`);
      const response = await fetch(ROUTES.DATA.COCHERAS.BY_CIUDAD(ciudad));
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ No hay cocheras para ${ciudad}`);
          return { ciudad: ciudadSlug, totalCocheras: 0, cocheras: [] };
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      this.cache.ciudades[ciudadSlug] = data;
      this.cache.lastFetch[`ciudad_${ciudadSlug}`] = Date.now();
      
      console.log(`✅ Cocheras de ${ciudad} cargadas:`, data.totalCocheras);
      return data;
      
    } catch (error) {
      console.error(`❌ Error cargando cocheras de ${ciudad}:`, error);
      throw error;
    }
  }
  
  // ============================================
  // OBTENER COCHERAS PARA UN EVENTO
  // ============================================
  async getCocherasByEvento(eventoId) {
    try {
      const evento = await EventosAPI.getEventoById(eventoId);
      
      if (!evento) {
        console.warn(`⚠️ Evento no encontrado: ${eventoId}`);
        return [];
      }
      
      const ciudad = evento.ubicacion.ciudad;
      const data = await this.getCocherasByCiudad(ciudad);
      
      let cocheras = data.cocheras;
      
      if (cocheras.length > 0 && cocheras[0].eventoId) {
        cocheras = cocheras.filter(c => c.eventoId === eventoId);
      }
      
      // Limitar a máximo 3 cocheras
      cocheras = cocheras.slice(0, 3);
      
      console.log(`✅ Cocheras para evento ${eventoId}:`, cocheras.length);
      return cocheras;
      
    } catch (error) {
      console.error(`❌ Error obteniendo cocheras para evento ${eventoId}:`, error);
      return [];
    }
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
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
      ciudades: {},
      lastFetch: {}
    };
    console.log('🗑️ Cache de cocheras limpiado');
  }
}

// Instancia única
const cocherasAPI = new CocherasAPI();

// Exportar globalmente
window.CocherasAPI = cocherasAPI;

console.log('✅ cocheras.api.js cargado correctamente');
