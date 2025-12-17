const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const config = require('./config/env');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const testRoutes = require('./routes/testRoutes');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// =====================
// Trust proxy (Vercel)
// =====================
app.set('trust proxy', 1);

// =====================
// Conectar a MongoDB
// =====================
connectDB();

// =====================
// Middlewares Globales
// =====================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logger
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Health check REAL
// =====================
app.get('/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;

  /*
    0 = disconnected
    1 = connected
    2 = connecting
    3 = disconnecting
  */

  res.status(200).json({
    success: mongoState === 1,
    server: 'running',
    mongoState,
    mongoStatus:
      mongoState === 1
        ? 'MongoDB conectado'
        : 'MongoDB NO conectado',
    timestamp: new Date().toISOString()
  });
});

// =====================
// Rutas de prueba
// =====================
app.use('/api/test', testRoutes);

// =====================
// Swagger
// =====================
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Docs',
  swaggerOptions: {
    persistAuthorization: true
  }
};

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// =====================
// API Routes
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// =====================
// Ruta 404
// =====================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// =====================
// Manejo de errores
// =====================
app.use(errorHandler);

// =====================
// Iniciar servidor (local)
// =====================
const PORT = config.PORT;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🚀 Server running on port ${PORT}                ║
    ║   📦 Environment: ${config.NODE_ENV.padEnd(27)} ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    `);
  });
}

// =====================
// Errores no capturados
// =====================
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
