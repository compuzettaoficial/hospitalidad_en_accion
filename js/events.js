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
