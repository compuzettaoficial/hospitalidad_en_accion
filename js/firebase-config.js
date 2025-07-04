// js/firebase-config.js
// Configuración real de Firebase (reemplaza por tus datos reales)
const firebaseConfig = {
  apiKey: "AIzaSyD5xKq-REAL_API_KEY",
  authDomain: "mi-proyecto-id.firebaseapp.com",
  projectId: "mi-proyecto-id",
  storageBucket: "mi-proyecto-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdefghijk"
};

// Inicializar Firebase solo una vez
firebase.initializeApp(firebaseConfig);

// Exportar db para usarlo en events.js
const db = firebase.firestore();
