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
  
  // Menu events
  onMenuNewSale: (callback) => ipcRenderer.on('menu-new-sale', callback),
  onMenuNewCustomer: (callback) => ipcRenderer.on('menu-new-customer', callback),
  onMenuNewProduct: (callback) => ipcRenderer.on('menu-new-product', callback),
  onMenuExportData: (callback) => ipcRenderer.on('menu-export-data', callback),
  onMenuImportData: (callback) => ipcRenderer.on('menu-import-data', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
