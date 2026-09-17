import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


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


onAuthStateChanged(auth, (user) => {

  if (!user) {

    const page =
      location.pathname.split("/").pop() || "index.html";

    if (page !== "login.html") {
      location.href = "login.html";
    }

  }

});