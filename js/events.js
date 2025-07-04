// events.js - Gestión de eventos
// Hospitalidad en Acción - © Néstor Manrique

class EventsManager {
    static events = [];
    static currentFilter = 'all';
    static isLoading = false;

    // Inicializar gestor de eventos
    static async init() {
        try {
            await this.loadEvents();
            this.initializeEventListeners();
            this.initializeFilters();
            this.createParticles();
        } catch (error) {
            console.error('Error inicializando EventsManager:', error);
            this.showErrorMessage('Error al inicializar la aplicación');
        }
    }

    // Cargar eventos desde Firebase
    static async loadEvents() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoader(true);
            
            // Verificar si Firebase está disponible
            if (typeof db !== 'undefined' && db) {
                const eventsRef = db.collection('eventos');
                const snapshot = await eventsRef
                    .where('estado', '==', 'activo')
                    .orderBy('fecha_inicio', 'asc')
                    .get();
                
                this.events = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log(`Cargados ${this.events.length} eventos desde Firebase`);
            } else {
                // Usar datos de ejemplo para desarrollo
                this.events = this.getSampleEvents();
                console.log('Usando datos de ejemplo - Firebase no disponible');
            }
            
            this.renderEvents();
            this.updateStats();
            
        } catch (error) {
            console.error('Error cargando eventos:', error);
            this.showNotification('Error al cargar eventos. Mostrando datos de ejemplo.', 'warning');
            
            // Usar datos de ejemplo en caso de error
            this.events = this.getSampleEvents();
            this.renderEvents();
        } finally {
            this.isLoading = false;
            this.showLoader(false);
        }
    }

    // Datos de ejemplo para desarrollo
    static getSampleEvents() {
        return [
            {
                id: 'evento1',
                titulo: 'Convención Nacional Arequipa',
                descripcion: 'Gran convención nacional con predicadores internacionales. Esperamos más de 3,000 asistentes de todo el país para tres días de bendición y comunión fraternal.',
                fecha_inicio: '2025-07-15',
                fecha_fin: '2025-07-17',
                lugar: 'Arequipa, Cercado - Coliseo Dibós',
                ciudad: 'arequipa',
                imagenURL: 'img/evento-arequipa.jpg',
                gps: { lat: -16.409047, lng: -71.537451 },
                horarios: [
                    { dia: 'Martes 15', actividad: 'Inauguración', hora: '19:00' },
                    { dia: 'Miércoles 16', actividad: 'Conferencias', hora: '09:00 - 21:00' },
                    { dia: 'Jueves 17', actividad: 'Clausura', hora: '09:00 - 12:00' }
                ],
                categoria: 'convencion',
                estado: 'activo',
                organizador: 'Iglesia Central Arequipa',
                contacto: {
                    telefono: '+51 954 123 456',
                    email: 'eventos@iglesiaarequipa.pe',
                    whatsapp: '+51 954 123 456'
                },
                cupos: 3000,
                inscritos: 1250,
                costo: 'Gratuito',
                incluye: ['Alimentación', 'Materiales', 'Certificado'],
                requisitos: ['Ser mayor de edad', 'Registrarse con anticipación']
            },
            {
                id: 'evento2',
                titulo: 'Retiro Juvenil Huancayo',
                descripcion: 'Retiro especial para jóvenes con talleres, conferencias y actividades recreativas en un ambiente de comunión y crecimiento espiritual.',
                fecha_inicio: '2025-07-22',
                fecha_fin: '2025-07-24',
                lugar: 'Huancayo, El Tambo - Centro de Convenciones',
                ciudad: 'huancayo',
                imagenURL: 'img/evento-huancayo.jpg',
                gps: { lat: -12.069099, lng: -75.204963 },
                horarios: [
                    { dia: 'Martes 22', actividad: 'Llegada y Bienvenida', hora: '15:00' },
                    { dia: 'Miércoles 23', actividad: 'Talleres y Dinámicas', hora: '08:00 - 22:00' },
                    { dia: 'Jueves 24', actividad: 'Ceremonia de Clausura', hora: '08:00 - 14:00' }
                ],
                categoria: 'retiro',
                estado: 'activo',
                organizador: 'Ministerio Juvenil Huancayo',
                contacto: {
                    telefono: '+51 964 789 123',
                    email: 'jovenes@iglesiahuancayo.pe',
                    whatsapp: '+51 964 789 123'
                },
                cupos: 150,
                inscritos: 89,
                costo: 'S/. 50',
                incluye: ['Hospedaje', 'Alimentación', 'Materiales', 'Transporte local'],
                requisitos: ['14-30 años', 'Autorización de padres (menores)']
            },
            {
                id: 'evento3',
                titulo: 'Campaña Evangelística Trujillo',
                descripcion: 'Campaña masiva de evangelización con actividades para toda la familia y predicación del evangelio en el corazón de la ciudad.',
                fecha_inicio: '2025-08-05',
                fecha_fin: '2025-08-07',
                lugar: 'Trujillo, Centro - Plaza de Armas',
                ciudad: 'trujillo',
                imagenURL: 'img/evento-trujillo.jpg',
                gps: { lat: -8.110883, lng: -79.029414 },
                horarios: [
                    { dia: 'Martes 5', actividad: 'Apertura Evangelística', hora: '18:00' },
                    { dia: 'Miércoles 6', actividad: 'Jornada Familiar', hora: '16:00 - 21:00' },
                    { dia: 'Jueves 7', actividad: 'Gran Cierre', hora: '17:00 - 21:00' }
                ],
                categoria: 'evangelismo',
                estado: 'activo',
                organizador: 'Iglesias Unidas Trujillo',
                contacto: {
                    telefono: '+51 944 567 890',
                    email: 'campana@iglesiastrujillo.pe',
                    whatsapp: '+51 944 567 890'
                },
                cupos: 5000,
                inscritos: 2100,
                costo: 'Gratuito',
                incluye: ['Materiales evangelísticos', 'Refrigerio'],
                requisitos: ['Participación voluntaria']
            }
        ];
    }

    // Renderizar eventos en la página
    static renderEvents(filteredEvents = null) {
        const eventsContainer = document.getElementById('events-container') || 
                               document.querySelector('.events-grid') || 
                               document.querySelector('#eventos .events-grid');
        
        if (!eventsContainer) {
            console.warn('No se encontró el contenedor de eventos');
            return;
        }

        const eventsToRender = filteredEvents || this.events;
        
        if (eventsToRender.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events" style="
                    grid-column: 1/-1; 
                    text-align: center; 
                    padding: 3rem 2rem;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                ">
                    <i class="fas fa-calendar-times" style="font-size: 4rem; color: #a78bfa; margin-bottom: 1rem;"></i>
                    <h3 style="color: #374151; margin-bottom: 0.5rem;">No hay eventos disponibles</h3>
                    <p style="color: #6b7280;">Próximamente tendremos más eventos para ti</p>
                </div>
            `;
            return;
        }

        eventsContainer.innerHTML = eventsToRender.map(event => this.createEventCard(event)).join('');
        
        // Aplicar animaciones
        this.animateCards();
    }

    // Crear tarjeta de evento con el estilo de la plantilla
    static createEventCard(event) {
        const fechaFormateada = this.formatDateRange(event.fecha_inicio, event.fecha_fin);
        const cuposDisponibles = event.cupos - event.inscritos;
        const porcentajeOcupacion = (event.inscritos / event.cupos) * 100;
        
        return `
            <div class="event-card animate-on-scroll" data-event-id="${event.id}">
                <div class="event-date">${fechaFormateada}</div>
                <h3 class="event-title">${event.titulo}</h3>
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${event.lugar}
                </div>
                <p class="event-description">${event.descripcion}</p>
                
                <div class="event-stats" style="
                    display: flex; 
                    justify-content: space-between; 
                    margin: 1rem 0;
                    padding: 0.5rem;
                    background: rgba(167, 139, 250, 0.1);
                    border-radius: 10px;
                    font-size: 0.9rem;
                ">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-users" style="color: #7c3aed;"></i>
                        <span><strong>${event.inscritos}</strong>/${event.cupos}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-${event.costo === 'Gratuito' ? 'gift' : 'tag'}" style="color: #7c3aed;"></i>
                        <span><strong>${event.costo}</strong></span>
                    </div>
                </div>

                ${cuposDisponibles <= 50 && cuposDisponibles > 0 ? `
                    <div class="event-alert" style="
                        background: linear-gradient(45deg, #fbbf24, #f59e0b);
                        color: white;
                        padding: 0.5rem;
                        border-radius: 8px;
                        margin: 1rem 0;
                        text-align: center;
                        font-size: 0.9rem;
                        font-weight: bold;
                    ">
                        <i class="fas fa-exclamation-triangle"></i>
                        ¡Últimos ${cuposDisponibles} cupos disponibles!
                    </div>
                ` : ''}

                ${cuposDisponibles <= 0 ? `
                    <div class="event-alert" style="
                        background: linear-gradient(45deg, #ef4444, #dc2626);
                        color: white;
                        padding: 0.5rem;
                        border-radius: 8px;
                        margin: 1rem 0;
                        text-align: center;
                        font-size: 0.9rem;
                        font-weight: bold;
                    ">
                        <i class="fas fa-users-slash"></i>
                        Evento completo
                    </div>
                ` : ''}
                
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="EventsManager.goToEventDetail('${event.id}')">
                        <i class="fas fa-info-circle"></i> Más Info
                    </button>
                    <button class="btn btn-secondary" onclick="EventsManager.showHotels('${event.ciudad}')">
                        <i class="fas fa-hotel"></i> Ver Hoteles
                    </button>
                    <button class="btn btn-outline" onclick="EventsManager.showHospitalityForm('${event.titulo}')">
                        <i class="fas fa-home"></i> Hospitalidad
                    </button>
                </div>
            </div>
        `;
    }

    // Formatear rango de fechas
    static formatDateRange(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        const opciones = { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        };
        
        if (fechaInicio === fechaFin) {
            return inicio.toLocaleDateString('es-PE', opciones);
        }
        
        // Si es el mismo mes
        if (inicio.getMonth() === fin.getMonth() && inicio.getFullYear() === fin.getFullYear()) {
            return `${inicio.getDate()}-${fin.getDate()} ${inicio.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}`;
        }
        
        return `${inicio.toLocaleDateString('es-PE', opciones)} - ${fin.toLocaleDateString('es-PE', opciones)}`;
    }

    // Inicializar event listeners
    static initializeEventListeners() {
        // Búsqueda de eventos
        const searchInput = document.getElementById('search-events');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchEvents(e.target.value);
                }, 300);
            });
        }

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = btn.dataset.filter;
                this.filterEvents(filter);
            });
        });

        // Botón de recarga
        const reloadBtn = document.getElementById('reload-events');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                this.loadEvents();
            });
        }
    }

    // Inicializar filtros
    static initializeFilters() {
        // Crear barra de filtros si no existe
        const eventsSection = document.getElementById('eventos');
        if (eventsSection && !document.querySelector('.events-filters')) {
            const filtersHTML = `
                <div class="events-filters" style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    justify-content: center;
                    margin-bottom: 2rem;
                    padding: 1rem;
                ">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="upcoming">Próximos</button>
                    <button class="filter-btn" data-filter="convencion">Convenciones</button>
                    <button class="filter-btn" data-filter="retiro">Retiros</button>
                    <button class="filter-btn" data-filter="evangelismo">Evangelismo</button>
                    <button class="filter-btn" data-filter="free">Gratuitos</button>
                </div>
            `;
            
            const eventsGrid = eventsSection.querySelector('.events-grid');
            if (eventsGrid) {
                eventsGrid.insertAdjacentHTML('beforebegin', filtersHTML);
                this.initializeEventListeners();
            }
        }
    }

    // Filtrar eventos
    static filterEvents(filter) {
        this.currentFilter = filter;
        
        let filteredEvents = this.events;
        
        if (filter !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filteredEvents = this.events.filter(event => {
                const eventDate = new Date(event.fecha_inicio);
                
                switch (filter) {
                    case 'upcoming':
                        return eventDate >= today;
                    case 'past':
                        return eventDate < today;
                    case 'free':
                        return event.costo === 'Gratuito';
                    case 'available':
                        return event.inscritos < event.cupos;
                    default:
                        return event.categoria === filter;
                }
            });
        }
        
        this.renderEvents(filteredEvents);
        this.updateFilterUI(filter);
    }

    // Actualizar UI de filtros
    static updateFilterUI(activeFilter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === activeFilter) {
                btn.classList.add('active');
            }
        });
    }

    // Buscar eventos
    static searchEvents(query) {
        if (!query.trim()) {
            this.renderEvents();
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const filteredEvents = this.events.filter(event => 
            event.titulo.toLowerCase().includes(searchTerm) ||
            event.descripcion.toLowerCase().includes(searchTerm) ||
            event.lugar.toLowerCase().includes(searchTerm) ||
            event.organizador.toLowerCase().includes(searchTerm) ||
            event.categoria.toLowerCase().includes(searchTerm)
        );
        
        this.renderEvents(filteredEvents);
    }

    // Ir a detalle de evento
    static goToEventDetail(eventId) {
        // Guardar evento actual en localStorage para la página de detalle
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            localStorage.setItem('currentEvent', JSON.stringify(event));
        }
        
        window.location.href = `event-detail.html?id=${eventId}`;
    }

    // Mostrar hoteles (usando la funcionalidad existente de la plantilla)
    static showHotels(city) {
        if (typeof showHotels === 'function') {
            showHotels(city);
        } else {
            console.warn('Función showHotels no encontrada');
        }
    }

    // Mostrar formulario de hospitalidad
    static showHospitalityForm(eventTitle) {
        if (typeof showHospitalityForm === 'function') {
            showHospitalityForm(eventTitle);
        } else {
            console.warn('Función showHospitalityForm no encontrada');
        }
    }

    // Animaciones de tarjetas
    static animateCards() {
        const cards = document.querySelectorAll('.event-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // Crear partículas
    static createParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 7) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    // Actualizar estadísticas
    static updateStats() {
        const totalEvents = this.events.length;
        const totalAttendees = this.events.reduce((sum, event) => sum + event.inscritos, 0);
        const availableSpots = this.events.reduce((sum, event) => sum + (event.cupos - event.inscritos), 0);

        // Mostrar estadísticas en consola para debug
        console.log('Estadísticas de eventos:', {
            totalEvents,
            totalAttendees,
            availableSpots
        });
    }

    // Mostrar loader
    static showLoader(show = true) {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    // Mostrar notificación
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(45deg, #f59e0b, #d97706)';
                break;
            default:
                notification.style.background = 'linear-gradient(45deg, #6366f1, #4f46e5)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Mostrar mensaje de error
    static showErrorMessage(message) {
        const eventsContainer = document.getElementById('events-container') || 
                               document.querySelector('.events-grid');
        
        if (eventsContainer) {
            eventsContainer.innerHTML = `
                <div class="error-message" style="
                    grid-column: 1/-1;
                    text-align: center;
                    padding: 3rem 2rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid rgba(239, 68, 68, 0.2);
                    border-radius: 20px;
                    color: #dc2626;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h3>${message}</h3>
                    <p>Por favor, recarga la página o contacta al administrador</p>
                    <button onclick="EventsManager.loadEvents()" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-reload"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }

    // Obtener evento por ID
    static getEventById(id) {
        return this.events.find(event => event.id === id);
    }

    // Obtener eventos por ciudad
    static getEventsByCity(city) {
        return this.events.filter(event => event.ciudad === city);
    }

    // Obtener eventos por categoría
    static getEventsByCategory(category) {
        return this.events.filter(event => event.categoria === category);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    EventsManager.init();
});

// Exponer funciones globales para compatibilidad
window.EventsManager = EventsManager;
