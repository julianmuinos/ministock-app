import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import { firebaseInitialized } from './config/firebase.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de comprobación de salud (Healthcheck)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebaseConnected: firebaseInitialized,
    service: 'Mini-Stock API'
  });
});

// Rutas de la API
app.use('/api/products', productRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador central de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor', message: err.message });
});

export default app;

