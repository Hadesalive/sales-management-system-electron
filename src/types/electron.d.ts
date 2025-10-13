import { CompanySettings, Customer } from '@/lib/types/core';

export interface Preferences {
  onboardingCompleted: boolean;
  autoSaveDrafts: boolean;
  confirmBeforeDelete: boolean;
  showAnimations: boolean;
  lowStockAlerts: boolean;
  defaultPaymentMethod: string;
  invoiceNumberFormat: string;
  receiptFooter: string;
  autoBackup: boolean;
  backupFrequency: string;
  showProductImages: boolean;
  defaultInvoiceStatus: string;
  receiptPaperSize: string;
  showTaxBreakdown: boolean;
  requireCustomerInfo: boolean;
  autoCalculateTax: boolean;
  defaultDiscountPercent: number;
  showProfitMargin: boolean;
  inventoryTracking: boolean;
  barcodeScanning: boolean;
  darkMode: boolean;
  language: string;
  dateFormat: string;
  timeFormat: string;
  currencyPosition: string;
  decimalPlaces: number;
  autoLogout: boolean;
  sessionTimeout: number;
  printReceipts: boolean;
  soundEffects: boolean;
}

export interface ElectronAPI {
  // Data operations
  saveData: (data: unknown) => Promise<{ success: boolean; error?: string }>;
  loadData: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  exportData: () => Promise<{ success: boolean; path?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  
  // Company settings operations
  getCompanySettings: () => Promise<{ success: boolean; data?: CompanySettings; error?: string }>;
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<{ success: boolean; data?: CompanySettings; error?: string }>;
  
  // Preferences operations
  getPreferences: () => Promise<{ success: boolean; data?: Preferences; error?: string }>;
  updatePreferences: (preferences: Partial<Preferences>) => Promise<{ success: boolean; data?: Preferences; error?: string }>;
  
  // Customer operations
  getCustomers: () => Promise<{ success: boolean; data?: Customer[]; error?: string }>;
  getCustomerById: (id: string) => Promise<{ success: boolean; data?: Customer; error?: string }>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; data?: Customer; error?: string }>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<{ success: boolean; data?: Customer; error?: string }>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; error?: string }>;
  searchCustomers: (query: string) => Promise<{ success: boolean; data?: Customer[]; error?: string }>;
  getCustomerStats: () => Promise<{ success: boolean; data?: { total: number; active: number; inactive: number; withEmail: number; withPhone: number }; error?: string }>;
  
  // Menu events
  onMenuNewSale: (callback: (event: unknown) => void) => void;
  onMenuNewCustomer: (callback: (event: unknown) => void) => void;
  onMenuNewProduct: (callback: (event: unknown) => void) => void;
  onMenuExportData: (callback: (event: unknown) => void) => void;
  onMenuImportData: (callback: (event: unknown) => void) => void;
  
  // Remove listeners
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron?: {
      ipcRenderer: {
        invoke: (channel: string, data?: unknown) => Promise<unknown>;
        send: (channel: string, data?: unknown) => void;
      };
    };
  }
}
