// firebaseConfig.js (o donde prefieras guardar tu configuración)
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCnsLl7HYSii2nPE2nWXcKAZvg9nueJxMM",

    authDomain: "negocia-a17c5.firebaseapp.com",

    projectId: "negocia-a17c5",

    storageBucket: "negocia-a17c5.firebasestorage.app",

    messagingSenderId: "129510647165",

    appId: "1:129510647165:web:a57abb79bd4cc7834a5814",

    measurementId: "G-HN3DZG2NF8",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtén la instancia de Auth para usarla en tu app
export const auth = getAuth(app);



