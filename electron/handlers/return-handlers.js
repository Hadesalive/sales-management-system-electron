/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerReturnHandlers(databaseService) {
  // Get all returns
  ipcMain.handle('get-returns', async () => {
    try {
      const returns = await databaseService.getReturns();
      return { success: true, data: returns };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get return by ID
  ipcMain.handle('get-return-by-id', async (event, returnId) => {
    try {
      const returnData = await databaseService.getReturnById(returnId);
      return { success: true, data: returnData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Create return
  ipcMain.handle('create-return', async (event, returnData) => {
    try {
      console.log('Creating return with items:', returnData.items);
      
      // Create the return
      const returnRecord = await databaseService.createReturn(returnData);
      
      // If return is completed or approved, restore stock and handle refund
      if ((returnData.status === 'completed' || returnData.status === 'approved') && returnData.items && Array.isArray(returnData.items)) {
        // Restore stock for returned items
        for (const item of returnData.items) {
          try {
            const product = await databaseService.getProductById(item.productId);
            if (product) {
              const currentStock = product.stock || 0;
              const quantityReturned = item.quantity || 0;
              const newStock = currentStock + quantityReturned;
              
              console.log(`Restoring stock for ${product.name}: ${currentStock} -> ${newStock} (returned ${quantityReturned})`);
              
              await databaseService.updateProduct(item.productId, {
                stock: newStock
              });
            }
          } catch (stockError) {
            console.error(`Error restoring stock for product ${item.productId}:`, stockError);
          }
        }
        
        // If refund method is store credit, add to customer's balance
        if (returnData.refundMethod === 'store_credit' && returnData.customerId) {
          try {
            const customer = await databaseService.getCustomerById(returnData.customerId);
            if (customer) {
              const currentCredit = customer.storeCredit || 0;
              const newCredit = currentCredit + returnData.refundAmount;
              
              console.log(`Adding store credit for customer: ${currentCredit} -> ${newCredit}`);
              
              await databaseService.updateCustomer(returnData.customerId, {
                storeCredit: newCredit
              });
            }
          } catch (creditError) {
            console.error(`Error adding store credit:`, creditError);
          }
        }
      }
      
      return { success: true, data: returnRecord };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Update return
  ipcMain.handle('update-return', async (event, payload) => {
    try {
      const { id, updates } = payload;
      console.log('Updating return:', id, updates);
      
      // Get original return
      const originalReturn = await databaseService.getReturnById(id);
      
      // If status changed to completed/approved from pending/rejected, restore stock
      if (updates.status && (updates.status === 'completed' || updates.status === 'approved')) {
        if (originalReturn && originalReturn.status !== 'completed' && originalReturn.status !== 'approved') {
          const items = updates.items || originalReturn.items;
          
          if (items && Array.isArray(items)) {
            for (const item of items) {
              try {
                const product = await databaseService.getProductById(item.productId);
                if (product) {
                  const currentStock = product.stock || 0;
                  const quantityReturned = item.quantity || 0;
                  const newStock = currentStock + quantityReturned;
                  
                  console.log(`Restoring stock for ${product.name}: ${currentStock} -> ${newStock} (returned ${quantityReturned})`);
                  
                  await databaseService.updateProduct(item.productId, {
                    stock: newStock
                  });
                }
              } catch (stockError) {
                console.error(`Error restoring stock for product ${item.productId}:`, stockError);
              }
            }
            
            // Handle store credit if refund method is store_credit
            const refundMethod = updates.refundMethod || originalReturn.refundMethod;
            const customerId = updates.customerId || originalReturn.customerId;
            const refundAmount = updates.refundAmount || originalReturn.refundAmount;
            
            if (refundMethod === 'store_credit' && customerId) {
              try {
                const customer = await databaseService.getCustomerById(customerId);
                if (customer) {
                  const currentCredit = customer.storeCredit || 0;
                  const newCredit = currentCredit + refundAmount;
                  
                  console.log(`Adding store credit for customer: ${currentCredit} -> ${newCredit}`);
                  
                  await databaseService.updateCustomer(customerId, {
                    storeCredit: newCredit
                  });
                }
              } catch (creditError) {
                console.error(`Error adding store credit:`, creditError);
              }
            }
          }
        }
      }
      
      const returnRecord = await databaseService.updateReturn(id, updates);
      return { success: true, data: returnRecord };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Delete return
  ipcMain.handle('delete-return', async (event, returnId) => {
    try {
      console.log('Deleting return:', returnId);
      
      // Get return to check if we need to remove restored stock
      const returnRecord = await databaseService.getReturnById(returnId);
      
      // If return was completed/approved, remove the stock that was restored
      if (returnRecord && (returnRecord.status === 'completed' || returnRecord.status === 'approved')) {
        if (returnRecord.items && Array.isArray(returnRecord.items)) {
          for (const item of returnRecord.items) {
            try {
              const product = await databaseService.getProductById(item.productId);
              if (product) {
                const currentStock = product.stock || 0;
                const quantityToRemove = item.quantity || 0;
                const newStock = Math.max(0, currentStock - quantityToRemove);
                
                console.log(`Removing restored stock for ${product.name}: ${currentStock} -> ${newStock} (removed ${quantityToRemove})`);
                
                await databaseService.updateProduct(item.productId, {
                  stock: newStock
                });
              }
            } catch (stockError) {
              console.error(`Error removing stock for product ${item.productId}:`, stockError);
            }
          }
        }
        
        // If store credit was added, remove it
        if (returnRecord.refundMethod === 'store_credit' && returnRecord.customerId) {
          try {
            const customer = await databaseService.getCustomerById(returnRecord.customerId);
            if (customer) {
              const currentCredit = customer.storeCredit || 0;
              const newCredit = Math.max(0, currentCredit - returnRecord.refundAmount);
              
              console.log(`Removing store credit for customer: ${currentCredit} -> ${newCredit}`);
              
              await databaseService.updateCustomer(returnRecord.customerId, {
                storeCredit: newCredit
              });
            }
          } catch (creditError) {
            console.error(`Error removing store credit:`, creditError);
          }
        }
      }
      
      await databaseService.deleteReturn(returnId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  console.log('Return handlers registered');
}

module.exports = {
  registerReturnHandlers
};

