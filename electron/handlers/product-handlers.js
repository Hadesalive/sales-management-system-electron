/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerProductHandlers(databaseService) {
  console.log('🔧 registerProductHandlers called with databaseService:', !!databaseService);
  
  // Check what methods are available on databaseService
  if (databaseService) {
    console.log('🔧 databaseService methods:', Object.getOwnPropertyNames(databaseService));
    console.log('🔧 databaseService.getProducts exists:', typeof databaseService.getProducts);
  } else {
    console.error('❌ databaseService is null/undefined in product handlers');
  }
  
  // Product-related IPC handlers
  ipcMain.handle('get-products', async () => {
    try {
      console.log('🔧 get-products IPC handler called');
      
      // Safety check: ensure databaseService is available and has getProducts method
      if (!databaseService) {
        console.error('❌ databaseService is null in get-products handler');
        return { success: false, error: 'Database service not available' };
      }
      
      if (typeof databaseService.getProducts !== 'function') {
        console.error('❌ databaseService.getProducts is not a function');
        console.log('Available methods:', Object.getOwnPropertyNames(databaseService));
        return { success: false, error: 'getProducts method not available on database service' };
      }
      
      console.log('🔧 Calling databaseService.getProducts()');
      const products = await databaseService.getProducts();
      console.log('🔧 get-products result:', products?.length || 0, 'products');
      
      return { success: true, data: products || [] };
    } catch (error) {
      console.error('🔧 get-products error:', error);
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
