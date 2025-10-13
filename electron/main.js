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

async function setupApp() {
  try {
    // Initialize database FIRST and WAIT for it to complete
    console.log('Initializing database...');
    await databaseService.initialize();
    console.log('✅ Database initialized successfully');

    // Only create window AFTER database is ready
    mainWindow = createMainWindow();

    // Create application menu
    createApplicationMenu(mainWindow);

    // Handle window closed
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    
    // Show error dialog to user
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Database Initialization Error',
      `Failed to start the application. Please try again or contact support.\n\nError: ${error.message}`
    );
    
    // Quit the app - can't run without database
    app.quit();
  }
}

// App event listeners
app.whenReady().then(async () => {
  initializeApp();
  await setupApp(); // ← CRITICAL: Wait for database to be ready
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
    await setupApp(); // ← Also wait here (macOS reactivation)
  }
});

// Export for testing or other modules
module.exports = {
  mainWindow,
  databaseService
};
