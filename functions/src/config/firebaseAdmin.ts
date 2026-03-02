import * as admin from "firebase-admin";

/**
 * Inicialización centralizada de firebase-admin
 * Este archivo asegura que firebase-admin se inicialice solo una vez
 */

// Inicializar firebase-admin solo si no hay apps creadas
if (!admin.apps.length) {
    admin.initializeApp();
}

export default admin;
