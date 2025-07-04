// Leer eventos desde Firestore y pintarlos
db.collection("eventos").get().then((querySnapshot) => {
  const container = document.getElementById('events-container');
  container.innerHTML = ''; // limpiar
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <h3>${data.titulo || 'Sin título'}</h3>
      <p>${data.descripcion || ''}</p>
      <p><strong>Fecha:</strong> ${data.fecha_inicio || ''} - ${data.fecha_fin || ''}</p>
      <p><strong>Lugar:</strong> ${data.lugar || ''}</p>
    `;
    container.appendChild(card);
  });
}).catch((error) => {
  console.error("Error al cargar eventos:", error);
});
---------------
  // events.js - Gestión de eventos
// Hospitalidad en Acción - © Néstor Manrique

class EventsManager {
    static events = [];
    static currentFilter = 'all';

    // Cargar eventos desde Firebase
    static async loadEvents() {
        try {
            Utils.showLoader(true);
            
            if (typeof db !== 'undefined') {
                const eventsRef = db.collection('eventos');
                const snapshot = await eventsRef.orderBy('fecha_inicio', 'asc').get();
                
                this.events = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Datos de ejemplo para desarrollo
                this.events = this.getSampleEvents();
            }
            
            this.renderEvents();
            Utils.showLoader(false);
            
        } catch (error) {
            console.error('Error cargando eventos:', error);
            Utils.showNotification('Error al cargar eventos', 'error');
            Utils.showLoader(false);
            
            // Usar datos de ejemplo en caso de error
            this.events = this.getSampleEvents();
            this.renderEvents();
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
        const eventsContainer = document.getElementById('events-container') || document.querySelector('.events-grid');
        if (!eventsContainer) return;

        const eventsToRender = filteredEvents || this.events;
        
        if (eventsToRender.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No hay eventos disponibles</h3>
                    <p>Próximamente tendremos más eventos para ti</p>
                </div>
            `;
            return;
        }

        eventsContainer.innerHTML = eventsToRender.map(event => this.createEventCard(event)).join('');
        
        // Reinicializar animaciones
        AnimationManager.initCardHoverEffects();
    }

    // Crear tarjeta de evento
    static createEventCard(event) {
        const fechaFormateada = Utils.formatDateRange(event.fecha_inicio, event.fecha_fin);
        const estadoClass = event.estado === 'activo' ? 'active' : 'inactive';
        const cuposDisponibles = event.cupos - event.inscritos;
        
        return `
            <div class="event-card ${estadoClass}" data-event-id="${event.id}">
                <div class="event-image">
                    <img src="${event.imagenURL || 'img/evento-default.jpg'}" alt="${event.titulo}" 
                         onerror="this.src='img/evento-default.jpg'">
                    <div class="event-category">${this.getCategoryName(event.categoria)}</div>
                </div>
                
                <div class="event-content">
                    <div class="event-date">
                        <i class="fas fa-calendar-alt"></i>
                        ${fechaFormateada}
                    </div>
                    
                    <h3 class="event-title">${event.titulo}</h3>
                    
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.lugar}
                    </div>
                    
                    <p class="event-description">${event.descripcion}</p>
                    
                    <div class="event-stats">
                        <div class="stat">
                            <i class="fas fa-users"></i>
                            <span>${event.inscritos}/${event.cupos}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-${event.costo === 'Gratuito' ? 'gift' : 'tag'}"></i>
                            <span>${event.costo}</span>
                        </div>
                    </div>
                    
                    <div class="event-actions">
                        <button class="btn btn-primary" onclick="EventsManager.goToEventDetail('${event.id}')">
                            <i class="fas fa-info-circle"></i> Ver Detalles
                        </button>
                        
                        <button class="btn btn-secondary" onclick="EventsManager.showHotels('${event.ciudad}')">
                            <i class="fas fa-hotel"></i> Hoteles
                        </button>
                        
                        <button class="btn btn-outline" onclick="EventsManager.showHospitalityForm('${event.id}', '${event.titulo}')">
                            <i class="fas fa-home"></i> Hospitalidad
                        </button>
                    </div>
                    
                    ${cuposDisponibles <= 10 ? `
                        <div class="event-alert">
                            <i class="fas fa-exclamation-triangle"></i>
                            ¡Últimos ${cuposDisponibles} cupos disponibles!
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Obtener nombre de categoría
    static getCategoryName(category) {
        const categories = {
            'convencion': 'Convención',
            'retiro': 'Retiro',
            'evangelismo': 'Evangelismo',
            'conferencia': 'Conferencia',
            'taller': 'Taller',
            'familiar': 'Familiar'
        };
        return categories[category] || 'Evento';
    }

    // Filtrar eventos
    static filterEvents(filter) {
        this.currentFilter = filter;
        
        let filteredEvents = this.events;
        
        if (filter !== 'all') {
            filteredEvents = this.events.filter(event => {
                switch (filter) {
                    case 'upcoming':
                        return new Date(event.fecha_inicio) > new Date();
                    case 'past':
                        return new Date(event.fecha_fin) < new Date();
                    case 'active':
                        return event.estado === 'activo';
                    case 'free':
                        return event.costo === 'Gratuito';
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
            btn.classList.toggle('active', btn.dataset.filter === activeFilter);
        });
    }

    // Buscar eventos
    static searchEvents(query) {
        if (!query.trim()) {
            this.renderEvents();
            return;
        }
        
        const searchTerm = query.toLowerCase();
        const filteredEvents = this.events.filter(event => 
            event.titulo.toLowerCase().includes(searchTerm) ||
            event.descripcion.toLowerCase().includes(searchTerm) ||
            event.lugar.toLowerCase().includes(searchTerm) ||
            event.organizador.toLowerCase().includes(searchTerm)
        );
        
        this.renderEvents(filteredEvents);
    }

    // Ir a detalle de evento
    static goToEventDetail(eventId) {
        window.location.href = `event-detail.html?id=${eventId}`;
    }

    // Mostrar hoteles
    static showHotels(city) {
        const hotelsData = {
            arequipa: [
                { name: "Hotel San Agustín", price: "S/. 120-150 por noche", contact: "Tel: 054-213456", whatsapp: "954123456" },
                { name: "Hostal Jerusalem", price: "S/. 80-100 por noche", contact: "Tel: 054-234567", whatsapp: "954234567" },
                { name: "Hotel Casa Andina", price: "S/. 180-220 por noche", contact: "Tel: 054-345678", whatsapp: "954345678" },
                { name: "Hostal La Merced", price: "S/. 60-80 por noche", contact: "Tel: 054-456789", whatsapp: "954456789" }
            ],
            huancayo: [
                { name: "Hotel Presidente", price: "S/. 100-130 por noche
