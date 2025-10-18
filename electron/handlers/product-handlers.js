/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerProductHandlers(databaseService) {
  // Product-related IPC handlers
  ipcMain.handle('get-products', async () => {
    try {
      // Safety check: ensure databaseService is available and has getProducts method
      if (!databaseService) {
        return { success: false, error: 'Database service not available' };
      }
      
      if (typeof databaseService.getProducts !== 'function') {
        return { success: false, error: 'getProducts method not available on database service' };
      }
      
      const products = await databaseService.getProducts();
      return { success: true, data: products || [] };
    } catch (error) {
      console.error('get-products error:', error);
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

  ipcMain.handle('update-product', async (event, payload) => {
    try {
      const { id, updates } = payload;
      const product = await databaseService.updateProduct(id, updates);
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

  ipcMain.handle('get-product-by-id', async (event, productId) => {
    try {
      const product = await databaseService.getProductById(productId);
      return { success: true, data: product };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('Product handlers registered');
}

module.exports = {
  registerProductHandlers
};
