import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGkwXarUC1LCjqIjVnCc1OCKQzbsENokA",
  authDomain: "fitsync-a7d0e.firebaseapp.com",
  projectId: "fitsync-a7d0e",
  storageBucket: "fitsync-a7d0e.firebasestorage.app",
  messagingSenderId: "934279400181",
  appId: "1:934279400181:web:98ce71d045581a712913bc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.FitSyncFirebase = { app, auth, db };