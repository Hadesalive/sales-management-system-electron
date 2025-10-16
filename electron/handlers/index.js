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
  console.log('🔧 Registering all IPC handlers...');
  
  try {
    // Register all handler modules
    console.log('🔧 Registering settings handlers...');
    registerSettingsHandlers(databaseService);
    
    console.log('🔧 Registering data handlers...');
    registerDataHandlers(databaseService);
    
    console.log('🔧 Registering customer handlers...');
    registerCustomerHandlers(databaseService);
    
    console.log('🔧 Registering product handlers...');
    registerProductHandlers(databaseService);
    
    console.log('🔧 Registering sales handlers...');
    registerSalesHandlers(databaseService);
    
    console.log('🔧 Registering invoice handlers...');
    registerInvoiceHandlers(databaseService);
    
    console.log('🔧 Registering order handlers...');
    registerOrderHandlers(databaseService);
    
    console.log('🔧 Registering return handlers...');
    registerReturnHandlers(databaseService);
    
    console.log('🔧 Setting up email handlers...');
    setupEmailHandlers(); // Email handlers don't need database service
    
    console.log('🔧 Setting up PDF handlers...');
    setupPdfHandlers(); // PDF generation handlers
    
    console.log('✅ All IPC handlers registered successfully');
  } catch (error) {
    console.error('❌ Error registering IPC handlers:', error);
  }
}

module.exports = {
  registerAllHandlers
};
