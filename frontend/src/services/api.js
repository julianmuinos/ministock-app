const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper para realizar peticiones y capturar respuestas con mensajes claros de error
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Error ${res.status}: ${res.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`Error en API [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Comprobar estado de conexión del backend
  checkHealth: () => request('/health'),

  // Obtener productos (con soporte de filtros opcionales)
  getProducts: ({ category, search } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'Todas') params.append('category', category);
    if (search && search.trim() !== '') params.append('search', search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/products${query}`);
  },

  // Obtener producto individual
  getProductById: (id) => request(`/products/${id}`),

  // Crear producto
  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),

  // Actualizar producto
  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),

  // Eliminar producto
  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE'
    })
};

