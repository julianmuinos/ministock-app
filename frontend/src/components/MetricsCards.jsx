import React from 'react';
import { Package, Layers, AlertTriangle, DollarSign } from 'lucide-react';

export default function MetricsCards({ products = [] }) {
  const totalProducts = products.length;
  const totalUnits = products.reduce((acc, curr) => acc + (Number(curr.stockQuantity) || 0), 0);
  const lowStockCount = products.filter(
    (p) => (Number(p.stockQuantity) || 0) <= (Number(p.minStockAlert) || 5)
  ).length;
  const totalValue = products.reduce(
    (acc, curr) => acc + (Number(curr.price) || 0) * (Number(curr.stockQuantity) || 0),
    0
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      title: 'Total de Productos',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      border: 'border-blue-100',
      description: 'SKUs distintos registrados'
    },
    {
      title: 'Unidades en Stock',
      value: totalUnits,
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      border: 'border-indigo-100',
      description: 'Total de artículos físicos'
    },
    {
      title: 'Alertas de Stock Bajo',
      value: lowStockCount,
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'text-rose-600' : 'text-slate-500',
      bgColor: lowStockCount > 0 ? 'bg-rose-50' : 'bg-slate-50',
      border: lowStockCount > 0 ? 'border-rose-200' : 'border-slate-100',
      description: lowStockCount > 0 ? 'Productos requieren reposición' : 'Niveles de stock óptimos',
      highlight: lowStockCount > 0
    },
    {
      title: 'Valor del Inventario',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      border: 'border-emerald-100',
      description: 'Cálculo (Precio × Stock)'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-xl border p-4 shadow-sm transition hover:shadow-md ${card.border}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <h3 className={`text-2xl font-bold mt-1 ${card.highlight ? 'text-rose-600' : 'text-slate-900'}`}>
                  {card.value}
                </h3>
              </div>
              <div className={`w-11 h-11 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

