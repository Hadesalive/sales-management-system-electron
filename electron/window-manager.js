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
    
    // Serve static files from the out directory
    app.use(express.static(path.join(__dirname, '../out')));
    
    // Map _next/static to the actual static directory
    app.use('/_next/static', express.static(path.join(__dirname, '../out/static')));
    
    // Start server on a random port
    const port = 0; // Let the system choose an available port
    server.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`🌐 Serving production build on port ${actualPort}`);
      mainWindow.loadURL(`http://localhost:${actualPort}/server/app/index.html`);
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
