const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB, getDbType } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Staff Scheduling & Shift Management API',
    database_driver: getDbType(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files if dist folder exists
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialize DB and Start Server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Staff Scheduling System running on http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
