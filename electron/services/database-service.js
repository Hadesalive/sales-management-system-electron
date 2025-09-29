/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development';

function createPersistentDatabaseService() {
  console.log('Development mode: Using persistent mock database service');
  
  const dataPath = path.join(os.homedir(), '.topnotch-sales-manager', 'data.json');
  
  // Ensure directory exists
  const dataDir = path.dirname(dataPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Load existing data or create default
  let persistentData = {};
  try {
    if (fs.existsSync(dataPath)) {
      persistentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch {
    console.log('Error loading persistent data, starting fresh');
  }
  
  // Initialize default data if not exists
  if (!persistentData.settings) {
    persistentData.settings = {
      companyName: 'TopNotch Electronics',
      address: '',
      phone: '',
      email: '',
      taxRate: 0.15,
      currency: 'USD',
    };
  }
  
  if (!persistentData.preferences) {
    persistentData.preferences = {
      autoSaveDrafts: true,
      confirmBeforeDelete: true,
      showAnimations: true,
      lowStockAlerts: true,
      defaultPaymentMethod: 'cash',
      invoiceNumberFormat: 'INV-{YYYY}-{MM}-{####}',
      receiptFooter: 'Thank you for your business!',
      autoBackup: true,
      backupFrequency: 'daily',
      showProductImages: true,
      defaultInvoiceStatus: 'completed',
      receiptPaperSize: 'A4',
      showTaxBreakdown: true,
      requireCustomerInfo: false,
      autoCalculateTax: true,
      defaultDiscountPercent: 0,
      showProfitMargin: false,
      inventoryTracking: true,
      barcodeScanning: false,
      darkMode: false,
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currencyPosition: 'before',
      decimalPlaces: 2,
      autoLogout: false,
      sessionTimeout: 30,
      printReceipts: true,
      soundEffects: true
    };
  }
  
  if (!persistentData.customers) persistentData.customers = [];
  if (!persistentData.products) persistentData.products = [];
  if (!persistentData.sales) persistentData.sales = [];
  
  return {
    async initialize() {
      console.log('Persistent mock database initialized');
      return Promise.resolve();
    },
    
    close() {
      console.log('Persistent mock database closed');
      // Save data to file
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
        console.log('Data saved to:', dataPath);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    },
    
    async getCompanySettings() {
      return persistentData.settings;
    },
    
    async updateCompanySettings(settings) {
      console.log('Updating persistent settings:', settings);
      persistentData.settings = { ...persistentData.settings, ...settings };
      // Save immediately
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      return persistentData.settings;
    },
    
    async getPreferences() {
      return persistentData.preferences;
    },
    
    async updatePreferences(preferences) {
      console.log('Updating persistent preferences:', preferences);
      persistentData.preferences = { ...persistentData.preferences, ...preferences };
      // Save immediately
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
      return persistentData.preferences;
    },
    
    async exportData() {
      return {
        customers: persistentData.customers || [],
        products: persistentData.products || [],
        sales: persistentData.sales || [],
        settings: persistentData.settings || {
          companyName: 'TopNotch Electronics',
          address: '',
          phone: '',
          email: '',
          taxRate: 0.15,
          currency: 'USD',
        },
        exportedAt: new Date().toISOString(),
      };
    },
    
    async importData(data) {
      console.log('Importing persistent data:', data);
      persistentData.customers = data.customers || [];
      persistentData.products = data.products || [];
      persistentData.sales = data.sales || [];
      persistentData.settings = data.settings || persistentData.settings;
      persistentData.preferences = data.preferences || persistentData.preferences;
      
      // Save immediately
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
      } catch (error) {
        console.error('Error saving imported data:', error);
      }
      return Promise.resolve();
    },
    
    // Customer management methods
    async getCustomers() {
      return persistentData.customers || [];
    },
    
    async getCustomerById(id) {
      const customers = persistentData.customers || [];
      return customers.find(customer => customer.id === id) || null;
    },
    
    async createCustomer(customerData) {
      const customer = {
        id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (!persistentData.customers) {
        persistentData.customers = [];
      }
      persistentData.customers.push(customer);
      
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
      } catch (error) {
        console.error('Error saving customer:', error);
      }
      
      return customer;
    },
    
    async updateCustomer(id, updates) {
      const customers = persistentData.customers || [];
      const customerIndex = customers.findIndex(customer => customer.id === id);
      
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }
      
      customers[customerIndex] = {
        ...customers[customerIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
      } catch (error) {
        console.error('Error updating customer:', error);
      }
      
      return customers[customerIndex];
    },
    
    async deleteCustomer(id) {
      const customers = persistentData.customers || [];
      const customerIndex = customers.findIndex(customer => customer.id === id);
      
      if (customerIndex === -1) {
        throw new Error('Customer not found');
      }
      
      customers.splice(customerIndex, 1);
      
      try {
        fs.writeFileSync(dataPath, JSON.stringify(persistentData, null, 2));
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
      
      return true;
    },
    
    async searchCustomers(query) {
      const customers = persistentData.customers || [];
      const lowercaseQuery = query.toLowerCase();
      
      return customers.filter(customer =>
        customer.name.toLowerCase().includes(lowercaseQuery) ||
        customer.email?.toLowerCase().includes(lowercaseQuery) ||
        customer.phone?.includes(query) ||
        customer.company?.toLowerCase().includes(lowercaseQuery)
      );
    },
    
    async getCustomerStats() {
      const customers = persistentData.customers || [];
      
      return {
        total: customers.length,
        active: customers.filter(c => c.isActive !== false).length,
        inactive: customers.filter(c => c.isActive === false).length,
        withEmail: customers.filter(c => c.email && c.email.trim()).length,
        withPhone: customers.filter(c => c.phone && c.phone.trim()).length
      };
    }
  };
}

function createFallbackDatabaseService() {
  console.log('Fallback mock database service initialized');
  
  return {
    async initialize() {
      console.log('Fallback mock database initialized');
      return Promise.resolve();
    },
    
    close() {
      console.log('Fallback mock database closed');
    },
    
    async getCompanySettings() {
      return {
        companyName: 'TopNotch Electronics',
        address: '',
        phone: '',
        email: '',
        taxRate: 0.15,
        currency: 'USD',
      };
    },
    
    async updateCompanySettings(settings) {
      console.log('Mock update settings:', settings);
      return {
        companyName: settings.companyName || 'TopNotch Electronics',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        taxRate: settings.taxRate || 0.15,
        currency: settings.currency || 'USD',
      };
    },
    
    async getPreferences() {
      return {
        autoSaveDrafts: true,
        confirmBeforeDelete: true,
        showAnimations: true,
        lowStockAlerts: true,
        defaultPaymentMethod: 'cash',
        invoiceNumberFormat: 'INV-{YYYY}-{MM}-{####}',
        receiptFooter: 'Thank you for your business!',
        autoBackup: true,
        backupFrequency: 'daily',
        showProductImages: true,
        defaultInvoiceStatus: 'completed',
        receiptPaperSize: 'A4',
        showTaxBreakdown: true,
        requireCustomerInfo: false,
        autoCalculateTax: true,
        defaultDiscountPercent: 0,
        showProfitMargin: false,
        inventoryTracking: true,
        barcodeScanning: false,
        darkMode: false,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currencyPosition: 'before',
        decimalPlaces: 2,
        autoLogout: false,
        sessionTimeout: 30,
        printReceipts: true,
        soundEffects: true
      };
    },
    
    async updatePreferences(preferences) {
      console.log('Mock update preferences:', preferences);
      return preferences;
    },
    
    async exportData() {
      return {
        customers: [],
        products: [],
        sales: [],
        settings: {
          companyName: 'TopNotch Electronics',
          address: '',
          phone: '',
          email: '',
          taxRate: 0.15,
          currency: 'USD',
        },
        exportedAt: new Date().toISOString(),
      };
    },
    
    async importData(data) {
      console.log('Mock import data:', data);
      return Promise.resolve();
    }
  };
}

function initializeDatabaseService() {
  try {
    if (isDev) {
      return createPersistentDatabaseService();
    } else {
      // Try production build path
      return require('../../out/server/lib/database/database.js').databaseService;
    }
  } catch {
    console.log('Production database module not found, using development fallback');
    return createFallbackDatabaseService();
  }
}

module.exports = {
  initializeDatabaseService
};
