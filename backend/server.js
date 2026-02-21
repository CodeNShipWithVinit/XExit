require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const resignationRoutes = require('./routes/resignations');
const exitInterviewRoutes = require('./routes/exitInterviews');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resignations', resignationRoutes);
app.use('/api/exit-interviews', exitInterviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`\nDefault credentials:`);
      console.log(`HR - Username: admin, Password: admin`);
      console.log(`Employee - Username: john.doe, Password: password123`);
      console.log(`Employee - Username: jane.smith, Password: password123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
