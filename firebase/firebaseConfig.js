// firebaseConfig.js (o donde prefieras guardar tu configuración)
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
