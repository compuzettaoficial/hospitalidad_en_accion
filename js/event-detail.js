// Firebase imports
import { auth, db } from './firebase-config.js';
import { doc, getDoc, collection, getDocs, query, where, onAuthStateChanged } from 'firebase/firestore';

// Global variables
let currentEventId = null;
let currentUser = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('id');
    
    if (!currentEventId) {
        showError('No se encontró el ID del evento');
        return;
    }
    
    // Initialize authentication state listener
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        loadEventDetails();
        updateUIForAuthState();
    });
    
    // Initialize event listeners
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Hotels button
    const hotelsBtn = document.getElementById('hotelsBtn');
    if (hotelsBtn) {
        hotelsBtn.addEventListener('click', toggleHotelsSection);
    }
    
    // Add parking button
    const parkingBtn = document.getElementById('parkingBtn');
    if (parkingBtn) {
        parkingBtn.addEventListener('click', toggleParkingSection);
    }
    
    // Registration form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    // Hospitality form
    const hospitalityForm = document.getElementById('hospitalityForm');
    if (hospitalityForm) {
        hospitalityForm.addEventListener('submit', handleHospitality);
    }
}

// Load event details
async function loadEventDetails() {
    try {
        showLoading(true);
        
        // Get event document
        const eventDoc = await getDoc(doc(db, 'eventos', currentEventId));
        
        if (!eventDoc.exists()) {
            showError('El evento no existe');
            return;
        }
        
        const eventData = eventDoc.data();
        displayEventDetails(eventData);
        
        // Load hotels and parking if user is logged in
        if (currentUser) {
            await loadHotelsAndParking();
        }
        
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading event details:', error);
        showError('Error al cargar los detalles del evento');
        showLoading(false);
    }
}

// Display event details
function displayEventDetails(eventData) {
    // Update page title
    document.title = `${eventData.titulo} - Hospitalidad en Acción`;
    
    // Update event details
    document.getElementById('eventTitle').textContent = eventData.titulo;
    document.getElementById('eventDescription').innerHTML = eventData.descripcion || '';
    document.getElementById('eventLocation').textContent = eventData.lugar || '';
    
    // Update dates
    const startDate = eventData.fecha_inicio?.toDate();
    const endDate = eventData.fecha_fin?.toDate();
    
    if (startDate) {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const startDateStr = startDate.toLocaleDateString('es-ES', dateOptions);
        const endDateStr = endDate ? endDate.toLocaleDateString('es-ES', dateOptions) : startDateStr;
        
        document.getElementById('eventDates').textContent = 
            startDate.toDateString() === endDate?.toDateString() 
                ? startDateStr 
                : `${startDateStr} - ${endDateStr}`;
                
        document.getElementById('eventDateBadge').textContent = startDate.getDate();
    }
    
    // Update time
    if (eventData.horarios) {
        document.getElementById('eventTime').textContent = eventData.horarios;
    }
    
    // Update image
    const eventImage = document.getElementById('eventImage');
    if (eventData.imagenURL) {
        eventImage.src = eventData.imagenURL;
        eventImage.alt = eventData.titulo;
    } else {
        eventImage.src = 'img/default-event.jpg';
        eventImage.alt = 'Imagen del evento';
    }
    
    // Show content
    document.getElementById('eventDetailContent').style.display = 'block';
}

// Load hotels and parking for logged in users
async function loadHotelsAndParking() {
    try {
        await Promise.all([
            loadHotels(),
            loadParking()
        ]);
    } catch (error) {
        console.error('Error loading hotels and parking:', error);
    }
}

// Load hotels
async function loadHotels() {
    try {
        const hotelsQuery = query(
            collection(db, 'hoteles'),
            where('eventoID', '==', currentEventId)
        );
        
        const hotelsSnapshot = await getDocs(hotelsQuery);
        const hotels = [];
        
        hotelsSnapshot.forEach((doc) => {
            hotels.push({ id: doc.id, ...doc.data() });
        });
        
        displayHotels(hotels);
        
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

// Load parking
async function loadParking() {
    try {
        const parkingQuery = query(
            collection(db, 'cocheras'),
            where('eventoID', '==', currentEventId)
        );
        
        const parkingSnapshot = await getDocs(parkingQuery);
        const parking = [];
        
        parkingSnapshot.forEach((doc) => {
            parking.push({ id: doc.id, ...doc.data() });
        });
        
        displayParking(parking);
        
    } catch (error) {
        console.error('Error loading parking:', error);
    }
}

// Display hotels
function displayHotels(hotels) {
    const hotelsGrid = document.getElementById('hotelsGrid');
    
    if (hotels.length === 0) {
        hotelsGrid.innerHTML = '<p class="no-results">No hay hoteles registrados para este evento.</p>';
        return;
    }
    
    hotelsGrid.innerHTML = hotels.map(hotel => `
        <div class="hotel-card">
            <div class="hotel-info">
                <h3>${hotel.nombre}</h3>
                <p class="hotel-address">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.direccion}
                </p>
                ${hotel.telefono ? `
                    <p class="hotel-phone">
                        <i class="fas fa-phone"></i> ${hotel.telefono}
                    </p>
                ` : ''}
                ${hotel.precio ? `
                    <p class="hotel-price">
                        <i class="fas fa-dollar-sign"></i> Desde S/. ${hotel.precio}
                    </p>
                ` : ''}
                ${hotel.descripcion ? `
                    <p class="hotel-description">${hotel.descripcion}</p>
                ` : ''}
            </div>
            <div class="hotel-actions">
                ${hotel.whatsapp ? `
                    <a href="https://wa.me/${hotel.whatsapp}" target="_blank" class="btn btn-outline btn-sm">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                ` : ''}
                ${hotel.gps ? `
                    <a href="https://maps.google.com/?q=${hotel.gps}" target="_blank" class="btn btn-outline btn-sm">
                        <i class="fas fa-map"></i> Ver en Mapa
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Display parking
function displayParking(parking) {
    const parkingGrid = document.getElementById('parkingGrid');
    
    if (parking.length === 0) {
        parkingGrid.innerHTML = '<p class="no-results">No hay cocheras registradas para este evento.</p>';
        return;
    }
    
    parkingGrid.innerHTML = parking.map(cochera => `
        <div class="parking-card">
            <div class="parking-info">
                <h3>${cochera.nombre}</h3>
                <p class="parking-address">
                    <i class="fas fa-map-marker-alt"></i> ${cochera.direccion}
                </p>
                ${cochera.capacidad ? `
                    <p class="parking-capacity">
                        <i class="fas fa-car"></i> Capacidad: ${cochera.capacidad} vehículos
                    </p>
                ` : ''}
                ${cochera.precio ? `
                    <p class="parking-price">
                        <i class="fas fa-dollar-sign"></i> S/. ${cochera.precio}
                    </p>
                ` : ''}
                ${cochera.descripcion ? `
                    <p class="parking-description">${cochera.descripcion}</p>
                ` : ''}
            </div>
            <div class="parking-actions">
                ${cochera.whatsapp ? `
                    <a href="https://wa.me/${cochera.whatsapp}" target="_blank" class="btn btn-outline btn-sm">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                ` : ''}
                ${cochera.gps ? `
                    <a href="https://maps.google.com/?q=${cochera.gps}" target="_blank" class="btn btn-outline btn-sm">
                        <i class="fas fa-map"></i> Ver en Mapa
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Toggle hotels section
function toggleHotelsSection() {
    const hotelsSection = document.getElementById('hotelsSection');
    const btn = document.getElementById('hotelsBtn');
    
    if (hotelsSection.style.display === 'none' || hotelsSection.style.display === '') {
        hotelsSection.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-hotel"></i> Ocultar Hoteles';
        hotelsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        hotelsSection.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-hotel"></i> Ver Hoteles Cercanos';
    }
}

// Toggle parking section
function toggleParkingSection() {
    const parkingSection = document.getElementById('parkingSection');
    const btn = document.getElementById('parkingBtn');
    
    if (parkingSection.style.display === 'none' || parkingSection.style.display === '') {
        parkingSection.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-car"></i> Ocultar Cocheras';
        parkingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        parkingSection.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-car"></i> Ver Cocheras Cercanas';
    }
}

// Update UI based on authentication state
function updateUIForAuthState() {
    const hotelsBtn = document.getElementById('hotelsBtn');
    const parkingBtn = document.getElementById('parkingBtn');
    
    if (currentUser) {
        // Show hotels and parking buttons for logged in users
        if (hotelsBtn) hotelsBtn.style.display = 'inline-block';
        if (parkingBtn) parkingBtn.style.display = 'inline-block';
    } else {
        // Hide hotels and parking buttons for non-logged users
        if (hotelsBtn) hotelsBtn.style.display = 'none';
        if (parkingBtn) parkingBtn.style.display = 'none';
        
        // Hide sections
        const hotelsSection = document.getElementById('hotelsSection');
        const parkingSection = document.getElementById('parkingSection');
        
        if (hotelsSection) hotelsSection.style.display = 'none';
        if (parkingSection) parkingSection.style.display = 'none';
    }
}

// Handle registration form
async function handleRegistration(event) {
    event.preventDefault();
    
    try {
        const formData = {
            eventoID: currentEventId,
            nombre: document.getElementById('regFullName').value,
            email: document.getElementById('regEmail').value,
            whatsapp: document.getElementById('regWhatsapp').value,
            iglesia: document.getElementById('regChurch').value,
            acompanantes: document.getElementById('regCompanions').value,
            comentarios: document.getElementById('regComments').value,
            timestamp: new Date()
        };
        
        // Save to Firestore
        await addDoc(collection(db, 'registros'), formData);
        
        // Show success message
        alert('¡Registro exitoso! Te contactaremos pronto.');
        
        // Close modal
        closeModal('registrationModal');
        
        // Reset form
        document.getElementById('registrationForm').reset();
        
    } catch (error) {
        console.error('Error in registration:', error);
        alert('Error al registrar. Por favor, intenta de nuevo.');
    }
}

// Handle hospitality form
async function handleHospitality(event) {
    event.preventDefault();
    
    try {
        const formData = {
            eventoID: currentEventId,
            nombre: document.getElementById('hospFullName').value,
            whatsapp: document.getElementById('hospWhatsapp').value,
            iglesia: document.getElementById('hospChurch').value,
            personas: document.getElementById('hospPeopleCount').value,
            fechas: document.getElementById('hospDates').value,
            comentarios: document.getElementById('hospComments').value,
            timestamp: new Date()
        };
        
        // Save to Firestore
        await addDoc(collection(db, 'solicitudes_hospitalidad'), formData);
        
        // Show success message
        alert('¡Solicitud de hospitalidad enviada! Te contactaremos pronto.');
        
        // Close modal
        closeModal('hospitalityModal');
        
        // Reset form
        document.getElementById('hospitalityForm').reset();
        
    } catch (error) {
        console.error('Error in hospitality request:', error);
        alert('Error al enviar solicitud. Por favor, intenta de nuevo.');
    }
}

// Utility functions
function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const eventDetailContent = document.getElementById('eventDetailContent');
    
    if (show) {
        loadingSpinner.style.display = 'block';
        eventDetailContent.style.display = 'none';
    } else {
        loadingSpinner.style.display = 'none';
        eventDetailContent.style.display = 'block';
    }
}

function showError(message) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${message}</p>
        <a href="index.html" class="btn btn-primary">Volver al Inicio</a>
    `;
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Export functions for global use
window.closeModal = closeModal;