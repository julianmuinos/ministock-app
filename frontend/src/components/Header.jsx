import React from 'react';
import { Package, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Header({ onOpenCreateModal, healthStatus }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Mini-Stock
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                MVP
              </span>
            </h1>
            <p className="text-xs text-slate-500">Gestor de inventario y catálogo para emprendedores</p>
          </div>
        </div>

        {/* Actions & Backend Status */}
        <div className="flex items-center space-x-4">
          {healthStatus && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">
              {healthStatus.firebaseConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Firestore Conectado</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Esperando credenciales de Firebase</span>
                </>
              )}
            </div>
          )}

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>

      </div>
    </header>
  );
}

