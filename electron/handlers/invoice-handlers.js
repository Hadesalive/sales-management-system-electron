/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');

function registerInvoiceHandlers(databaseService) {
  console.log('Registering invoice handlers');
  console.log('Database service type:', typeof databaseService);
  console.log('Database service constructor:', databaseService?.constructor?.name);
  console.log('Database service keys:', Object.keys(databaseService || {}));
  console.log('Has getAllInvoiceTemplates:', typeof databaseService?.getAllInvoiceTemplates);
  console.log('Has getInvoiceById:', typeof databaseService?.getInvoiceById);

  // Get invoice templates
  ipcMain.handle('get-invoice-templates', async () => {
    try {
      console.log('Getting invoice templates...');
      console.log('Database service available:', !!databaseService);
      console.log('Has getAllInvoiceTemplates:', typeof databaseService?.getAllInvoiceTemplates);

      if (!databaseService?.getAllInvoiceTemplates) {
        console.error('getAllInvoiceTemplates method not available on database service');
        return { success: false, error: 'Database service not properly initialized' };
      }

      // Try to get templates from database first
      const templates = await databaseService.getAllInvoiceTemplates();
      
      if (templates && templates.length > 0) {
        return { success: true, data: templates };
      }

      // Fallback to default templates if database is empty
      const defaultTemplates = [
        {
          id: 'pro-corporate',
          name: 'Pro Corporate',
          description: 'Professional corporate invoice template',
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#3b82f6',
            background: '#ffffff',
            text: '#111827'
          },
          layout: {
            headerStyle: 'modern',
            showLogo: true,
            showBorder: true,
            itemTableStyle: 'detailed',
            footerStyle: 'detailed'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            size: 'medium'
          },
          isDefault: true
        },
        {
          id: 'classic-column',
          name: 'Classic Column',
          description: 'Classic column-based invoice template',
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#059669',
            background: '#ffffff',
            text: '#111827'
          },
          layout: {
            headerStyle: 'classic',
            showLogo: true,
            showBorder: true,
            itemTableStyle: 'simple',
            footerStyle: 'minimal'
          },
          fonts: {
            primary: 'Times New Roman',
            secondary: 'Arial',
            size: 'medium'
          },
          isDefault: true
        },
        {
          id: 'modern-stripe',
          name: 'Modern Stripe',
          description: 'Modern stripe-style invoice template',
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#7c3aed',
            background: '#ffffff',
            text: '#111827'
          },
          layout: {
            headerStyle: 'minimal',
            showLogo: true,
            showBorder: false,
            itemTableStyle: 'modern',
            footerStyle: 'minimal'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            size: 'medium'
          },
          isDefault: true
        },
        {
          id: 'elegant-dark',
          name: 'Elegant Dark',
          description: 'Elegant dark theme invoice template',
          colors: {
            primary: '#ffffff',
            secondary: '#d1d5db',
            accent: '#f59e0b',
            background: '#111827',
            text: '#f9fafb'
          },
          layout: {
            headerStyle: 'premium',
            showLogo: true,
            showBorder: true,
            itemTableStyle: 'modern',
            footerStyle: 'detailed'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            size: 'medium'
          },
          isDefault: true
        },
        {
          id: 'minimal-outline',
          name: 'Minimal Outline',
          description: 'Clean minimal outline template',
          colors: {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#dc2626',
            background: '#ffffff',
            text: '#111827'
          },
          layout: {
            headerStyle: 'minimal',
            showLogo: false,
            showBorder: true,
            itemTableStyle: 'simple',
            footerStyle: 'minimal'
          },
          fonts: {
            primary: 'Inter',
            secondary: 'Inter',
            size: 'small'
          },
          isDefault: true
        }
      ];

      return { success: true, data: defaultTemplates };
    } catch (error) {
      console.error('Error fetching invoice templates:', error);
      return { success: false, error: error.message };
    }
  });

  // Get specific invoice template
  ipcMain.handle('get-invoice-template', async (event, templateId) => {
    try {
      // Try to get from database first
      const template = await databaseService.getInvoiceTemplateById(templateId);
      if (template) {
        return { success: true, data: template };
      }

      // Fallback for built-in templates
      return { 
        success: true, 
        data: { 
          id: templateId, 
          name: templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `${templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} template`,
          isDefault: true 
        } 
      };
    } catch (error) {
      console.error('Error fetching invoice template:', error);
      return { success: false, error: error.message };
    }
  });

  // Create new invoice template
  ipcMain.handle('create-invoice-template', async (event, templateData) => {
    try {
      const template = await databaseService.createInvoiceTemplate(templateData);
      return { success: true, data: template };
    } catch (error) {
      console.error('Error creating invoice template:', error);
      return { success: false, error: error.message };
    }
  });

  // Update invoice template
  ipcMain.handle('update-invoice-template', async (event, payload) => {
    try {
      const { id, data } = payload;
      const template = await databaseService.updateInvoiceTemplate(id, data);
      return { success: true, data: template };
    } catch (error) {
      console.error('Error updating invoice template:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete invoice template
  ipcMain.handle('delete-invoice-template', async (event, templateId) => {
    try {
      const success = await databaseService.deleteInvoiceTemplate(templateId);
      return { success };
    } catch (error) {
      console.error('Error deleting invoice template:', error);
      return { success: false, error: error.message };
    }
  });

  // Get all invoices
  ipcMain.handle('get-invoices', async () => {
    try {
      console.log('Fetching all invoices...');
      console.log('Database service available:', !!databaseService);
      console.log('Has getInvoices:', typeof databaseService?.getInvoices);

      if (!databaseService?.getInvoices) {
        console.error('getInvoices method not available on database service');
        return { success: false, error: 'Database service not properly initialized' };
      }

      const invoices = await databaseService.getInvoices();
      console.log(`Found ${invoices?.length || 0} invoices`);
      
      // Transform to match expected format
      const transformedInvoices = (invoices || []).map(inv => ({
        id: inv.id,
        number: inv.number,
        type: inv.invoiceType,
        status: inv.status,
        customerId: inv.customerId || null,
        customerName: inv.customerName || '',
        customerEmail: inv.customerEmail || '',
        issueDate: inv.createdAt?.split('T')[0] || '',
        dueDate: inv.dueDate || '',
        paidDate: inv.paidAmount >= inv.total ? inv.updatedAt?.split('T')[0] : null,
        subtotal: inv.subtotal,
        tax: inv.tax,
        total: inv.total,
        paidAmount: inv.paidAmount || 0,
        balance: inv.total - (inv.paidAmount || 0),
        saleId: inv.saleId || null,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      }));

      return { success: true, data: transformedInvoices };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return { success: false, error: error.message };
    }
  });

  // Get invoice by ID
  ipcMain.handle('get-invoice-by-id', async (event, invoiceId) => {
    try {
      console.log('Fetching invoice with ID:', invoiceId);
      console.log('Database service available for invoice:', !!databaseService);
      console.log('Has getInvoiceById:', typeof databaseService?.getInvoiceById);

      if (!databaseService?.getInvoiceById) {
        console.error('getInvoiceById method not available on database service');
        return { success: false, error: 'Database service not properly initialized' };
      }

      const invoice = await databaseService.getInvoiceById(invoiceId);
      if (invoice) {
        console.log('Invoice found:', invoice.id);
        return { success: true, data: invoice };
      } else {
        console.log('Invoice not found for ID:', invoiceId);
        return { success: false, error: 'Invoice not found' };
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return { success: false, error: error.message };
    }
  });

  // Update invoice
  ipcMain.handle('update-invoice', async (event, data) => {
    try {
      const { id: invoiceId, body: invoiceData } = data;
      const invoice = await databaseService.updateInvoice(invoiceId, invoiceData);
      if (invoice) {
        return { success: true, data: invoice };
      } else {
        return { success: false, error: 'Failed to update invoice' };
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete invoice
  ipcMain.handle('delete-invoice', async (event, invoiceId) => {
    try {
      const success = await databaseService.deleteInvoice(invoiceId);
      return { success };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { success: false, error: error.message };
    }
  });

  // Create new invoice
  ipcMain.handle('create-invoice', async (event, invoiceData) => {
    try {
      console.log('Creating new invoice via IPC...');
      console.log('Invoice data received:', { 
        saleId: invoiceData.saleId, 
        customerId: invoiceData.customerId,
        total: invoiceData.total 
      });
      
      // Check if this is from a sale and if an invoice already exists
      if (invoiceData.saleId) {
        console.log('Invoice is linked to sale:', invoiceData.saleId);
        
        // Check if sale already has an invoice
        const sale = await databaseService.getSaleById(invoiceData.saleId);
        if (sale && sale.invoiceId) {
          console.log('Sale already has an invoice, updating instead:', sale.invoiceId);
          
          // Get existing invoice to preserve payment information
          const existingInvoice = await databaseService.getInvoiceById(sale.invoiceId);
          const existingPaidAmount = existingInvoice?.paidAmount || 0;
          const newTotal = invoiceData.total || 0;
          
          // Calculate new status based on existing payments and new total
          let newStatus = 'draft';
          if (existingPaidAmount >= newTotal) {
            newStatus = 'paid';
          } else if (existingPaidAmount > 0) {
            newStatus = 'sent'; // Partially paid
          } else {
            newStatus = invoiceData.status || 'draft';
          }
          
          console.log('Payment tracking:', {
            existingPaidAmount,
            newTotal,
            newStatus,
            hasOverpayment: existingPaidAmount > newTotal
          });
          
          // Update existing invoice instead of creating new one
          const updatedInvoice = await databaseService.updateInvoice(sale.invoiceId, {
            customerId: invoiceData.customerId,
            customerName: invoiceData.customerName || '',
            customerEmail: invoiceData.customerEmail || '',
            customerAddress: invoiceData.customerAddress || '',
            customerPhone: invoiceData.customerPhone || '',
            items: (invoiceData.items || []).map(item => ({
              id: item.id || '',
              description: item.description || '',
              itemDescription: item.itemDescription || '',
              quantity: item.quantity || 1,
              rate: item.rate || 0,
              amount: item.amount || 0,
            })),
            subtotal: invoiceData.subtotal || 0,
            tax: invoiceData.tax || 0,
            discount: invoiceData.discount || 0,
            total: newTotal,
            paidAmount: existingPaidAmount, // Preserve existing payments
            status: newStatus,
            dueDate: invoiceData.dueDate || '',
            notes: invoiceData.notes || '',
            terms: invoiceData.terms || '',
          });
          
          // Flag if there's an overpayment situation
          updatedInvoice.hasOverpayment = existingPaidAmount > newTotal;
          updatedInvoice.overpaymentAmount = existingPaidAmount > newTotal ? existingPaidAmount - newTotal : 0;
          
          return { 
            success: true, 
            data: updatedInvoice,
            warning: updatedInvoice.hasOverpayment ? 
              `Customer has overpaid by ${updatedInvoice.overpaymentAmount}. Please handle the overpayment.` : 
              undefined
          };
        }
      }
      
      // Generate invoice number if not provided
      let invoiceNumber = invoiceData.number || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Check if invoice number already exists and generate a new one if needed
      let existingInvoice = await databaseService.getInvoiceById(invoiceNumber);
      let attempts = 0;
      while (existingInvoice && attempts < 10) {
        invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now() + attempts).slice(-6)}`;
        existingInvoice = await databaseService.getInvoiceById(invoiceNumber);
        attempts++;
      }

      // Prepare bank details
      const bankDetails = invoiceData.bankDetails?.bankName && invoiceData.bankDetails?.accountNumber
        ? {
            bankName: invoiceData.bankDetails.bankName,
            accountName: invoiceData.bankDetails.accountName || '',
            accountNumber: invoiceData.bankDetails.accountNumber,
            routingNumber: invoiceData.bankDetails.routingNumber || '',
            swiftCode: invoiceData.bankDetails.swiftCode || '',
          }
        : undefined;

      let invoice;
      
      try {
        invoice = await databaseService.createInvoice({
          number: invoiceNumber,
          saleId: invoiceData.saleId || undefined,
          customerId: invoiceData.customerId || undefined,
          customerName: invoiceData.customerName || '',
          customerEmail: invoiceData.customerEmail || '',
          customerAddress: invoiceData.customerAddress || '',
          customerPhone: invoiceData.customerPhone || '',
          items: (invoiceData.items || []).map(item => ({
            id: item.id || '',
            description: item.description || '',
            itemDescription: item.itemDescription || '',
            quantity: item.quantity || 1,
            rate: item.rate || 0,
            amount: item.amount || 0,
          })),
          subtotal: invoiceData.subtotal || 0,
          tax: invoiceData.tax || 0,
          discount: invoiceData.discount || 0,
          total: invoiceData.total || 0,
          paidAmount: invoiceData.paidAmount || 0,
          balance: (invoiceData.total || 0) - (invoiceData.paidAmount || 0),
          status: invoiceData.status || 'draft',
          invoiceType: invoiceData.invoiceType || 'invoice',
          currency: invoiceData.currency || 'USD',
          dueDate: invoiceData.dueDate || '',
          notes: invoiceData.notes || '',
          terms: invoiceData.terms || '',
          bankDetails,
        });
      } catch (error) {
        // If UNIQUE constraint failed on invoice number, it means invoice already exists
        // Try to find and update it instead
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message.includes('invoices.number')) {
          console.log('Invoice number already exists, finding and updating existing invoice...');
          
          // Find existing invoice by number
          const existingInvoices = await databaseService.getInvoices();
          const existingInvoice = existingInvoices.find(inv => inv.number === invoiceNumber);
          
          if (existingInvoice) {
            console.log('Found existing invoice, updating:', existingInvoice.id);
            
            // Preserve existing payment information
            const existingPaidAmount = existingInvoice.paidAmount || 0;
            const newTotal = invoiceData.total || 0;
            
            // Calculate new status based on existing payments and new total
            let newStatus = 'draft';
            if (existingPaidAmount >= newTotal) {
              newStatus = 'paid';
            } else if (existingPaidAmount > 0) {
              newStatus = 'sent'; // Partially paid
            } else {
              newStatus = invoiceData.status || 'draft';
            }
            
            console.log('Updating invoice with preserved payments:', {
              existingPaidAmount,
              newTotal,
              newStatus,
              hasOverpayment: existingPaidAmount > newTotal
            });
            
            invoice = await databaseService.updateInvoice(existingInvoice.id, {
              customerId: invoiceData.customerId,
              customerName: invoiceData.customerName || '',
              customerEmail: invoiceData.customerEmail || '',
              customerAddress: invoiceData.customerAddress || '',
              customerPhone: invoiceData.customerPhone || '',
              items: (invoiceData.items || []).map(item => ({
                id: item.id || '',
                description: item.description || '',
                itemDescription: item.itemDescription || '',
                quantity: item.quantity || 1,
                rate: item.rate || 0,
                amount: item.amount || 0,
              })),
              subtotal: invoiceData.subtotal || 0,
              tax: invoiceData.tax || 0,
              discount: invoiceData.discount || 0,
              total: newTotal,
              paidAmount: existingPaidAmount, // PRESERVE existing payments!
              status: newStatus,
              dueDate: invoiceData.dueDate || '',
              notes: invoiceData.notes || '',
              terms: invoiceData.terms || '',
            });
            
            // Flag if there's an overpayment situation
            invoice.hasOverpayment = existingPaidAmount > newTotal;
            invoice.overpaymentAmount = existingPaidAmount > newTotal ? existingPaidAmount - newTotal : 0;
          } else {
            throw error; // Re-throw if we can't find the invoice
          }
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      // If invoice is linked to a sale, update the sale with invoice info
      if (invoiceData.saleId && invoice) {
        console.log('Updating sale with invoice info:', {
          saleId: invoiceData.saleId,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number
        });
        
        await databaseService.updateSale(invoiceData.saleId, {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number
        });
        
        console.log('Sale updated successfully with invoice link');
      }

      console.log('Invoice created successfully:', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        saleId: invoice.saleId || 'none',
        total: invoice.total,
        hasOverpayment: invoice.hasOverpayment || false,
        overpaymentAmount: invoice.overpaymentAmount || 0
      });
      
      return { 
        success: true, 
        data: invoice,
        warning: invoice.hasOverpayment ? 
          `Customer has overpaid by ${invoice.overpaymentAmount}. Please handle the overpayment.` : 
          undefined
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  });

  // Handle overpayment - convert to store credit or mark as refunded
  ipcMain.handle('handle-invoice-overpayment', async (event, payload) => {
    try {
      const { invoiceId, action, overpaymentAmount, customerId } = payload;
      
      console.log('Handling overpayment:', { invoiceId, action, overpaymentAmount, customerId });
      
      const invoice = await databaseService.getInvoiceById(invoiceId);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }
      
      if (action === 'store-credit') {
        // Add overpayment to customer's store credit
        if (!customerId) {
          return { success: false, error: 'Customer ID required for store credit' };
        }
        
        const customer = await databaseService.getCustomerById(customerId);
        if (!customer) {
          return { success: false, error: 'Customer not found' };
        }
        
        const currentCredit = customer.storeCredit || 0;
        const newCredit = currentCredit + overpaymentAmount;
        
        await databaseService.updateCustomer(customerId, {
          storeCredit: newCredit
        });
        
        // Adjust invoice to show full payment (no overpayment)
        await databaseService.updateInvoice(invoiceId, {
          paidAmount: invoice.total,
          status: 'paid'
        });
        
        console.log('Overpayment converted to store credit:', {
          customerId,
          previousCredit: currentCredit,
          newCredit,
          overpaymentAmount
        });
        
        return { 
          success: true, 
          message: `${overpaymentAmount} added to customer store credit. New balance: ${newCredit}`,
          data: { newStoreCredit: newCredit }
        };
        
      } else if (action === 'refunded') {
        // Mark as refunded - adjust invoice paid amount
        await databaseService.updateInvoice(invoiceId, {
          paidAmount: invoice.total,
          status: 'paid'
        });
        
        // Could add a refund transaction log here in the future
        console.log('Overpayment marked as refunded:', { invoiceId, overpaymentAmount });
        
        return { 
          success: true, 
          message: `Overpayment of ${overpaymentAmount} marked as refunded`,
          data: { refundedAmount: overpaymentAmount }
        };
        
      } else if (action === 'keep') {
        // Keep overpayment as is (for future invoices or as credit)
        // No changes needed, just return success
        return { 
          success: true, 
          message: `Overpayment of ${overpaymentAmount} will remain on account`,
          data: { overpaymentAmount }
        };
      }
      
      return { success: false, error: 'Invalid action' };
      
    } catch (error) {
      console.error('Error handling overpayment:', error);
      return { success: false, error: error.message };
    }
  });

  // Apply customer store credit to invoice
  ipcMain.handle('apply-customer-credit', async (event, payload) => {
    try {
      const { invoiceId, customerId, creditAmount } = payload;
      
      console.log('Applying customer credit:', { invoiceId, customerId, creditAmount });
      
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
      
      // Get invoice
      const invoice = await databaseService.getInvoiceById(invoiceId);
      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }
      
      // Calculate new payment amount
      const currentPaid = invoice.paidAmount || 0;
      const remainingBalance = invoice.total - currentPaid;
      const creditToApply = Math.min(creditAmount, remainingBalance);
      const newPaidAmount = currentPaid + creditToApply;
      
      // Calculate new status
      let newStatus = invoice.status;
      if (newPaidAmount >= invoice.total) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'sent';
      }
      
      // Update customer credit
      const newCustomerCredit = availableCredit - creditToApply;
      await databaseService.updateCustomer(customerId, {
        storeCredit: newCustomerCredit
      });
      
      // Update invoice
      const updatedInvoice = await databaseService.updateInvoice(invoiceId, {
        paidAmount: newPaidAmount,
        status: newStatus
      });
      
      console.log('Credit applied successfully:', {
        creditApplied: creditToApply,
        newCustomerCredit,
        newInvoiceStatus: newStatus
      });
      
      return {
        success: true,
        message: `${creditToApply} credit applied successfully`,
        data: {
          creditApplied: creditToApply,
          remainingCredit: newCustomerCredit,
          invoiceBalance: invoice.total - newPaidAmount,
          invoice: updatedInvoice
        }
      };
      
    } catch (error) {
      console.error('Error applying customer credit:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('Invoice handlers registered');
}

module.exports = {
  registerInvoiceHandlers
};
