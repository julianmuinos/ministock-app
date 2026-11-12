import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Mini-Stock corriendo en: http://localhost:${PORT}`);
  console.log(`📡 Healthcheck disponible en: http://localhost:${PORT}/api/health`);
  console.log(`📦 Endpoint de productos: http://localhost:${PORT}/api/products`);
});

