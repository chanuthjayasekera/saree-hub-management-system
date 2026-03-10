const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const sareeRoutes = require('./routes/sareeRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const { bootstrapAdmin } = require('./utils/bootstrapAdmin');

const app = express();

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug log
app.use((req, res, next) => {
  console.log(`🔄 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sarees', sareeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Saree Management API is running...');
});

// Error handler (MUST be after routes)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    // optional: return actual error only in dev
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// --- DB + Start ---
const PORT = process.env.PORT || 8081;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ Missing MONGO_URI in .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Create admin user if not exists
    try {
      await bootstrapAdmin();
    } catch (e) {
      console.warn('⚠️ bootstrapAdmin warning:', e.message);
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
