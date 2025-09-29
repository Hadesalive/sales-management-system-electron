/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerCustomerHandlers(databaseService) {
  // Customer-related IPC handlers
  ipcMain.handle('get-customers', async () => {
    try {
      const customers = await databaseService.getCustomers();
      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-customer', async (event, customerData) => {
    try {
      const customer = await databaseService.createCustomer(customerData);
      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-customer', async (event, customerId, customerData) => {
    try {
      const customer = await databaseService.updateCustomer(customerId, customerData);
      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-customer', async (event, customerId) => {
    try {
      await databaseService.deleteCustomer(customerId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-customer-by-id', async (event, id) => {
    try {
      const customer = await databaseService.getCustomerById(id);
      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('search-customers', async (event, query) => {
    try {
      const customers = await databaseService.searchCustomers(query);
      return { success: true, data: customers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-customer-stats', async () => {
    try {
      const stats = await databaseService.getCustomerStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('Customer handlers registered');
}

module.exports = {
  registerCustomerHandlers
};
