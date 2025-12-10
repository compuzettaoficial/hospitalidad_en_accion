/* ============================================
   EVENTOS.SERVICE.JS
   Servicio para manejar eventos desde GitHub (JSON)
   ============================================ */

class EventosService {
  
  /**
   * Obtener todos los eventos
   * @returns {Promise<Array>} Lista de eventos
   */
  static async getEventos() {
    try {
      const response = await fetch('/data/eventos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.eventos || [];
      
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      
      // Devolver datos de ejemplo si falla (útil para desarrollo)
      return this.getEventosEjemplo();
    }
  }
  
  /**
   * Obtener un evento por ID
   * @param {string} id - ID del evento
   * @returns {Promise<Object|null>} Evento encontrado o null
   */
  static async getEventoById(id) {
    try {
      const eventos = await this.getEventos();
      const evento = eventos.find(e => e.id === id);
      
      if (!evento) {
        console.warn(`Evento con ID "${id}" no encontrado`);
        return null;
      }
      
      return evento;
      
    } catch (error) {
      console.error('Error al obtener evento por ID:', error);
      return null;
    }
  }
  
  /**
   * Obtener eventos activos (estado = 'activo')
   * @returns {Promise<Array>} Lista de eventos activos
   */
  static async getEventosActivos() {
    try {
      const eventos = await this.getEventos();
      return eventos.filter(e => e.estado === 'activo');
      
    } catch (error) {
      console.error('Error al obtener eventos activos:', error);
      return [];
    }
  }
  
  /**
   * Obtener eventos por ciudad
   * @param {string} ciudad - Nombre de la ciudad
   * @returns {Promise<Array>} Lista de eventos en esa ciudad
   */
  static async getEventosPorCiudad(ciudad) {
    try {
      const eventos = await this.getEventos();
      return eventos.filter(e => 
        e.ciudad.toLowerCase() === ciudad.toLowerCase()
      );
      
    } catch (error) {
      console.error('Error al obtener eventos por ciudad:', error);
      return [];
    }
  }
  
  /**
   * Obtener eventos por departamento
   * @param {string} departamento - Nombre del departamento
   * @returns {Promise<Array>} Lista de eventos en ese departamento
   */
  static async getEventosPorDepartamento(departamento) {
    try {
      const eventos = await this.getEventos();
      return eventos.filter(e => 
        e.departamento.toLowerCase() === departamento.toLowerCase()
      );
      
    } catch (error) {
      console.error('Error al obtener eventos por departamento:', error);
      return [];
    }
  }
  
  /**
   * Obtener eventos próximos (ordenados por fecha)
   * @param {number} limite - Número máximo de eventos a retornar
   * @returns {Promise<Array>} Lista de eventos próximos
   */
  static async getEventosProximos(limite = 10) {
    try {
      const eventos = await this.getEventosActivos();
      const hoy = new Date();
      
      // Filtrar eventos futuros o en curso
      const eventosFuturos = eventos.filter(e => {
        const fechaFin = new Date(e.fechaFin);
        return fechaFin >= hoy;
      });
      
      // Ordenar por fecha de inicio
      eventosFuturos.sort((a, b) => {
        return new Date(a.fechaInicio) - new Date(b.fechaInicio);
      });
      
      // Limitar cantidad de resultados
      return eventosFuturos.slice(0, limite);
      
    } catch (error) {
      console.error('Error al obtener eventos próximos:', error);
      return [];
    }
  }
  
  /**
   * Buscar eventos por término
   * @param {string} termino - Término de búsqueda
   * @returns {Promise<Array>} Lista de eventos que coinciden
   */
  static async buscarEventos(termino) {
    try {
      const eventos = await this.getEventos();
      const terminoLower = termino.toLowerCase();
      
      return eventos.filter(e => 
        e.titulo.toLowerCase().includes(terminoLower) ||
        e.ciudad.toLowerCase().includes(terminoLower) ||
        e.departamento.toLowerCase().includes(terminoLower) ||
        e.lugar.toLowerCase().includes(terminoLower)
      );
      
    } catch (error) {
      console.error('Error al buscar eventos:', error);
      return [];
    }
  }
  
  /**
   * Verificar si un evento está activo
   * @param {string} id - ID del evento
   * @returns {Promise<boolean>} true si está activo
   */
  static async isEventoActivo(id) {
    try {
      const evento = await this.getEventoById(id);
      return evento && evento.estado === 'activo';
      
    } catch (error) {
      console.error('Error al verificar estado del evento:', error);
      return false;
    }
  }
  
  /**
   * Obtener departamentos únicos (para filtros)
   * @returns {Promise<Array>} Lista de departamentos
   */
  static async getDepartamentos() {
    try {
      const eventos = await this.getEventos();
      const departamentos = [...new Set(eventos.map(e => e.departamento))];
      return departamentos.sort();
      
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      return [];
    }
  }
  
  /**
   * Obtener datos de ejemplo (fallback)
   * @returns {Array} Eventos de ejemplo
   */
  static getEventosEjemplo() {
    return [
      {
        id: 'chimbote-2025',
        titulo: 'Convención Nacional AMIP Perú 2025',
        fechaInicio: '2025-02-20',
        fechaFin: '2025-02-23',
        ciudad: 'Nuevo Chimbote',
        departamento: 'Áncash',
        lugar: 'Auditorio Instituto Carlos Salazar Romero',
        maps: 'https://maps.app.goo.gl/ejemplo',
        
        imagenes: {
          principal: 'assets/images/eventos/chimbote-2025/auditorio.jpg',
          galeria: [
            'assets/images/eventos/chimbote-2025/galeria/dia1-01.jpg',
            'assets/images/eventos/chimbote-2025/galeria/dia2-01.jpg',
            'assets/images/eventos/chimbote-2025/galeria/dia3-01.jpg'
          ]
        },
        
        expositores: [
          {
            nombre: 'Pastor Juan Pérez',
            pais: 'Colombia',
            tema: 'Liderazgo Cristiano',
            foto: 'assets/images/expositores/pastor-juan.jpg'
          },
          {
            nombre: 'Pastora María González',
            pais: 'México',
            tema: 'Familia y Matrimonio',
            foto: 'assets/images/expositores/pastora-maria.jpg'
          }
        ],
        
        organizador: {
          nombre: 'AMIP Perú',
          contacto: '+51 999 888 777',
          email: 'contacto@amipperu.org'
        },
        
        estado: 'activo'
      }
    ];
  }
  
  /**
   * Formatear fecha para mostrar (DD/MM/YYYY)
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  static formatearFecha(fecha) {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  }
  
  /**
   * Formatear rango de fechas
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {string} Rango formateado
   */
  static formatearRangoFechas(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const diaInicio = inicio.getDate();
    const diaFin = fin.getDate();
    const mesInicio = meses[inicio.getMonth()];
    const mesFin = meses[fin.getMonth()];
    const año = inicio.getFullYear();
    
    if (mesInicio === mesFin) {
      return `${diaInicio} - ${diaFin} de ${mesInicio} ${año}`;
    } else {
      return `${diaInicio} de ${mesInicio} - ${diaFin} de ${mesFin} ${año}`;
    }
  }
  
  /**
   * Calcular días restantes hasta el evento
   * @param {string} fechaInicio - Fecha de inicio del evento
   * @returns {number} Días restantes (negativo si ya pasó)
   */
  static diasRestantes(fechaInicio) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const diferencia = inicio - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Verificar si el evento está en curso
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {boolean} true si está en curso
   */
  static estaEnCurso(fechaInicio, fechaFin) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return hoy >= inicio && hoy <= fin;
  }
  
  /**
   * Obtener estado del evento (próximo, en curso, finalizado)
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {string} Estado del evento
   */
  static getEstadoEvento(fechaInicio, fechaFin) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) {
      return 'proximo';
    } else if (hoy >= inicio && hoy <= fin) {
      return 'en-curso';
    } else {
      return 'finalizado';
    }
  }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventosService;
}