import { db, firebaseInitialized } from '../config/firebase.js';

const COLLECTION_NAME = 'products';

// Middleware / helper de validación de conexión a Firestore
const checkDbConnection = (res) => {
  if (!firebaseInitialized || !db) {
    res.status(503).json({
      error: 'Base de datos no disponible',
      message: 'Aún no se han configurado las credenciales de Firebase (serviceAccountKey.json). Sigue las instrucciones del README para configurarlas.'
    });
    return false;
  }
  return true;
};

// GET /api/products - Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    if (!checkDbConnection(res)) return;

    const { category, search } = req.query;
    let query = db.collection(COLLECTION_NAME);

    if (category && category !== 'Todas') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filtro por texto en memoria si se especifica búsqueda
    if (search && search.trim() !== '') {
      const term = search.toLowerCase();
      products = products.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    // Ordenar por fecha de creación descendente
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al consultar productos', details: error.message });
  }
};

// GET /api/products/:id - Obtener un producto por ID
export const getProductById = async (req, res) => {
  try {
    if (!checkDbConnection(res)) return;

    const { id } = req.params;
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ error: 'Error al consultar el producto', details: error.message });
  }
};

// POST /api/products - Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    if (!checkDbConnection(res)) return;

    const { name, sku, category, price, stockQuantity, minStockAlert, description } = req.body;

    // Validaciones básicas
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
    }
    if (!sku || sku.trim() === '') {
      return res.status(400).json({ error: 'El código SKU es obligatorio' });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a 0' });
    }
    if (stockQuantity === undefined || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      return res.status(400).json({ error: 'El stock debe ser un número entero mayor o igual a 0' });
    }

    const now = new Date().toISOString();
    const newProductData = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category ? category.trim() : 'General',
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      minStockAlert: minStockAlert !== undefined && !isNaN(Number(minStockAlert)) ? Number(minStockAlert) : 5,
      description: description ? description.trim() : '',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newProductData);
    res.status(201).json({ id: docRef.id, ...newProductData });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al registrar el producto', details: error.message });
  }
};

// PUT /api/products/:id - Actualizar un producto existente
export const updateProduct = async (req, res) => {
  try {
    if (!checkDbConnection(res)) return;

    const { id } = req.params;
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { name, sku, category, price, stockQuantity, minStockAlert, description } = req.body;
    const updates = { updatedAt: new Date().toISOString() };

    if (name !== undefined) updates.name = name.trim();
    if (sku !== undefined) updates.sku = sku.trim().toUpperCase();
    if (category !== undefined) updates.category = category.trim();
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ error: 'Precio inválido' });
      }
      updates.price = Number(price);
    }
    if (stockQuantity !== undefined) {
      if (isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
        return res.status(400).json({ error: 'Stock inválido' });
      }
      updates.stockQuantity = Number(stockQuantity);
    }
    if (minStockAlert !== undefined) {
      if (isNaN(Number(minStockAlert)) || Number(minStockAlert) < 0) {
        return res.status(400).json({ error: 'Umbral de alerta inválido' });
      }
      updates.minStockAlert = Number(minStockAlert);
    }
    if (description !== undefined) updates.description = description.trim();

    await docRef.update(updates);
    const updatedDoc = await docRef.get();

    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
  }
};

// DELETE /api/products/:id - Eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    if (!checkDbConnection(res)) return;

    const { id } = req.params;
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await docRef.delete();
    res.json({ message: 'Producto eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto', details: error.message });
  }
};

