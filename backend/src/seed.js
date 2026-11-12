import { db, firebaseInitialized } from './config/firebase.js';

const initialProducts = [
  {
    name: 'Café de Especialidad Colombia 250g',
    sku: 'CAF-COL-250',
    category: 'Café en Grano',
    price: 13500,
    stockQuantity: 18,
    minStockAlert: 5,
    description: 'Tueste medio, notas frutales a durazno y panela. Origen Huila.'
  },
  {
    name: 'Café de Especialidad Etiopía 250g',
    sku: 'CAF-ETH-250',
    category: 'Café en Grano',
    price: 15800,
    stockQuantity: 4, // Alerta: Stock bajo (<= 5)
    minStockAlert: 5,
    description: 'Proceso lavado, aroma floral y acidez cítrica brillante.'
  },
  {
    name: 'Café Blend de la Casa 500g',
    sku: 'CAF-BLN-500',
    category: 'Café en Grano',
    price: 21000,
    stockQuantity: 12,
    minStockAlert: 6,
    description: 'Mezcla equilibrada ideal para espresso o cafetera italiana.'
  },
  {
    name: 'Cafetera Prensa Francesa 600ml',
    sku: 'ACC-PRN-600',
    category: 'Accesorios',
    price: 28500,
    stockQuantity: 2, // Alerta: Stock crítico (<= 3)
    minStockAlert: 3,
    description: 'Cuerpo de vidrio borosilicato y émbolo de acero inoxidable.'
  },
  {
    name: 'Filtros de Papel V60 (100 u)',
    sku: 'ACC-FLT-V60',
    category: 'Accesorios',
    price: 9200,
    stockQuantity: 25,
    minStockAlert: 8,
    description: 'Filtros cónicos tamaño 02 color blanco sin blanquear.'
  },
  {
    name: 'Bebida de Avena Barista 1L',
    sku: 'INS-AVN-001',
    category: 'Insumos',
    price: 4300,
    stockQuantity: 30,
    minStockAlert: 10,
    description: 'Bebida vegetal especial para espumar y arte latte.'
  },
  {
    name: 'Medialunas de Manteca (Docena)',
    sku: 'PAS-MED-012',
    category: 'Pastelería',
    price: 8400,
    stockQuantity: 6,
    minStockAlert: 4,
    description: 'Elaboración artesanal del día con almíbar clásico.'
  },
  {
    name: 'Cookies con Chips de Chocolate',
    sku: 'PAS-COK-001',
    category: 'Pastelería',
    price: 2600,
    stockQuantity: 1, // Alerta: Stock crítico
    minStockAlert: 5,
    description: 'Galletitas caseras rellenas de trozos de chocolate semiamargo.'
  },
  {
    name: 'Cold Brew Embotellado 330ml',
    sku: 'BEB-CLD-330',
    category: 'Bebidas Frías',
    price: 4900,
    stockQuantity: 14,
    minStockAlert: 6,
    description: 'Infusión en frío durante 18 horas, refrescante y energizante.'
  }
];

async function seedDatabase() {
  if (!firebaseInitialized || !db) {
    console.error('❌ No se pudo conectar a Firebase. Asegúrate de tener serviceAccountKey.json en la carpeta backend/');
    process.exit(1);
  }

  console.log('🌱 Iniciando carga de datos iniciales (Seed) en Firestore...');

  try {
    const productsRef = db.collection('products');
    
    // Opcional: Limpiar productos previos para evitar duplicados
    console.log('🧹 Limpiando colección "products" previa...');
    const existing = await productsRef.get();
    if (!existing.empty) {
      const deleteBatch = db.batch();
      existing.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log(`🗑️ Se eliminaron ${existing.size} productos anteriores.`);
    }

    // Insertar productos en batch
    console.log(`📦 Insertando ${initialProducts.length} productos de prueba...`);
    const insertBatch = db.batch();
    const now = new Date().toISOString();

    initialProducts.forEach((product) => {
      const docRef = productsRef.doc();
      insertBatch.set(docRef, {
        ...product,
        createdAt: now,
        updatedAt: now
      });
    });

    await insertBatch.commit();

    console.log('✅ ¡Base de datos poblada con éxito!');
    console.log(`✨ Total de productos creados: ${initialProducts.length}`);
    console.log('📊 Incluye productos con stock normal y productos con alerta de stock crítico.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la ejecución del seed:', error);
    process.exit(1);
  }
}

seedDatabase();

