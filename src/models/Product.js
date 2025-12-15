const mongoose = require('mongoose');

/**
 * Modelo de Producto
 * Los productos pertenecen a un tenant específico
 */
const productSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'El tenantId es requerido']
  },
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['consolas', 'videojuegos', 'accesorios', 'juegos-mesa', 'varios']
  },
  image: {
    type: String,
    required: [true, 'La imagen es requerida']
  },
  brand: {
    type: String
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto para facilitar búsquedas por tenant
productSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);

