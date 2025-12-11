class EventosService {
  static async getEventos() {
    try {
      const response = await fetch(AppConfig.getDataUrl('eventos.json'));
      if (!response.ok) throw new Error('Error cargando eventos');
      const data = await response.json();
      return data.eventos;
    } catch (error) {
      console.error('❌ Error:', error);
      return [];
    }
  }
  
  static async getEventoById(id) {
    const eventos = await this.getEventos();
    return eventos.find(e => e.id === id);
  }
  
  static getImageUrl(relativePath) {
    return AppConfig.getImageUrl(relativePath);
  }
  
  static formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  }
  
  static formatearRangoFechas(inicio, fin) {
    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    if (fechaInicio.getMonth() === fechaFin.getMonth()) {
      return `${fechaInicio.getDate()}-${fechaFin.getDate()} ${meses[fechaInicio.getMonth()]}`;
    }
    return `${fechaInicio.getDate()} ${meses[fechaInicio.getMonth()]} - ${fechaFin.getDate()} ${meses[fechaFin.getMonth()]}`;
  }
  
  static diasRestantes(fechaInicio) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const diff = inicio - hoy;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  static getEstadoEvento(fechaInicio, fechaFin) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) return 'proximo';
    if (hoy >= inicio && hoy <= fin) return 'en-curso';
    return 'finalizado';
  }
}
