// eventos-chimbote-2026.js

let hotelesData = [];
let cocherasData = [];
let currentTab = 'hoteles';

// Coordenadas del evento
const eventoCoords = {
    lat: -9.0794,
    lng: -78.5934
};

// Cargar datos
async function loadData() {
    try {
        const hotelesRes = await fetch('../data/hoteles/chimbote.json');
        const hotelesJson = await hotelesRes.json();
        hotelesData = hotelesJson.hoteles || [];
        
        const cocherasRes = await fetch('../data/cocheras/chimbote.json');
        const cocherasJson = await cocherasRes.json();
        cocherasData = cocherasJson.cocheras || [];
        
        renderHoteles();
        renderCocheras();
    } catch (error) {
        console.error('Error cargando datos:', error);
        document.getElementById('hoteles-grid').innerHTML = '<p class="loading">Error al cargar datos</p>';
    }
}

// Calcular distancia
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

// Render hoteles
function renderHoteles() {
    const grid = document.getElementById('hoteles-grid');
    
    if (hotelesData.length === 0) {
        grid.innerHTML = '<p class="loading">No hay hoteles disponibles</p>';
        return;
    }
    
    let filtered = [...hotelesData];
    
    // Filtros
    const maxPrecio = parseInt(document.getElementById('filter-precio').value);
    const maxDist = parseInt(document.getElementById('filter-distancia').value);
    const especial = document.getElementById('filter-especial').value;
    
    filtered = filtered.filter(h => {
        const precio = h.promocion?.tienePromocion ? h.promocion.preciosEvento.simple : h.precios.simple;
        const distancia = h.distancia?.metros || 9999;
        
        if (precio > maxPrecio) return false;
        if (distancia > maxDist) return false;
        if (especial === 'destacados' && !h.destacado) return false;
        if (especial === 'promocion' && !h.promocion?.tienePromocion) return false;
        
        return true;
    });
    
    // Ordenar
    const sort = document.getElementById('sort-hoteles').value;
    filtered.sort((a, b) => {
        if (sort === 'precio-asc') {
            const precioA = a.promocion?.tienePromocion ? a.promocion.preciosEvento.simple : a.precios.simple;
            const precioB = b.promocion?.tienePromocion ? b.promocion.preciosEvento.simple : b.precios.simple;
            return precioA - precioB;
        }
        if (sort === 'precio-desc') {
            const precioA = a.promocion?.tienePromocion ? a.promocion.preciosEvento.simple : a.precios.simple;
            const precioB = b.promocion?.tienePromocion ? b.promocion.preciosEvento.simple : b.precios.simple;
            return precioB - precioA;
        }
        if (sort === 'distancia-asc') {
            return (a.distancia?.metros || 9999) - (b.distancia?.metros || 9999);
        }
        if (sort === 'nombre-asc') {
            return a.nombre.localeCompare(b.nombre);
        }
    });
    
    grid.innerHTML = filtered.map(hotel => createHotelCard(hotel)).join('');
    initCarousels();
}

// Crear card hotel
function createHotelCard(hotel) {
    const precioMostrar = hotel.promocion?.tienePromocion ? hotel.promocion.preciosEvento.simple : hotel.precios.simple;
    const precioOriginal = hotel.promocion?.tienePromocion ? hotel.precios.simple : null;
    
    return `
        <div class="card" onclick="showDetail('${hotel.id}', 'hotel')">
            <div class="card-carousel" data-carousel="${hotel.id}">
                ${hotel.imagenes ? hotel.imagenes.map((img, i) => `
                    <img src="${img}" alt="${hotel.nombre}" class="carousel-img ${i === 0 ? 'active' : ''}">
                `).join('') : '<img src="https://via.placeholder.com/400x300/2563eb/ffffff?text=Sin+Imagen" class="carousel-img active">'}
                
                ${hotel.imagenes && hotel.imagenes.length > 1 ? `
                    <button class="carousel-btn prev" onclick="event.stopPropagation(); prevImage('${hotel.id}')">❮</button>
                    <button class="carousel-btn next" onclick="event.stopPropagation(); nextImage('${hotel.id}')">❯</button>
                ` : ''}
                
                ${hotel.destacado ? '<span class="card-badge">⭐ DESTACADO</span>' : ''}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${hotel.nombre}</h3>
                
                <div class="card-info">
                    ${hotel.distancia ? `
                        <div class="card-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            ${hotel.distancia.lineaRecta} • ${hotel.distancia.caminando}
                        </div>
                    ` : ''}
                    
                    <div class="card-info-item">
                        <i class="fas fa-location-dot"></i>
                        ${hotel.direccion}
                    </div>
                </div>
                
                <div class="card-price">
                    S/ ${precioMostrar}
                    ${precioOriginal ? `<span class="card-price-old">S/ ${precioOriginal}</span>` : ''}
                    ${hotel.promocion?.tienePromocion ? `<span class="promo-badge">-${hotel.promocion.descuento}%</span>` : ''}
                </div>
                
                ${hotel.promocion?.tienePromocion && hotel.promocion.codigo ? `
                    <div style="background: #fef3c7; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem; margin: 0.5rem 0;">
                        🎫 Código: <strong>${hotel.promocion.codigo}</strong>
                    </div>
                ` : ''}
                
                ${hotel.servicios && hotel.servicios.length > 0 ? `
                    <div class="card-services">
                        ${hotel.servicios.slice(0, 4).map(s => `<span class="service-tag">✓ ${s}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="card-actions">
                    ${hotel.contacto?.whatsapp ? `
                        <a href="https://wa.me/${hotel.contacto.whatsapp.replace(/[^0-9]/g, '')}" 
                           class="btn btn-secondary" 
                           onclick="event.stopPropagation()" 
                           target="_blank">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                    ` : ''}
                    
                    ${hotel.contacto?.telefono ? `
                        <a href="tel:${hotel.contacto.telefono}" 
                           class="btn btn-primary" 
                           onclick="event.stopPropagation()">
                            <i class="fas fa-phone"></i> Llamar
                        </a>
                    ` : ''}
                    
                    ${hotel.coordenadas ? `
                        <button class="btn btn-outline" 
                                onclick="event.stopPropagation(); openNavigation(${hotel.coordenadas.lat}, ${hotel.coordenadas.lng}, '${hotel.nombre}')">
                            <i class="fas fa-map"></i> Cómo llegar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Render cocheras
function renderCocheras() {
    const grid = document.getElementById('cocheras-grid');
    
    if (cocherasData.length === 0) {
        grid.innerHTML = '<p class="loading">No hay cocheras disponibles</p>';
        return;
    }
    
    let filtered = [...cocherasData];
    
    const maxPrecio = parseInt(document.getElementById('filter-precio-cochera').value);
    const maxDist = parseInt(document.getElementById('filter-distancia-cochera').value);
    
    filtered = filtered.filter(c => {
        if (c.precioDia > maxPrecio) return false;
        if ((c.distancia?.metros || 9999) > maxDist) return false;
        return true;
    });
    
    const sort = document.getElementById('sort-cocheras').value;
    filtered.sort((a, b) => {
        if (sort === 'precio-asc') return a.precioDia - b.precioDia;
        if (sort === 'distancia-asc') return (a.distancia?.metros || 9999) - (b.distancia?.metros || 9999);
        if (sort === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
    });
    
    grid.innerHTML = filtered.map(cochera => createCocheraCard(cochera)).join('');
    initCarousels();
}

// Crear card cochera
function createCocheraCard(cochera) {
    return `
        <div class="card" onclick="showDetail('${cochera.id}', 'cochera')">
            <div class="card-carousel" data-carousel="${cochera.id}">
                ${cochera.imagenes ? cochera.imagenes.map((img, i) => `
                    <img src="${img}" alt="${cochera.nombre}" class="carousel-img ${i === 0 ? 'active' : ''}">
                `).join('') : '<img src="https://via.placeholder.com/400x300/10b981/ffffff?text=Sin+Imagen" class="carousel-img active">'}
                
                ${cochera.imagenes && cochera.imagenes.length > 1 ? `
                    <button class="carousel-btn prev" onclick="event.stopPropagation(); prevImage('${cochera.id}')">❮</button>
                    <button class="carousel-btn next" onclick="event.stopPropagation(); nextImage('${cochera.id}')">❯</button>
                ` : ''}
                
                ${cochera.destacado ? '<span class="card-badge">⭐ DESTACADO</span>' : ''}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${cochera.nombre}</h3>
                
                <div class="card-info">
                    ${cochera.distancia ? `
                        <div class="card-info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            ${cochera.distancia.lineaRecta}
                        </div>
                    ` : ''}
                    
                    <div class="card-info-item">
                        <i class="fas fa-location-dot"></i>
                        ${cochera.direccion}
                    </div>
                    
                    <div class="card-info-item">
                        <i class="fas fa-car"></i>
                        Capacidad: ${cochera.capacidad} vehículos
                    </div>
                </div>
                
                <div class="card-price">
                    S/ ${cochera.precioDia} /día
                    ${cochera.precioNoche ? ` • S/ ${cochera.precioNoche} /noche` : ''}
                </div>
                
                <div class="card-actions">
                    ${cochera.whatsapp ? `
                        <a href="https://wa.me/${cochera.whatsapp.replace(/[^0-9]/g, '')}" 
                           class="btn btn-secondary" 
                           onclick="event.stopPropagation()" 
                           target="_blank">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </a>
                    ` : ''}
                    
                    ${cochera.telefono ? `
                        <a href="tel:${cochera.telefono}" 
                           class="btn btn-primary" 
                           onclick="event.stopPropagation()">
                            <i class="fas fa-phone"></i> Llamar
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Carrusel
let currentImages = {};

function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const id = carousel.dataset.carousel;
        currentImages[id] = 0;
    });
}

function nextImage(id) {
    const carousel = document.querySelector(`[data-carousel="${id}"]`);
    const images = carousel.querySelectorAll('.carousel-img');
    
    images[currentImages[id]].classList.remove('active');
    currentImages[id] = (currentImages[id] + 1) % images.length;
    images[currentImages[id]].classList.add('active');
}

function prevImage(id) {
    const carousel = document.querySelector(`[data-carousel="${id}"]`);
    const images = carousel.querySelectorAll('.carousel-img');
    
    images[currentImages[id]].classList.remove('active');
    currentImages[id] = (currentImages[id] - 1 + images.length) % images.length;
    images[currentImages[id]].classList.add('active');
}

// Modal
function showDetail(id, type) {
    const item = type === 'hotel' 
        ? hotelesData.find(h => h.id === id)
        : cocherasData.find(c => c.id === id);
    
    if (!item) return;
    
    document.getElementById('modal-title').textContent = item.nombre;
    document.getElementById('modal-body').innerHTML = type === 'hotel' 
        ? createHotelDetail(item)
        : createCocheraDetail(item);
    
    document.getElementById('detailModal').classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

function createHotelDetail(hotel) {
    return `
        <div style="display: grid; gap: 1.5rem;">
            ${hotel.imagenes && hotel.imagenes.length > 0 ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${hotel.imagenes.map(img => `<img src="${img}" style="width: 100%; border-radius: 0.5rem;">`).join('')}
                </div>
            ` : ''}
            
            <div>
                <h3 style="margin-bottom: 0.5rem;">📍 Ubicación</h3>
                <p>${hotel.direccion}</p>
                ${hotel.distancia ? `<p style="color: #2563eb; font-weight: 600;">${hotel.distancia.lineaRecta} del evento (${hotel.distancia.caminando} caminando)</p>` : ''}
            </div>
            
            <div>
                <h3 style="margin-bottom: 0.5rem;">💰 Precios</h3>
                ${hotel.promocion?.tienePromocion ? `
                    <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <p style="font-weight: 700; color: #92400e;">🎉 PROMOCIÓN ESPECIAL AMIP 2026</p>
                        <p style="margin-top: 0.5rem;">Código: <strong>${hotel.promocion.codigo}</strong></p>
                        <p style="font-size: 0.875rem; margin-top: 0.25rem;">${hotel.promocion.condiciones || ''}</p>
                    </div>
                ` : ''}
                
                <div style="display: grid; gap: 0.5rem;">
                    <p>Simple: <strong>S/ ${hotel.promocion?.tienePromocion ? hotel.promocion.preciosEvento.simple : hotel.precios.simple}</strong> ${hotel.promocion?.tienePromocion ? `<span style="text-decoration: line-through; color: #9ca3af;">S/ ${hotel.precios.simple}</span>` : ''}</p>
                    <p>Doble: <strong>S/ ${hotel.promocion?.tienePromocion ? hotel.promocion.preciosEvento.doble : hotel.precios.doble}</strong></p>
                    <p>Matrimonial: <strong>S/ ${hotel.promocion?.tienePromocion ? hotel.promocion.preciosEvento.matrimonial : hotel.precios.matrimonial}</strong></p>
                </div>
            </div>
            
            ${hotel.servicios && hotel.servicios.length > 0 ? `
                <div>
                    <h3 style="margin-bottom: 0.5rem;">✨ Servicios</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                        ${hotel.servicios.map(s => `<p>✓ ${s}</p>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${hotel.camposPersonalizados && hotel.camposPersonalizados.length > 0 ? `
                <div>
                    <h3 style="margin-bottom: 0.5rem;">ℹ️ Información Adicional</h3>
                    ${hotel.camposPersonalizados.map(campo => `
                        <p><strong>${campo.etiqueta}:</strong> ${campo.valor}</p>
                    `).join('')}
                </div>
            ` : ''}
            
            <div>
                <h3 style="margin-bottom: 0.5rem;">📞 Contacto</h3>
                <div style="display: grid; gap: 0.5rem;">
                    ${hotel.contacto.telefono ? `<p><i class="fas fa-phone"></i> ${hotel.contacto.telefono}</p>` : ''}
                    ${hotel.contacto.whatsapp ? `<p><i class="fab fa-whatsapp"></i> ${hotel.contacto.whatsapp}</p>` : ''}
                    ${hotel.contacto.email ? `<p><i class="fas fa-envelope"></i> ${hotel.contacto.email}</p>` : ''}
                    ${hotel.contacto.facebook ? `<p><i class="fab fa-facebook"></i> ${hotel.contacto.facebook}</p>` : ''}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                ${hotel.contacto.whatsapp ? `
                    <a href="https://wa.me/${hotel.contacto.whatsapp.replace(/[^0-9]/g, '')}" 
                       class="btn btn-secondary" 
                       target="_blank">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                ` : ''}
                
                ${hotel.coordenadas ? `
                    <button class="btn btn-primary" 
                            onclick="openNavigation(${hotel.coordenadas.lat}, ${hotel.coordenadas.lng}, '${hotel.nombre}')">
                        <i class="fas fa-map"></i> Cómo llegar
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function createCocheraDetail(cochera) {
    return `
        <div style="display: grid; gap: 1.5rem;">
            ${cochera.imagenes && cochera.imagenes.length > 0 ? `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${cochera.imagenes.map(img => `<img src="${img}" style="width: 100%; border-radius: 0.5rem;">`).join('')}
                </div>
            ` : ''}
            
            <div>
                <h3>📍 Ubicación</h3>
                <p>${cochera.direccion}</p>
                ${cochera.distancia ? `<p style="color: #2563eb; font-weight: 600;">${cochera.distancia.lineaRecta} del evento</p>` : ''}
            </div>
            
            <div>
                <h3>💰 Tarifas</h3>
                <p>Por día: <strong>S/ ${cochera.precioDia}</strong></p>
                ${cochera.precioNoche ? `<p>Por noche: <strong>S/ ${cochera.precioNoche}</strong></p>` : ''}
                <p>Capacidad: <strong>${cochera.capacidad} vehículos</strong></p>
            </div>
            
            <div>
                <h3>📞 Contacto</h3>
                ${cochera.telefono ? `<p><i class="fas fa-phone"></i> ${cochera.telefono}</p>` : ''}
                ${cochera.whatsapp ? `<p><i class="fab fa-whatsapp"></i> ${cochera.whatsapp}</p>` : ''}
            </div>
        </div>
    `;
}

// Navegación
function openNavigation(lat, lng, name) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
        window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`);
    } else if (isAndroid) {
        window.open(`geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`);
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentTab = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (currentTab === 'hoteles') {
            document.getElementById('hoteles-section').classList.remove('hidden');
            document.getElementById('cocheras-section').classList.add('hidden');
        } else {
            document.getElementById('hoteles-section').classList.add('hidden');
            document.getElementById('cocheras-section').classList.remove('hidden');
        }
    });
});

// Filtros
document.getElementById('filter-precio').addEventListener('change', renderHoteles);
document.getElementById('filter-distancia').addEventListener('change', renderHoteles);
document.getElementById('sort-hoteles').addEventListener('change', renderHoteles);
document.getElementById('filter-especial').addEventListener('change', renderHoteles);

document.getElementById('filter-precio-cochera').addEventListener('change', renderCocheras);
document.getElementById('filter-distancia-cochera').addEventListener('change', renderCocheras);
document.getElementById('sort-cocheras').addEventListener('change', renderCocheras);

// Cerrar modal al hacer clic fuera
document.getElementById('detailModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') closeModal();
});

// Init
loadData();
