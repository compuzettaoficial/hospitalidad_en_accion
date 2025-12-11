class HotelesService {
  static async getHoteles() {
    try {
      const response = await fetch(AppConfig.getDataUrl('hoteles.json'));
      if (!response.ok) throw new Error('Error cargando hoteles');
      const data = await response.json();
      return data.hoteles;
    } catch (error) {
      console.error('❌ Error:', error);
      return [];
    }
  }
  
  static async getHotelesByEvento(eventoId) {
    const hoteles = await this.getHoteles();
    return hoteles.filter(h => h.eventoId === eventoId);
  }
  
  static getImageUrl(relativePath) {
    return AppConfig.getImageUrl(relativePath);
  }
  
  static getTelefonoPrincipal(hotel) {
    return hotel.contacto?.telefonos?.find(t => t.principal) || hotel.contacto?.telefonos?.[0];
  }
  
  static getTelefonoWhatsApp(hotel) {
    return hotel.contacto?.telefonos?.find(t => t.tipo === 'whatsapp');
  }
  
  static getWhatsAppLink(numero, mensaje = '') {
    const numeroLimpio = numero.replace(/\D/g, '');
    return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
  }
  
  static ordenarPorDistancia(hoteles) {
    return [...hoteles].sort((a, b) => 
      (a.distanciaEvento?.metros || 999999) - (b.distanciaEvento?.metros || 999999)
    );
  }
  
  static ordenarPorPrecio(hoteles) {
    return [...hoteles].sort((a, b) => {
      const precioA = a.tarifas?.simple?.precio || 999999;
      const precioB = b.tarifas?.simple?.precio || 999999;
      return precioA - precioB;
    });
  }
  
  static ordenarPorEstrellas(hoteles) {
    return [...hoteles].sort((a, b) => 
      (b.caracteristicas?.estrellas || 0) - (a.caracteristicas?.estrellas || 0)
    );
  }
  
  static filtrarPorEstrellas(hoteles, minEstrellas) {
    return hoteles.filter(h => (h.caracteristicas?.estrellas || 0) >= minEstrellas);
  }
}
