import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;
let firebaseInitialized = false;

// Ubicación por defecto: backend/serviceAccountKey.json o configurado por .env
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.resolve(__dirname, '../../serviceAccountKey.json');

try {
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    firebaseInitialized = true;
    console.log('✅ Firebase Admin inicializado correctamente.');
  } else {
    console.warn(`⚠️ Archivo de credenciales no encontrado en: ${keyPath}`);
    console.warn('ℹ️ Recuerda descargar tu serviceAccountKey.json desde Firebase Console y colocarlo en backend/');
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
}

export { admin, db, firebaseInitialized };

