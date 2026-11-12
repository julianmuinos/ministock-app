import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header.jsx';
import MetricsCards from './components/MetricsCards.jsx';
import ProductList from './components/ProductList.jsx';
import ProductModal from './components/ProductModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import { api } from './services/api.js';
import { AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mensajes de notificación (Toast)
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Comprobar estado de la API y Firebase
  const checkHealth = async () => {
    try {
      const data = await api.checkHealth();
      setHealthStatus(data);
    } catch {
      setHealthStatus({ firebaseConnected: false, offline: true });
    }
  };

  // Cargar lista de productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.warn('No se pudieron cargar productos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadProducts();
  }, []);

  // Categorías únicas
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtro de productos en cliente
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todas' || (p.category && p.category === selectedCategory);

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Manejar creación o edición
  const handleSaveProduct = async (productData) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, productData);
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? updated : item))
        );
        showToast('Producto actualizado correctamente');
      } else {
        const created = await api.createProduct(productData);
        setProducts((prev) => [created, ...prev]);
        showToast('Producto agregado al inventario');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar eliminación
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast('Producto eliminado del inventario');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Ajuste rápido de stock (+ / -)
  const handleQuickStockChange = async (product, delta) => {
    const newStock = Math.max(0, (Number(product.stockQuantity) || 0) + delta);
    if (newStock === product.stockQuantity) return;

    try {
      // Optimistic UI update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stockQuantity: newStock } : p))
      );
      await api.updateProduct(product.id, { stockQuantity: newStock });
    } catch (err) {
      showToast('Error al actualizar stock', 'error');
      loadProducts(); // revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <Header
        onOpenCreateModal={() => {
          setEditingProduct(null);
          setIsProductModalOpen(true);
        }}
        healthStatus={healthStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner informativo si falta la clave de Firebase */}
        {healthStatus && !healthStatus.firebaseConnected && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-950">
                Paso pendiente: Vincular base de datos Firestore
              </p>
              <p className="text-amber-800 mt-0.5">
                La interfaz y el servidor Express están listos. Para persistir los datos en la nube, coloca tu archivo de clave de cuenta de servicio <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">serviceAccountKey.json</code> en la carpeta <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">backend/</code>.
              </p>
            </div>
          </div>
        )}

        {/* Notificación flotante (Toast) */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Tarjetas de Métricas */}
        <MetricsCards products={products} />

        {/* Lista / Tabla de Productos */}
        <ProductList
          products={filteredProducts}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onOpenCreateModal={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          onEditProduct={(product) => {
            setEditingProduct(product);
            setIsProductModalOpen(true);
          }}
          onDeleteProduct={(product) => {
            setProductToDelete(product);
            setIsDeleteModalOpen(true);
          }}
          onQuickStockChange={handleQuickStockChange}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Mini-Stock MVP • React + Express + Cloud Firestore
      </footer>

      {/* Modal Crear / Editar */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        isSubmitting={isSubmitting}
      />

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

