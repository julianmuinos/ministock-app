# Mini-Stock 📦
> Sistema MVP de Control de Inventario y Catálogo de Productos para Emprendedores.
> Construido con **React + Vite + Tailwind CSS**, **Node.js (Express)** y **Cloud Firestore (NoSQL)**.

---

## 👥 Integrantes
- **Alexis Fernando Rojas**
- **Emanuel Ramirez**
- **Julian Muiños**
- **Santino Marchesini**

---

## 🚀 Arquitectura y Tecnologías
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons (Desplegado en **Cloudflare Pages**).
- **Backend:** Node.js, Express.js (REST API) (Desplegado en **Northflank**).
- **Base de Datos:** Cloud Firestore (Firebase Admin SDK).

---

## 📁 Estructura del Repositorio

```text
ministock-app/
├── backend/                  # API REST en Express y conexión a Firestore
│   ├── src/
│   │   ├── config/           # Conexión con Firebase Admin SDK
│   │   ├── controllers/      # Lógica de negocio (CRUD de productos)
│   │   ├── routes/           # Rutas /api/products
│   │   ├── app.js            # Configuración de Express y middlewares
│   │   ├── index.js          # Punto de entrada del servidor
│   │   └── seed.js           # Script para poblar Firestore con datos iniciales
│   ├── .env.example          # Variables de entorno de ejemplo
│   ├── package.json
│   └── serviceAccountKey.json (Credenciales de Firebase - Ignorado en git)
│
├── frontend/                 # Aplicación SPA en React
│   ├── src/
│   │   ├── components/       # Header, MetricsCards, ProductList, ProductModal, ConfirmModal
│   │   ├── services/         # Cliente HTTP (api.js)
│   │   ├── App.jsx           # Componente principal y gestión de estado
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔑 Paso a Paso: Configurar Firebase y obtener `serviceAccountKey.json`

Para que el backend pueda comunicarse con Firestore de forma segura:

### 1. Crear el Proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/) e inicia sesión con tu cuenta de Google.
2. Haz clic en **"Crear un proyecto"** (o "Add project").
3. Asígnale un nombre (por ejemplo: `ministock-db`).
4. Puedes desactivar Google Analytics para este MVP y haz clic en **"Crear proyecto"**.

### 2. Habilitar Cloud Firestore
1. En el menú lateral izquierdo de tu proyecto en Firebase, ve a **Compilación (Build) > Firestore Database**.
2. Haz clic en **"Crear base de datos"**.
3. Elige una ubicación cercana (ej. `southamerica-east1` o la que prefieras por defecto).
4. En reglas de seguridad, selecciona **"Comenzar en modo de prueba"** (o producción) y confirma.

### 3. Descargar la Clave de Cuenta de Servicio (`serviceAccountKey.json`)
1. En la consola de Firebase, haz clic en el engranaje ⚙️ junto a **"Descripción general del proyecto"** (arriba a la izquierda) y selecciona **"Configuración del proyecto"**.
2. Ve a la pestaña **"Cuentas de servicio"** (Service accounts).
3. Asegúrate de que esté seleccionado **"Node.js"** y haz clic en el botón azul **"Generar nueva clave privada"** (Generate new private key).
4. Se descargará un archivo `.json` en tu computadora.
5. Cambia el nombre de ese archivo descargado a:
   ```text
   serviceAccountKey.json
   ```
6. Cópialo dentro de la carpeta `backend/`:
   ```text
   ministock-app/backend/serviceAccountKey.json
   ```
*(Nota: El archivo ya está protegido en `.gitignore` para que nunca se suba a GitHub).*

---

## 💻 Instrucciones para Levantar el Proyecto

### 1. Iniciar el Backend
En una terminal:
```bash
cd backend
npm install
npm run seed   # (Opcional) Poblar Firestore con 9 productos iniciales de prueba
npm run dev
```
El servidor arrancará en: **http://localhost:5000**
Puedes verificar su estado visitando: **http://localhost:5000/api/health**

### 2. Iniciar el Frontend
En otra terminal separada:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web se abrirá en: **http://localhost:3000**

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor y conexión a Firestore |
| `GET` | `/api/products` | Listar todos los productos (soporta filtros `?category=` y `?search=`) |
| `GET` | `/api/products/:id` | Obtener un producto por ID |
| `POST` | `/api/products` | Crear un nuevo producto en Firestore |
| `PUT` | `/api/products/:id` | Actualizar datos de un producto |
| `DELETE`| `/api/products/:id` | Eliminar un producto |

---

## ☁️ Despliegue en Producción

- **Backend (Northflank):**
  - Build Context: `/backend` (Buildpack Node.js, Run Command: `npm start`, Puerto HTTP público: `5000`).
  - Credenciales de Firebase: Cargadas mediante **Secret Files** en ruta absoluta `/etc/secrets/serviceAccountKey.json` y variable de entorno `FIREBASE_SERVICE_ACCOUNT_PATH=/etc/secrets/serviceAccountKey.json`.
- **Frontend (Cloudflare Pages):**
  - Framework preset: `Vite`.
  - Root directory: `frontend`.
  - Build command: `npm run build` | Output directory: `dist`.
  - Variable de entorno: `VITE_API_URL=https://<tu-backend-northflank>/api`.

---

## 📝 Licencia
Este proyecto está bajo la licencia MIT.
