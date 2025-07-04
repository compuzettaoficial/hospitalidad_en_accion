// js/firebase-config.js
// Importa e inicializa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFaCbNqpd93Eirj7NDnkKtOS6Ym0rMoiA",
  authDomain: "hospitalidad-29c5c.firebaseapp.com",
  projectId: "hospitalidad-29c5c",
  storageBucket: "hospitalidad-29c5c.appspot.com",
  messagingSenderId: "1061561367897",
  appId: "1:1061561367897:web:57921b5aa3eb7bc3132048"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta db para usarlo en otros archivos
export { db };
