/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerProductHandlers(databaseService) {
  // Product-related IPC handlers
  ipcMain.handle('get-products', async () => {
    try {
      const products = await databaseService.getProducts();
      return { success: true, data: products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-product', async (event, productData) => {
    try {
      const product = await databaseService.createProduct(productData);
      return { success: true, data: product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-product', async (event, productId, productData) => {
    try {
      const product = await databaseService.updateProduct(productId, productData);
      return { success: true, data: product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-product', async (event, productId) => {
    try {
      await databaseService.deleteProduct(productId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = {
  registerProductHandlers
};
