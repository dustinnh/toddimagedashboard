/**
 * Todd Image Dashboard - Main Server
 * Express server for OpenAI Image Generation Dashboard
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const generateRoutes = require('./routes/generate');
const editRoutes = require('./routes/edit');
const presetRoutes = require('./routes/presets');
const usageRoutes = require('./routes/usage');
const imagesRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found in environment variables');
  console.error('Please create a .env file with your OpenAI API key');
  console.error('See .env.example for reference');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure necessary directories exist
const directories = [
  path.join(__dirname, '../Images'),
  path.join(__dirname, '../data'),
  path.join(__dirname, '../uploads'),
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Serve generated images
app.use('/images', express.static(path.join(__dirname, '../Images')));

// API Routes
app.use('/api/generate', generateRoutes);
app.use('/api/edit', editRoutes);
app.use('/api/presets', presetRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/images', imagesRoutes);

// Category icons endpoint
app.get('/api/category-icons', (req, res) => {
  try {
    const iconsPath = path.join(__dirname, '../data/category-icons.json');
    if (!fs.existsSync(iconsPath)) {
      return res.json({ categoryIcons: {} });
    }
    const data = fs.readFileSync(iconsPath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error loading category icons:', error);
    res.status(500).json({ success: false, error: 'Failed to load category icons' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Serve Vue frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n✓ Todd Image Dashboard Server Started');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
  console.log('\nReady to generate images! 🎨\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});
