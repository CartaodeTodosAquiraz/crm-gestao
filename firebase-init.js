// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7g9-nOIriHTnvqw7Ng-Vz73YgJ5gBcT4",
  authDomain: "crm-gestao-e9ae1.firebaseapp.com",
  databaseURL: "https://crm-gestao-e9ae1-default-rtdb.firebaseio.com",
  projectId: "crm-gestao-e9ae1",
  storageBucket: "crm-gestao-e9ae1.firebasestorage.app",
  messagingSenderId: "14732052302",
  appId: "1:14732052302:web:ad1d394d8e26d745d9c01f"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, set, push, onValue, update, remove };
