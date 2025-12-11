class CocherasService {
  static async getCocheras() {
    try {
      const response = await fetch(AppConfig.getDataUrl('cocheras.json'));
      if (!response.ok) throw new Error('Error cargando cocheras');
      const data = await response.json();
      return data.cocheras;
    } catch (error) {
      console.error('❌ Error:', error);
      return [];
    }
  }
  
  static async getCocherasByEvento(eventoId) {
    const cocheras = await this.getCocheras();
    return cocheras
      .filter(c => c.eventoId === eventoId)
      .slice(0, 3); // Máximo 3 cocheras
  }
  
  static getImageUrl(relativePath) {
    return AppConfig.getImageUrl(relativePath);
  }
  
  static getWhatsAppLink(numero, mensaje = '') {
    const numeroLimpio = numero.replace(/\D/g, '');
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  }
}
