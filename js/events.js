// js/events.js
// Gestión de eventos - Hospitalidad en Acción - © Néstor Manrique

class EventsManager {
    static events = [];
    static currentFilter = 'all';
    static isLoading = false;

    static async init() {
        try {
            await this.loadEvents();
            this.initListeners();
            this.createParticles();
        } catch (error) {
            console.error('Error al iniciar:', error);
            this.showError('Error al inicializar la aplicación');
        }
    }

    static async loadEvents() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.showLoader(true);

        try {
            if (typeof db !== 'undefined') {
                const snapshot = await db.collection('eventos')
                    .where('estado', '==', 'activo')
                    .orderBy('fecha_inicio', 'asc')
                    .get();
                this.events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(`Eventos cargados desde Firebase: ${this.events.length}`);
            } else {
                throw new Error('Firebase no está disponible');
            }
        } catch (error) {
            console.warn('Error al cargar eventos desde Firebase, usando datos locales:', error);
            this.events = await this.loadSampleEvents();
        } finally {
            this.renderEvents();
            this.isLoading = false;
            this.showLoader(false);
        }
    }

    static async loadSampleEvents() {
        const response = await fetch('eventos_ejemplos.json');
        if (!response.ok) throw new Error('Error cargando JSON');
        return await response.json();
    }

    static renderEvents(filtered = null) {
        const container = document.querySelector('#events-container') || document.querySelector('.events-grid');
        if (!container) return;

        const events = filtered || this.events;
        if (!events.length) {
            container.innerHTML = `<p class="text-center">No hay eventos disponibles.</p>`;
            return;
        }

        container.innerHTML = events.map(event => this.createEventCard(event)).join('');
        this.animateCards();
    }

    static createEventCard(event) {
        const fecha = this.formatDate(event.fecha_inicio);
        return `
        <div class="event-card animate-on-scroll" data-id="${event.id}">
            <div class="event-date">${fecha}</div>
            <h3 class="event-title">${event.titulo}</h3>
            <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.lugar}</div>
            <p class="event-description">${event.descripcion}</p>
            <div class="event-actions">
                <button class="btn btn-primary" onclick="EventsManager.goToEventDetail('${event.id}')">
                    <i class="fas fa-info-circle"></i> Más Info
                </button>
            </div>
        </div>`;
    }

    static goToEventDetail(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) localStorage.setItem('currentEvent', JSON.stringify(event));
        window.location.href = `event-detail.html?id=${eventId}`;
    }

    static formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    static animateCards() {
        document.querySelectorAll('.animate-on-scroll').forEach(card => {
            card.classList.add('animate');
        });
    }

    static showLoader(show = true) {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = show ? 'flex' : 'none';
    }

    static showError(msg) {
        alert(msg);
    }

    static initListeners() {
        // Búsqueda
        const input = document.getElementById('search-events');
        if (input) {
            input.addEventListener('input', e => {
                const q = e.target.value.toLowerCase();
                const filtered = this.events.filter(ev =>
                    ev.titulo.toLowerCase().includes(q) ||
                    ev.descripcion.toLowerCase().includes(q)
                );
                this.renderEvents(filtered);
            });
        }
    }

    static createParticles() {
        const container = document.querySelector('.particles');
        if (!container) return;
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            container.appendChild(p);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => EventsManager.init());
window.EventsManager = EventsManager;
