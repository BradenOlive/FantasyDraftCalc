const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Import routes
const playerRoutes = require('./routes/players');
const draftRoutes = require('./routes/draft');
const settingsRoutes = require('./routes/settings');

// API Routes
app.use('/api/players', playerRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/settings', settingsRoutes);

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
