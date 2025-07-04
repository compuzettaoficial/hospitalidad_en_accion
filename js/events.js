// Cargar y mostrar eventos// js/events.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// Función para cargar eventos y pintarlos en el HTML
async function loadEvents() {
  const eventsGrid = document.getElementById('eventsGrid');
  eventsGrid.innerHTML = '<p>Cargando eventos...</p>';

  try {
    const querySnapshot = await getDocs(collection(db, "eventos"));
    let html = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      html += `
        <div class="event-card">
          <div class="event-date">${data.fecha_inicio} - ${data.fecha_fin}</div>
          <h3 class="event-title">${data.titulo}</h3>
          <div class="event-location">
            <i class="fas fa-map-marker-alt"></i> ${data.lugar}
          </div>
          <p class="event-description">${data.descripcion}</p>
          <img src="${data.imagen_url}" alt="${data.titulo}" style="width:100%; border-radius:10px; margin:10px 0;">
          <div class="event-actions">
            <a href="#" class="btn btn-primary">Ver Más</a>
          </div>
        </div>
      `;
    });

    eventsGrid.innerHTML = html || '<p>No hay eventos disponibles.</p>';
  } catch (error) {
    console.error("Error al cargar eventos:", error);
    eventsGrid.innerHTML = '<p>Error al cargar eventos.</p>';
  }
}

// Ejecuta al cargar
document.addEventListener('DOMContentLoaded', loadEvents);
