import React from 'react';
import { Search, Filter, Edit2, Trash2, Plus, Minus, AlertTriangle, CheckCircle, PackageOpen } from 'lucide-react';

export default function ProductList({
  products = [],
  loading = false,
  searchTerm = '',
  onSearchChange,
  selectedCategory = 'Todas',
  onCategoryChange,
  categories = [],
  onEditProduct,
  onDeleteProduct,
  onQuickStockChange,
  onOpenCreateModal
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o código SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600 hidden sm:inline">Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full sm:w-48 py-2 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="Todas">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-sm font-medium">Cargando inventario...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No se encontraron productos</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'Todas'
                ? 'No hay productos que coincidan con los filtros de búsqueda seleccionados.'
                : 'Aún no has registrado productos en tu inventario. Comienza agregando el primero.'}
            </p>
            {(!searchTerm && selectedCategory === 'Todas') && (
              <button
                onClick={onOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
              >
                <Plus className="w-4 h-4" />
                Registrar primer producto
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <th className="py-3.5 px-4">Código SKU</th>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((product) => {
                const isLowStock = Number(product.stockQuantity) <= Number(product.minStockAlert || 5);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* SKU */}
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">
                        {product.sku}
                      </span>
                    </td>

                    {/* Nombre y Descripción */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      {product.description && (
                        <p className="text-xs text-slate-400 truncate max-w-xs">{product.description}</p>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {product.category || 'General'}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Stock y Ajuste Rápido */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onQuickStockChange(product, -1)}
                          disabled={Number(product.stockQuantity) <= 0}
                          title="Restar 1 unidad"
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-slate-900 min-w-8 text-center text-xs">
                          {product.stockQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQuickStockChange(product, 1)}
                          title="Sumar 1 unidad"
                          className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Estado de Stock */}
                    <td className="py-3.5 px-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Stock Crítico (≤ {product.minStockAlert})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Óptimo
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditProduct(product)}
                          title="Editar producto"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product)}
                          title="Eliminar producto"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

