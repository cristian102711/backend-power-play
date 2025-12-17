# Manual de Usuario - Backend PowerPlay

## Introducción
El backend de PowerPlay es una API RESTful desarrollada en Node.js, Express y MongoDB, diseñada para soportar una plataforma de e-commerce multi-tenant.

## Instalación y Ejecución
1.  **Requisitos**: Node.js v16+ y MongoDB.
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```
3.  **Configurar entorno**: Crear un archivo `.env` basado en `env.example`.
4.  **Ejecutar**:
    ```bash
    npm start
    ```

## Uso de la API
La API expone endpoints seguros bajo el prefijo `/api`.

### Autenticación
*   **Registro**: `POST /api/auth/register` - Crea nuevos usuarios (Cliente/Admin).
*   **Login**: `POST /api/auth/login` - Retorna un token JWT.

### Productos
*   **Listar**: `GET /api/products` - Público. Soporta filtros por categoría.
*   **Crear**: `POST /api/products` - Requiere rol Admin y token JWT.

### Documentación Completa
Para ver la documentación interactiva de todos los endpoints, inicie el servidor y visite:
`http://localhost:3000/api-docs`

## Testing
Para ejecutar las pruebas unitarias y ver la cobertura:
```bash
npm test
```
