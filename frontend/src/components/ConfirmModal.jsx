import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product = null,
  isDeleting = false
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">¿Eliminar producto?</h3>
          <p className="text-sm text-slate-500 mt-2">
            ¿Estás seguro de que deseas eliminar permanentemente{' '}
            <strong className="text-slate-800">"{product.name}"</strong> (SKU: {product.sku})?
          </p>
          <p className="text-xs text-rose-600 mt-2 font-medium">
            Esta acción no se puede deshacer y el registro se borrará de Firestore.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, eliminar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

