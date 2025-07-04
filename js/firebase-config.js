// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBFaCbNqpd93Eirj7NDnkKtOS6Ym0rMoiA",
  authDomain: "hospitalidad-29c5c.firebaseapp.com",
  projectId: "hospitalidad-29c5c",
  storageBucket: "hospitalidad-29c5c.appspot.com",
  messagingSenderId: "1061561367897",
  appId: "1:1061561367897:web:57921b5aa3eb7bc3132048"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Firestore
const db = firebase.firestore();

// Debug: ver si está bien inicializado
console.log('Firebase inicializado con projectId:', firebaseConfig.projectId);
