/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerOrderHandlers(databaseService) {
  console.log('🔧 registerOrderHandlers called with databaseService:', !!databaseService);
  
  // Check what methods are available on databaseService
  if (databaseService) {
    console.log('🔧 databaseService methods:', Object.getOwnPropertyNames(databaseService));
    console.log('🔧 databaseService.getOrders exists:', typeof databaseService.getOrders);
  } else {
    console.error('❌ databaseService is null/undefined in order handlers');
  }
  
  // Get all orders
  ipcMain.handle('get-orders', async () => {
    try {
      console.log('🔧 get-orders IPC handler called');
      
      // Safety check: ensure databaseService is available and has getOrders method
      if (!databaseService) {
        console.error('❌ databaseService is null in get-orders handler');
        return { success: false, error: 'Database service not available' };
      }
      
      if (typeof databaseService.getOrders !== 'function') {
        console.error('❌ databaseService.getOrders is not a function');
        console.log('Available methods:', Object.getOwnPropertyNames(databaseService));
        return { success: false, error: 'getOrders method not available on database service' };
      }
      
      console.log('🔧 Calling databaseService.getOrders()');
      const orders = await databaseService.getOrders();
      console.log('🔧 get-orders result:', orders?.length || 0, 'orders');
      
      return { success: true, data: orders || [] };
    } catch (error) {
      console.error('🔧 get-orders error:', error);
      return { success: false, error: error.message };
    }
  });

  // Get order by ID
  ipcMain.handle('get-order-by-id', async (event, orderId) => {
    try {
      const order = await databaseService.getOrderById(orderId);
      return { success: true, data: order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Create order
  ipcMain.handle('create-order', async (event, orderData) => {
    try {
      console.log('Creating order with items:', orderData.items);
      
      // Create the order
      const order = await databaseService.createOrder(orderData);
      
      // If order is delivered, add stock to products
      if (orderData.status === 'delivered' && orderData.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          try {
            const product = await databaseService.getProductById(item.productId);
            if (product) {
              const currentStock = product.stock || 0;
              const quantityReceived = item.quantity || 0;
              const newStock = currentStock + quantityReceived;
              
              console.log(`Adding stock for ${product.name}: ${currentStock} -> ${newStock} (received ${quantityReceived})`);
              
              await databaseService.updateProduct(item.productId, {
                stock: newStock
              });
            }
          } catch (stockError) {
            console.error(`Error updating stock for product ${item.productId}:`, stockError);
          }
        }
      }
      
      return { success: true, data: order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update order
  ipcMain.handle('update-order', async (event, payload) => {
    try {
      const { id, updates } = payload;
      console.log('Updating order:', id, updates);
      
      // Get original order
      const originalOrder = await databaseService.getOrderById(id);
      
      // If status changed to delivered, add stock
      if (updates.status === 'delivered' && originalOrder && originalOrder.status !== 'delivered') {
        if (updates.items && Array.isArray(updates.items)) {
          for (const item of updates.items) {
            try {
              const product = await databaseService.getProductById(item.productId);
              if (product) {
                const currentStock = product.stock || 0;
                const quantityReceived = item.quantity || 0;
                const newStock = currentStock + quantityReceived;
                
                console.log(`Adding stock for ${product.name}: ${currentStock} -> ${newStock} (received ${quantityReceived})`);
                
                await databaseService.updateProduct(item.productId, {
                  stock: newStock
                });
              }
            } catch (stockError) {
              console.error(`Error updating stock for product ${item.productId}:`, stockError);
            }
          }
        }
      }
      
      // If status changed from delivered to something else, remove stock
      if (originalOrder && originalOrder.status === 'delivered' && updates.status && updates.status !== 'delivered') {
        if (originalOrder.items && Array.isArray(originalOrder.items)) {
          for (const item of originalOrder.items) {
            try {
              const product = await databaseService.getProductById(item.productId);
              if (product) {
                const currentStock = product.stock || 0;
                const quantityToRemove = item.quantity || 0;
                const newStock = Math.max(0, currentStock - quantityToRemove);
                
                console.log(`Removing stock for ${product.name}: ${currentStock} -> ${newStock} (removed ${quantityToRemove})`);
                
                await databaseService.updateProduct(item.productId, {
                  stock: newStock
                });
              }
            } catch (stockError) {
              console.error(`Error updating stock for product ${item.productId}:`, stockError);
            }
          }
        }
      }
      
      const order = await databaseService.updateOrder(id, updates);
      return { success: true, data: order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete order
  ipcMain.handle('delete-order', async (event, orderId) => {
    try {
      console.log('Deleting order:', orderId);
      
      // Get order to check if we need to remove stock
      const order = await databaseService.getOrderById(orderId);
      
      // If order was delivered, remove the stock that was added
      if (order && order.status === 'delivered' && order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          try {
            const product = await databaseService.getProductById(item.productId);
            if (product) {
              const currentStock = product.stock || 0;
              const quantityToRemove = item.quantity || 0;
              const newStock = Math.max(0, currentStock - quantityToRemove);
              
              console.log(`Removing stock for ${product.name}: ${currentStock} -> ${newStock} (removed ${quantityToRemove})`);
              
              await databaseService.updateProduct(item.productId, {
                stock: newStock
              });
            }
          } catch (stockError) {
            console.error(`Error removing stock for product ${item.productId}:`, stockError);
          }
        }
      }
      
      await databaseService.deleteOrder(orderId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('Order handlers registered');
}

module.exports = {
  registerOrderHandlers
};

