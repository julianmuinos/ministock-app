import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Save, AlertCircle } from 'lucide-react';

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stockQuantity: '',
    minStockAlert: '5',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        category: initialData.category || '',
        price: initialData.price !== undefined ? initialData.price : '',
        stockQuantity: initialData.stockQuantity !== undefined ? initialData.stockQuantity : '',
        minStockAlert: initialData.minStockAlert !== undefined ? initialData.minStockAlert : '5',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'General',
        price: '',
        stockQuantity: '0',
        minStockAlert: '5',
        description: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    if (!formData.sku.trim()) {
      setError('El código SKU es obligatorio.');
      return;
    }
    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      setError('Ingresa un precio válido mayor o igual a 0.');
      return;
    }
    if (formData.stockQuantity === '' || isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      setError('Ingresa una cantidad de stock válida.');
      return;
    }

    try {
      await onSubmit({
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        minStockAlert: Number(formData.minStockAlert || 5)
      });
    } catch (err) {
      setError(err.message || 'Error al guardar el producto.');
    }
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <PackagePlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ej. Café en Grano 250g"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* SKU y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Código SKU *
              </label>
              <input
                type="text"
                name="sku"
                placeholder="Ej. CAF-001"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Categoría
              </label>
              <input
                type="text"
                name="category"
                placeholder="Ej. Bebidas, Insumos"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Precio ($) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="price"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Stock Actual *
              </label>
              <input
                type="number"
                min="0"
                name="stockQuantity"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1" title="Alerta de stock bajo">
                Alerta Mínima
              </label>
              <input
                type="number"
                min="0"
                name="minStockAlert"
                placeholder="5"
                value={formData.minStockAlert}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              name="description"
              rows="2"
              placeholder="Detalles sobre presentación, procedencia o notas del producto..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

