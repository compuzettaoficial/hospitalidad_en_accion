/**
 * ============================================
 * EVENTOS.API.JS - Servicio de Eventos
 * ============================================
 * Carga eventos desde JSON (GitHub)
 * Cache inteligente para optimizar carga
 */

class EventosAPI {
  
  constructor() {
    this.cache = {
      index: null,
      años: {},
      lastFetch: {}
    };
  }
  
  // ============================================
  // CARGAR ÍNDICE MAESTRO
  // ============================================
  async getIndex() {
    try {
      // Si hay cache válido, usarlo
      if (this.cache.index && this._isCacheValid('index')) {
        console.log('📦 Cache: Usando índice de eventos cacheado');
        return this.cache.index;
      }
      
      console.log('🌐 Cargando índice de eventos...');
      const response = await fetch(ROUTES.DATA.EVENTOS.INDEX());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar en cache
      this.cache.index = data;
      this.cache.lastFetch.index = Date.now();
      
      console.log('✅ Índice de eventos cargado:', data.estadisticas.totalEventos, 'eventos');
      return data;
      
    } catch (error) {
      console.error('❌ Error cargando índice de eventos:', error);
      throw new Error('No se pudo cargar el índice de eventos');
    }
  }
  
  // ============================================
  // CARGAR EVENTOS DE UN AÑO
  // ============================================
  async getEventosByYear(year) {
    try {
      // Si hay cache válido, usarlo
      if (this.cache.años[year] && this._isCacheValid(`año_${year}`)) {
        console.log(`📦 Cache: Usando eventos ${year} cacheados`);
        return this.cache.años[year];
      }
      
      console.log(`🌐 Cargando eventos del año ${year}...`);
      const response = await fetch(ROUTES.DATA.EVENTOS.BY_YEAR(year));
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ No hay archivo de eventos para ${year}`);
          return { año: year, totalEventos: 0, eventos: [] };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar en cache
      this.cache.años[year] = data;
      this.cache.lastFetch[`año_${year}`] = Date.now();
      
      console.log(`✅ Eventos ${year} cargados:`, data.totalEventos, 'eventos');
      return data;
      
    } catch (error) {
      console.error(`❌ Error cargando eventos ${year}:`, error);
      throw new Error(`No se pudieron cargar los eventos de ${year}`);
    }
  }
  
  // ============================================
  // OBTENER TODOS LOS EVENTOS DISPONIBLES
  // ============================================
  async getAllEventos() {
    try {
      const index = await this.getIndex();
      const años = Object.keys(index.años);
      
      const allEventos = [];
      
      for (const año of años) {
        const data = await this.getEventosByYear(parseInt(año));
        allEventos.push(...data.eventos);
      }
      
      console.log(`✅ Total eventos cargados: ${allEventos.length}`);
      return allEventos;
      
    } catch (error) {
      console.error('❌ Error cargando todos los eventos:', error);
      throw error;
    }
  }
  
  // ============================================
  // BUSCAR EVENTO POR ID
  // ============================================
  async getEventoById(id) {
    try {
      console.log(`🔍 Buscando evento: ${id}`);
      
      const allEventos = await this.getAllEventos();
      const evento = allEventos.find(e => e.id === id || e.slug === id);
      
      if (!evento) {
        console.warn(`⚠️ Evento no encontrado: ${id}`);
        return null;
      }
      
      console.log(`✅ Evento encontrado: ${evento.titulo}`);
      return evento;
      
    } catch (error) {
      console.error(`❌ Error buscando evento ${id}:`, error);
      throw error;
    }
  }
  
  // ============================================
  // FILTRAR EVENTOS
  // ============================================
  async filtrarEventos(filtros = {}) {
    try {
      let eventos = await this.getAllEventos();
      
      // Filtro por ciudad
      if (filtros.ciudad) {
        eventos = eventos.filter(e => 
          e.ubicacion.ciudad === filtros.ciudad.toLowerCase()
        );
      }
      
      // Filtro por departamento
      if (filtros.departamento) {
        eventos = eventos.filter(e => 
          e.ubicacion.departamento === filtros.departamento
        );
      }
      
      // Filtro por estado
      if (filtros.estado) {
        eventos = eventos.filter(e => e.estado === filtros.estado);
      }
      
      // Filtro por categoría
      if (filtros.categoria) {
        eventos = eventos.filter(e => e.categoria === filtros.categoria);
      }
      
      // Filtro por búsqueda de texto
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        eventos = eventos.filter(e => 
          e.titulo.toLowerCase().includes(busqueda) ||
          e.descripcion.toLowerCase().includes(busqueda) ||
          e.ubicacion.ciudadNombre.toLowerCase().includes(busqueda) ||
          e.ubicacion.lugar.toLowerCase().includes(busqueda)
        );
      }
      
      // Filtro por fecha (próximos eventos)
      if (filtros.proximos) {
        const hoy = new Date();
        eventos = eventos.filter(e => new Date(e.fechaInicio) >= hoy);
      }
      
      // Filtro por destacados
      if (filtros.destacados) {
        eventos = eventos.filter(e => e.destacado === true);
      }
      
      console.log(`🔍 Filtros aplicados. Resultados: ${eventos.length}`);
      return eventos;
      
    } catch (error) {
      console.error('❌ Error filtrando eventos:', error);
      throw error;
    }
  }
  
  // ============================================
  // OBTENER EVENTOS ACTIVOS
  // ============================================
  async getEventosActivos() {
    return this.filtrarEventos({ 
      estado: 'activo',
      proximos: true 
    });
  }
  
  // ============================================
  // OBTENER EVENTOS DESTACADOS
  // ============================================
  async getEventosDestacados() {
    return this.filtrarEventos({ 
      destacados: true,
      estado: 'activo' 
    });
  }
  
  // ============================================
  // OBTENER PRÓXIMO EVENTO
  // ============================================
  async getProximoEvento() {
    try {
      const eventos = await this.getEventosActivos();
      
      if (eventos.length === 0) return null;
      
      // Ordenar por fecha más cercana
      eventos.sort((a, b) => 
        new Date(a.fechaInicio) - new Date(b.fechaInicio)
      );
      
      return eventos[0];
      
    } catch (error) {
      console.error('❌ Error obteniendo próximo evento:', error);
      return null;
    }
  }
  
  // ============================================
  // OBTENER EVENTOS POR CIUDAD
  // ============================================
  async getEventosByCiudad(ciudad) {
    return this.filtrarEventos({ ciudad: ciudad.toLowerCase() });
  }
  
  // ============================================
  // BUSCAR EVENTOS (con paginación)
  // ============================================
  async buscarEventos(termino, pagina = 1) {
    try {
      const eventos = await this.filtrarEventos({ busqueda: termino });
      
      // Paginar resultados
      const porPagina = CONSTANTS.PAGINATION.EVENTOS_PER_PAGE;
      const inicio = (pagina - 1) * porPagina;
      const fin = inicio + porPagina;
      
      return {
        eventos: eventos.slice(inicio, fin),
        total: eventos.length,
        pagina: pagina,
        totalPaginas: Math.ceil(eventos.length / porPagina),
        porPagina: porPagina
      };
      
    } catch (error) {
      console.error('❌ Error buscando eventos:', error);
      throw error;
    }
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  // Verificar si el cache es válido
  _isCacheValid(key) {
    if (!this.cache.lastFetch[key]) return false;
    
    const elapsed = Date.now() - this.cache.lastFetch[key];
    return elapsed < CONSTANTS.CACHE.TTL_EVENTOS;
  }
  
  // Limpiar cache
  clearCache() {
    this.cache = {
      index: null,
      años: {},
      lastFetch: {}
    };
    console.log('🗑️ Cache de eventos limpiado');
  }
  
  // Obtener estadísticas
  async getEstadisticas() {
    try {
      const index = await this.getIndex();
      return index.estadisticas;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }
}

// Instancia única (Singleton)
const eventosAPI = new EventosAPI();

// Exportar globalmente
window.EventosAPI = eventosAPI;

console.log('✅ eventos.api.js cargado correctamente');
