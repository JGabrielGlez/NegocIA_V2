// firebaseConfig.js (o donde prefieras guardar tu configuración)
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

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
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Esto es para usar los emuladores en lugar de los recursos reales
if (__DEV__) {
    const ip = "192.168.1.69";
    // Si usas un celular físico, cambia 'localhost' por la IP de tu PC
    connectAuthEmulator(auth, "http://" + ip + ":1212");
    connectFirestoreEmulator(db, ip, 1214);
    connectFunctionsEmulator(functions, ip, 1213);
}
