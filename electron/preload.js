/* eslint-disable @typescript-eslint/no-require-imports */
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Data operations
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  
  // Company settings operations
  getCompanySettings: () => ipcRenderer.invoke('get-company-settings'),
  updateCompanySettings: (settings) => ipcRenderer.invoke('update-company-settings', settings),
  
  // Preferences operations
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  updatePreferences: (preferences) => ipcRenderer.invoke('update-preferences', preferences),
  
  // Customer operations
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  getCustomerById: (id) => ipcRenderer.invoke('get-customer-by-id', id),
  createCustomer: (customerData) => ipcRenderer.invoke('create-customer', customerData),
  updateCustomer: (id, customerData) => ipcRenderer.invoke('update-customer', id, customerData),
  deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),
  searchCustomers: (query) => ipcRenderer.invoke('search-customers', query),
  getCustomerStats: () => ipcRenderer.invoke('get-customer-stats'),
  
  // Product operations
  getProducts: () => ipcRenderer.invoke('get-products'),
  getProductById: (id) => ipcRenderer.invoke('get-product-by-id', id),
  createProduct: (productData) => ipcRenderer.invoke('create-product', productData),
  updateProduct: (id, productData) => ipcRenderer.invoke('update-product', id, productData),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  
  // Sales operations
  getSales: () => {
    console.log('🔧 preload: getSales called');
    console.log('🔧 preload: About to invoke get-sales IPC');
    const result = ipcRenderer.invoke('get-sales');
    console.log('🔧 preload: IPC invoke returned:', typeof result);
    return result;
  },
  
  // TEST: Simple IPC test
  testSalesIpc: () => {
    console.log('🔧 preload: testSalesIpc called');
    return ipcRenderer.invoke('test-sales-ipc');
  },
  getSaleById: (id) => ipcRenderer.invoke('get-sale-by-id', id),
  createSale: (saleData) => ipcRenderer.invoke('create-sale', saleData),
  updateSale: (id, saleData) => ipcRenderer.invoke('update-sale', id, saleData),
  deleteSale: (id) => ipcRenderer.invoke('delete-sale', id),
  
  // Sales utility operations
  generateInvoice: (saleId) => ipcRenderer.invoke('generate-invoice', saleId),
  printReceipt: (saleId) => ipcRenderer.invoke('print-receipt', saleId),
  applyCustomerCreditToSale: (payload) => ipcRenderer.invoke('apply-customer-credit-to-sale', payload),
  
  // Invoice operations
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  getInvoiceById: (id) => ipcRenderer.invoke('get-invoice-by-id', id),
  createInvoice: (invoiceData) => ipcRenderer.invoke('create-invoice', invoiceData),
  updateInvoice: (id, invoiceData) => ipcRenderer.invoke('update-invoice', id, invoiceData),
  deleteInvoice: (id) => ipcRenderer.invoke('delete-invoice', id),
  
  // Invoice template operations
  getInvoiceTemplates: () => ipcRenderer.invoke('get-invoice-templates'),
  getInvoiceTemplate: (id) => ipcRenderer.invoke('get-invoice-template', id),
  createInvoiceTemplate: (templateData) => ipcRenderer.invoke('create-invoice-template', templateData),
  updateInvoiceTemplate: (id, templateData) => ipcRenderer.invoke('update-invoice-template', id, templateData),
  deleteInvoiceTemplate: (id) => ipcRenderer.invoke('delete-invoice-template', id),
  
  // Invoice payment operations
  handleInvoiceOverpayment: (payload) => ipcRenderer.invoke('handle-invoice-overpayment', payload),
  applyCustomerCredit: (payload) => ipcRenderer.invoke('apply-customer-credit', payload),
  
  // Order operations
  getOrders: () => ipcRenderer.invoke('get-orders'),
  getOrderById: (id) => ipcRenderer.invoke('get-order-by-id', id),
  createOrder: (orderData) => ipcRenderer.invoke('create-order', orderData),
  updateOrder: (id, orderData) => ipcRenderer.invoke('update-order', id, orderData),
  deleteOrder: (id) => ipcRenderer.invoke('delete-order', id),
  
  // Return operations
  getReturns: () => ipcRenderer.invoke('get-returns'),
  getReturnById: (id) => ipcRenderer.invoke('get-return-by-id', id),
  createReturn: (returnData) => ipcRenderer.invoke('create-return', returnData),
  updateReturn: (id, returnData) => ipcRenderer.invoke('update-return', id, returnData),
  deleteReturn: (id) => ipcRenderer.invoke('delete-return', id),
  
  // Email operations
  emailInvoice: (emailData) => ipcRenderer.invoke('email-invoice', emailData),
  cleanupTempInvoices: () => ipcRenderer.invoke('cleanup-temp-invoices'),
  
  // PDF operations
  generateInvoicePdfFromHtml: (htmlContent) => ipcRenderer.invoke('generate-invoice-pdf-from-html', htmlContent),
  
  // Menu events
  onMenuNewSale: (callback) => ipcRenderer.on('menu-new-sale', callback),
  onMenuNewCustomer: (callback) => ipcRenderer.on('menu-new-customer', callback),
  onMenuNewProduct: (callback) => ipcRenderer.on('menu-new-product', callback),
  onMenuExportData: (callback) => ipcRenderer.on('menu-export-data', callback),
  onMenuImportData: (callback) => ipcRenderer.on('menu-import-data', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Also expose a general electron object for direct IPC calls (e.g., email-invoice)
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data)
  }
});
