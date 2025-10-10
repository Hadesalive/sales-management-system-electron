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
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
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
