class CocherasService {
  static async getCocherasByEvento(eventoId) {
    const response = await fetch('/data/cocheras.json');
    const data = await response.json();
    return data.cocheras.filter(c => c.eventoId === eventoId)
      .slice(0, 3); // Máximo 3 cocheras
  }
  
  static getWhatsAppLink(numero, mensaje) {
    return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
  }
}
