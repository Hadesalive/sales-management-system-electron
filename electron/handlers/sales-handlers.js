/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerSalesHandlers(databaseService) {
  // Sales-related IPC handlers
  ipcMain.handle('get-sales', async () => {
    try {
      const sales = await databaseService.getSales();
      return { success: true, data: sales };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-sale', async (event, saleData) => {
    try {
      const sale = await databaseService.createSale(saleData);
      return { success: true, data: sale };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-sale', async (event, saleId, saleData) => {
    try {
      const sale = await databaseService.updateSale(saleId, saleData);
      return { success: true, data: sale };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-sale', async (event, saleId) => {
    try {
      await databaseService.deleteSale(saleId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Invoice-related handlers
  ipcMain.handle('generate-invoice', async (event, saleId) => {
    try {
      const invoice = await databaseService.generateInvoice(saleId);
      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('print-receipt', async (event, saleId) => {
    try {
      await databaseService.printReceipt(saleId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = {
  registerSalesHandlers
};
