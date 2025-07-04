
# 📦 Hospitalidad en Acción

## 🏷️ Título oficial
**Hospitalidad en Acción**

## © Derechos reservados
**Néstor Manrique**

---

## 🌟 Idea general
Una **webapp moderna y responsiva** para conectar eventos cristianos con anfitriones y visitantes, gestionar hospedaje, mostrar hoteles/cocheras cercanas, y permitir al equipo de administración organizar todo de forma fácil y segura.

Se centra en la **hospitalidad cristiana**, ayudando a recibir hermanos que vienen a eventos especiales.

---

## ✅ Base técnica

| Capa      | Tecnología                            | Detalles                                          |
| --------- | ------------------------------------- | ------------------------------------------------- |
| Frontend  | HTML, CSS, JS (opcional: Vue.js o React) | Alojada en GitHub Pages                          |
| Backend   | Firebase (Firestore, Auth, Storage)   | Escalable, rápido y seguro                        |
| Datos     | Firestore                             | Estructura en colecciones y documentos            |
| Imágenes  | Firebase Storage                      | Banners, fotos de eventos, fotos de usuarios      |
| Autenticación | Firebase Auth                      | Email/Password (con posible ampliación a Google login) |

---

## 📁 Estructura del proyecto

\`\`\`
/index.html                → Página principal (grilla eventos)
/welcome.html              → Presentación inicial con video o imagen
/event-detail.html         → Detalle de evento
/profile.html              → Mi Perfil
/register.html             → Registro
/login.html                → Login
/css/styles.css
/js/main.js                → Lógica principal
/js/firebase-config.js     → Configuración Firebase
/js/auth.js                → Login/registro
/js/events.js              → Leer y mostrar eventos
/img/                      → Logos, banners, imágenes
/components/               → HTML de tarjetas, header, footer (si usas modularización)
\`\`\`

---

## 📊 Estructura de Firestore (propuesta)

\`\`\`
/eventos
    └─ eventoID
         - titulo
         - descripcion
         - fecha_inicio
         - fecha_fin
         - lugar
         - imagenURL
         - gps
         - horarios

/usuarios
    └─ uid
         - nombre
         - apellido
         - email
         - rol (visitante, anfitrion, admin, ayudante)
         - fotoURL

/anfitriones
    └─ uid
    └─ uid/niveles
         - nivelID
              - nombre
    └─ uid/habitaciones
         - habitacionID
              - nombre
              - tipo
              - nivelID

/visitantes
    └─ uid
         - datos del visitante
         - eventoID

/hoteles
    └─ hotelID
         - nombre
         - direccion
         - telefono
         - eventoID

/cocheras
    └─ cocheraID
         - nombre
         - direccion
         - capacidad
         - eventoID
\`\`\`

---

## ✏️ Pantallas principales
✅ Presentación (video o gif, opción omitir)  
✅ Grilla de eventos (tarjetas)  
✅ Detalle del evento (imagen grande, descripción, fechas, GPS, botones registrarse)  
✅ Registro / Login  
✅ Mi perfil (datos, eventos inscritos, ser visitante o anfitrión)  
✅ Formularios de anfitrión y visitante  
✅ Vista de hoteles y cocheras cercanas

---

## 🌱 Estilo visual
- Diseño limpio, centrado, moderno.
- Colores base: `#6b4b9a` y `#e8e5f0`.
- Tarjetas con fondo blanco, sombra suave, bordes redondeados.
- Responsivo (adaptable a móvil y desktop).

---

## 🔑 Control de roles
- Visitante: puede inscribirse a eventos, ver hoteles/cocheras.
- Anfitrión: puede registrar niveles y habitaciones.
- Admin/Ayudante: puede editar datos, asignar habitaciones, cargar hoteles/cocheras.
- Todos con autenticación Firebase.

---

## 🧰 Herramientas extra recomendadas
- Tailwind CSS para diseño rápido.
- Deploy automático en GitHub Pages.
- Git para versionar el proyecto.
- README.md documentando estructura y pasos.

---

## 📝 Backup final del proyecto
\`\`\`
Título: Hospitalidad en Acción
Derechos reservados: Néstor Manrique
Frontend: HTML, CSS, JS (GitHub Pages)
Backend/Datos: Firebase (Firestore, Auth, Storage)
Estilo: Moderno, limpio, colores #6b4b9a y #e8e5f0
\`\`\`
