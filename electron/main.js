/* eslint-disable @typescript-eslint/no-require-imports */

// Set NODE_ENV to production if not already set (for packaged apps)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const { app, BrowserWindow } = require('electron');
const isDev = process.env.NODE_ENV === 'development';

// Import our modular components
const { initializeDatabaseService } = require('./services/database-service');
const { registerAllHandlers } = require('./handlers');
const { createMainWindow } = require('./window-manager');
const { createApplicationMenu } = require('./menu-manager');

// Global references
let mainWindow;
let databaseService;

async function initializeApp() {
  try {
    // Initialize database service AFTER app is ready
    databaseService = initializeDatabaseService();
    
    // Initialize database and WAIT for it to complete
    await databaseService.initialize();

    // Register all IPC handlers AFTER database is ready
    registerAllHandlers(databaseService);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Show error dialog to user
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Database Initialization Error',
      `Failed to start the application. The database system is not working properly.\n\nError: ${error.message}\n\nThis usually means better-sqlite3 is not properly installed or rebuilt for Electron.`
    );
    
    // Quit the app - can't run without database
    app.quit();
    return false;
  }
}

async function setupApp() {
  try {
    // Create window AFTER database and handlers are ready
    mainWindow = createMainWindow();

    // Create application menu
    createApplicationMenu(mainWindow);

    // Handle window closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (error) {
    console.error('Failed to setup app:', error);
    throw error;
  }
}

// App event listeners
app.whenReady().then(async () => {
  const initialized = await initializeApp();
  if (initialized) {
    await setupApp(); // ← CRITICAL: Wait for database to be ready
  }
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

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    const initialized = await initializeApp();
    if (initialized) {
      await setupApp(); // ← Also wait here (macOS reactivation)
    }
  }
});

// Export for testing or other modules
module.exports = {
  mainWindow,
  databaseService
};
