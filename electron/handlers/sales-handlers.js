/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerSalesHandlers(databaseService) {
  console.log('🔧 registerSalesHandlers called with databaseService:', !!databaseService);
  
  // Check what methods are available on databaseService
  if (databaseService) {
    console.log('🔧 databaseService methods:', Object.getOwnPropertyNames(databaseService));
    console.log('🔧 databaseService.getSales exists:', typeof databaseService.getSales);
    console.log('🔧 databaseService constructor:', databaseService.constructor.name);
  } else {
    console.error('❌ databaseService is null/undefined');
  }

  // TEST: Simple IPC handler to verify IPC is working
  ipcMain.handle('test-sales-ipc', async () => {
    console.log('🔧 TEST: Simple IPC handler called successfully!');
    return { success: true, message: 'IPC is working!' };
  });
  
  // Sales-related IPC handlers
  ipcMain.handle('get-sales', async () => {
    try {
      console.log('🔧 get-sales IPC handler called');
      
      // Safety check: ensure databaseService is available and has getSales method
      if (!databaseService) {
        console.error('❌ databaseService is null in get-sales handler');
        return { success: false, error: 'Database service not available' };
      }
      
      if (typeof databaseService.getSales !== 'function') {
        console.error('❌ databaseService.getSales is not a function');
        console.log('Available methods:', Object.getOwnPropertyNames(databaseService));
        return { success: false, error: 'getSales method not available on database service' };
      }
      
      console.log('🔧 Calling databaseService.getSales()');
      const sales = await databaseService.getSales();
      console.log('🔧 get-sales result:', sales?.length || 0, 'sales');
      
      return { success: true, data: sales || [] };
    } catch (error) {
      console.error('🔧 get-sales error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('create-sale', async (event, saleData) => {
    try {
      console.log('Creating sale with items:', saleData.items);
      
      // First, validate stock availability for all items
      if (saleData.items && Array.isArray(saleData.items)) {
        const stockIssues = [];
        
        for (const item of saleData.items) {
          const product = await databaseService.getProductById(item.productId);
          if (!product) {
            stockIssues.push(`Product "${item.productName}" not found`);
            continue;
          }
          
          const currentStock = product.stock || 0;
          const quantitySold = item.quantity || 0;
          
          if (currentStock < quantitySold) {
            stockIssues.push(
              `Insufficient stock for "${product.name}". Available: ${currentStock}, Requested: ${quantitySold}`
            );
          }
        }
        
        // If there are stock issues, return error
        if (stockIssues.length > 0) {
          return {
            success: false,
            error: 'Stock validation failed',
            details: stockIssues
          };
        }
        
        // Deduct stock for each item in the sale
        for (const item of saleData.items) {
          try {
            // Get current product
            const product = await databaseService.getProductById(item.productId);
            if (!product) {
              console.warn(`Product not found: ${item.productId}`);
              continue;
            }
            
            // Calculate new stock
            const currentStock = product.stock || 0;
            const quantitySold = item.quantity || 0;
            const newStock = currentStock - quantitySold;
            
            console.log(`Updating stock for ${product.name}: ${currentStock} -> ${newStock} (sold ${quantitySold})`);
            
            // Update product stock
            await databaseService.updateProduct(item.productId, {
              stock: newStock
            });
          } catch (stockError) {
            console.error(`Error updating stock for product ${item.productId}:`, stockError);
            // Continue with other items even if one fails
          }
        }
      }
      
      // Create the sale
      const sale = await databaseService.createSale(saleData);
      return { success: true, data: sale };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('update-sale', async (event, payload) => {
    try {
      const { id, updates } = payload;
      console.log('Updating sale with items:', updates.items);
      
      // If items are being updated, we need to adjust stock
      if (updates.items && Array.isArray(updates.items)) {
        // Get the original sale to see what was previously sold
        const originalSale = await databaseService.getSaleById(id);
        
        // Temporarily restore stock to check availability
        const temporaryStockMap = new Map();
        
        if (originalSale && originalSale.items) {
          // First, restore stock from original sale items
          for (const originalItem of originalSale.items) {
            try {
              const product = await databaseService.getProductById(originalItem.productId);
              if (product) {
                const currentStock = product.stock || 0;
                const quantityToRestore = originalItem.quantity || 0;
                const restoredStock = currentStock + quantityToRestore;
                
                temporaryStockMap.set(originalItem.productId, restoredStock);
                
                console.log(`Restoring stock for ${product.name}: ${currentStock} -> ${restoredStock} (restored ${quantityToRestore})`);
                
                await databaseService.updateProduct(originalItem.productId, {
                  stock: restoredStock
                });
              }
            } catch (restoreError) {
              console.error(`Error restoring stock for product ${originalItem.productId}:`, restoreError);
            }
          }
        }
        
        // Validate stock availability for new items
        const stockIssues = [];
        
        for (const newItem of updates.items) {
          const product = await databaseService.getProductById(newItem.productId);
          if (!product) {
            stockIssues.push(`Product "${newItem.productName}" not found`);
            continue;
          }
          
          const availableStock = temporaryStockMap.get(newItem.productId) || product.stock || 0;
          const quantityRequested = newItem.quantity || 0;
          
          if (availableStock < quantityRequested) {
            stockIssues.push(
              `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${quantityRequested}`
            );
          }
        }
        
        // If there are stock issues, restore original stock and return error
        if (stockIssues.length > 0) {
          // Restore original stock levels
          if (originalSale && originalSale.items) {
            for (const originalItem of originalSale.items) {
              try {
                const product = await databaseService.getProductById(originalItem.productId);
                if (product) {
                  const currentStock = temporaryStockMap.get(originalItem.productId) || product.stock || 0;
                  const originalQuantity = originalItem.quantity || 0;
                  const originalStock = currentStock - originalQuantity;
                  
                  await databaseService.updateProduct(originalItem.productId, {
                    stock: originalStock
                  });
                }
              } catch (restoreError) {
                console.error(`Error restoring original stock for product ${originalItem.productId}:`, restoreError);
              }
            }
          }
          
          return {
            success: false,
            error: 'Stock validation failed',
            details: stockIssues
          };
        }
        
        // Then, deduct stock for new/updated items
        for (const newItem of updates.items) {
          try {
            const product = await databaseService.getProductById(newItem.productId);
            if (product) {
              const currentStock = product.stock || 0;
              const quantitySold = newItem.quantity || 0;
              const newStock = currentStock - quantitySold;
              
              console.log(`Deducting stock for ${product.name}: ${currentStock} -> ${newStock} (sold ${quantitySold})`);
              
              await databaseService.updateProduct(newItem.productId, {
                stock: newStock
              });
            }
          } catch (deductError) {
            console.error(`Error deducting stock for product ${newItem.productId}:`, deductError);
          }
        }
      }
      
      // Update the sale
      const sale = await databaseService.updateSale(id, updates);
      return { success: true, data: sale };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-sale', async (event, saleId) => {
    try {
      console.log('Deleting sale and restoring stock:', saleId);
      
      // Get the sale to restore stock before deleting
      const sale = await databaseService.getSaleById(saleId);
      
      if (sale && sale.items && Array.isArray(sale.items)) {
        // Restore stock for each item
        for (const item of sale.items) {
          try {
            const product = await databaseService.getProductById(item.productId);
            if (product) {
              const currentStock = product.stock || 0;
              const quantityToRestore = item.quantity || 0;
              const restoredStock = currentStock + quantityToRestore;
              
              console.log(`Restoring stock for ${product.name}: ${currentStock} -> ${restoredStock} (restored ${quantityToRestore})`);
              
              await databaseService.updateProduct(item.productId, {
                stock: restoredStock
              });
            }
          } catch (restoreError) {
            console.error(`Error restoring stock for product ${item.productId}:`, restoreError);
          }
        }
      }
      
      // Delete the sale
      await databaseService.deleteSale(saleId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-sale-by-id', async (event, saleId) => {
    try {
      const sale = await databaseService.getSaleById(saleId);
      return { success: true, data: sale };
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

  // Apply customer store credit to sale
  ipcMain.handle('apply-customer-credit-to-sale', async (event, payload) => {
    try {
      const { saleId, customerId, creditAmount } = payload;
      
      console.log('Applying customer credit to sale:', { saleId, customerId, creditAmount });
      
      // Get customer and validate credit
      const customer = await databaseService.getCustomerById(customerId);
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }
      
      const availableCredit = customer.storeCredit || 0;
      if (availableCredit <= 0) {
        return { success: false, error: 'Customer has no store credit available' };
      }
      
      if (creditAmount > availableCredit) {
        return { success: false, error: `Only ${availableCredit} credit available` };
      }
      
      // Get sale
      const sale = await databaseService.getSaleById(saleId);
      if (!sale) {
        return { success: false, error: 'Sale not found' };
      }
      
      // For sales, credit reduces the total amount (acts as discount)
      // Update customer credit
      const newCustomerCredit = availableCredit - creditAmount;
      await databaseService.updateCustomer(customerId, {
        storeCredit: newCustomerCredit
      });
      
      // Add note about credit applied
      const creditNote = `Store credit applied: ${creditAmount}`;
      const existingNotes = sale.notes || '';
      const updatedNotes = existingNotes ? `${existingNotes}\n${creditNote}` : creditNote;
      
      await databaseService.updateSale(saleId, {
        notes: updatedNotes
      });
      
      console.log('Credit applied to sale successfully:', {
        creditApplied: creditAmount,
        newCustomerCredit
      });
      
      return {
        success: true,
        message: `${creditAmount} credit applied to sale`,
        data: {
          creditApplied: creditAmount,
          remainingCredit: newCustomerCredit
        }
      };
      
    } catch (error) {
      console.error('Error applying customer credit to sale:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('Sales handlers registered');
}

module.exports = {
  registerSalesHandlers
};
