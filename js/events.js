class EventsManager {
  static events = [];
  static isLoading = false;

  static async init() {
    try {
      await this.loadEvents();
    } catch (error) {
      console.error('Error en init:', error);
    }
  }

  static async loadEvents() {
    this.isLoading = true;
    this.showLoader(true);
    try {
      if (typeof db !== 'undefined') {
        const snapshot = await db.collection('eventos')
          .where('estado', '==', 'activo')
          .orderBy('fecha_inicio', 'asc')
          .get();

        this.events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Eventos cargados desde Firebase:', this.events.length);
        this.renderEvents();
      } else {
        throw new Error('Firebase no inicializado correctamente.');
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      document.getElementById('events-container').innerHTML = `
        <p style="color:red;">Error cargando eventos: ${error.message}</p>`;
    } finally {
      this.showLoader(false);
      this.isLoading = false;
    }
  }

  static renderEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    if (this.events.length === 0) {
      container.innerHTML = '<p>No hay eventos disponibles.</p>';
      return;
    }

    container.innerHTML = this.events.map(e => `
      <div class="event-card">
        <h3>${e.titulo}</h3>
        <p>${e.descripcion}</p>
        <p>Inicio: ${e.fecha_inicio}</p>
      </div>`).join('');
  }

  static showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'block' : 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => EventsManager.init());
window.EventsManager = EventsManager;
