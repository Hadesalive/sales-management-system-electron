/* eslint-disable @typescript-eslint/no-require-imports */
const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

function getDevServerPort() {
  // Try to read from .dev-port file first (created by detect-port.js)
  try {
    const portFile = path.join(__dirname, '..', '.dev-port');
    if (fs.existsSync(portFile)) {
      const port = parseInt(fs.readFileSync(portFile, 'utf8').trim());
      if (port && port > 0) {
        return port;
      }
    }
  } catch (error) {
    console.log('Could not read .dev-port file:', error.message);
  }

  // Fallback to environment variable
  if (process.env.DEV_PORT) {
    return parseInt(process.env.DEV_PORT);
  }

  // Final fallback to default port
  return 3000;
}

function createMainWindow() {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'default',
    show: false,
    title: 'TopNotch Sales Manager'
  });

  // Load the app
  if (isDev) {
    // In development, detect the actual port the dev server is running on
    const devPort = getDevServerPort();
    console.log(`🔗 Loading dev server on port ${devPort}`);
    mainWindow.loadURL(`http://localhost:${devPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, serve the static files via HTTP server
    const express = require('express');
    const app = express();
    const server = require('http').createServer(app);
    
    // IMPORTANT: Middleware to rewrite paths containing _next MUST be first
    // (e.g., /onboarding/_next/... → /_next/...)
    app.use((req, res, next) => {
      if (req.path.includes('/_next/')) {
        const nextIndex = req.path.indexOf('/_next/');
        req.url = req.path.substring(nextIndex);
        req.path = req.url;
      }
      next();
    });
    
    // Map _next/static to the actual static directory
    app.use('/_next/static', express.static(path.join(__dirname, '../out/static')));
    
    // Serve other _next resources
    app.use('/_next', express.static(path.join(__dirname, '../out')));
    
    // Serve static files from the out directory
    app.use(express.static(path.join(__dirname, '../out')));
    
    // Serve the main HTML file from root
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../out/server/app/index.html'));
    });
    
    // NUCLEAR OPTION: Always serve index.html for everything (except assets)
    app.use((req, res, next) => {
      console.log(`🔍 Request: ${req.method} ${req.path}`);
      
      // Skip if it's an API call or static asset
      if (req.path.startsWith('/_next') || req.path.startsWith('/api')) {
        console.log(`   → Skipping (static/API): ${req.path}`);
        return next();
      }
      
      // NUCLEAR: Always serve index.html - let React Router handle everything
      const indexPath = path.join(__dirname, '../out/server/app/index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`   → Serving index.html for: ${req.path}`);
        return res.sendFile(indexPath);
      }
      
      res.status(404).send('Not Found');
    });
    
    // Start server on a random port
    const port = 0; // Let the system choose an available port
    server.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`🌐 Serving production build on port ${actualPort}`);
      mainWindow.loadURL(`http://localhost:${actualPort}/`);
    });
    
    // Handle server errors gracefully
    server.on('error', (err) => {
      console.error('Server error:', err.message);
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}

module.exports = {
  createMainWindow
};
