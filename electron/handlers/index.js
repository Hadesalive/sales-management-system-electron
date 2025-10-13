/* eslint-disable @typescript-eslint/no-require-imports */
const { registerSettingsHandlers } = require('./settings-handlers');
const { registerDataHandlers } = require('./data-handlers');
const { registerCustomerHandlers } = require('./customer-handlers');
const { registerProductHandlers } = require('./product-handlers');
const { registerSalesHandlers } = require('./sales-handlers');
const { registerInvoiceHandlers } = require('./invoice-handlers');
const { registerOrderHandlers } = require('./order-handlers');
const { registerReturnHandlers } = require('./return-handlers');
const { setupEmailHandlers } = require('./email-handlers');
const { setupPdfHandlers } = require('./pdf-handlers');

function registerAllHandlers(databaseService) {
  console.log('Registering all IPC handlers...');
  
  // Register all handler modules
  registerSettingsHandlers(databaseService);
  registerDataHandlers(databaseService);
  registerCustomerHandlers(databaseService);
  registerProductHandlers(databaseService);
  registerSalesHandlers(databaseService);
  registerInvoiceHandlers(databaseService);
  registerOrderHandlers(databaseService);
  registerReturnHandlers(databaseService);
  setupEmailHandlers(); // Email handlers don't need database service
  setupPdfHandlers(); // PDF generation handlers
  
  console.log('All IPC handlers registered successfully');
}

module.exports = {
  registerAllHandlers
};
