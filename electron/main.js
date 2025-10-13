/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow } = require('electron');
const isDev = process.env.NODE_ENV === 'development';

// Import our modular components
const { initializeDatabaseService } = require('./services/database-service');
const { registerAllHandlers } = require('./handlers');
const { createMainWindow } = require('./window-manager');
const { createApplicationMenu } = require('./menu-manager');

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isDev:', isDev);

// Global references
let mainWindow;
let databaseService;

function initializeApp() {
  // Initialize database service
  databaseService = initializeDatabaseService();

  // Register all IPC handlers
  registerAllHandlers(databaseService);
}

function setupApp() {
  // Initialize database
  databaseService.initialize()
    .then(() => {
      console.log('Database initialized successfully');
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
    });

  // Create main window
  mainWindow = createMainWindow();

  // Create application menu
  createApplicationMenu(mainWindow);

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(() => {
  initializeApp();
  setupApp();
});

app.on('window-all-closed', () => {
  // Close database connection
  if (databaseService) {
    databaseService.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    setupApp();
  }
});

// Export for testing or other modules
module.exports = {
  mainWindow,
  databaseService
};
