/* eslint-disable @typescript-eslint/no-require-imports */
const { registerSettingsHandlers } = require('./settings-handlers');
const { registerDataHandlers } = require('./data-handlers');
const { registerCustomerHandlers } = require('./customer-handlers');
const { registerProductHandlers } = require('./product-handlers');
const { registerSalesHandlers } = require('./sales-handlers');
const { setupEmailHandlers } = require('./email-handlers');

function registerAllHandlers(databaseService) {
  console.log('Registering all IPC handlers...');
  
  // Register all handler modules
  registerSettingsHandlers(databaseService);
  registerDataHandlers(databaseService);
  registerCustomerHandlers(databaseService);
  registerProductHandlers(databaseService);
  registerSalesHandlers(databaseService);
  setupEmailHandlers(); // Email handlers don't need database service
  
  console.log('All IPC handlers registered successfully');
}

module.exports = {
  registerAllHandlers
};
