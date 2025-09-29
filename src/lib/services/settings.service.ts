import { BaseService } from './base.service';
import { CompanySettings, ApiResponse } from '../types/core';

// Define preferences type
interface Preferences {
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

interface ElectronAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class SettingsService extends BaseService {
  constructor() {
    super();
  }

  async getCompanySettings(): Promise<ApiResponse<CompanySettings>> {
    try {
      // Debug logging
      console.log('getCompanySettings called');
      console.log('window exists:', typeof window !== 'undefined');
      console.log('electronAPI exists:', !!(typeof window !== 'undefined' && window.electronAPI));
      
      // Call the Electron main process to get settings from database
      if (typeof window !== 'undefined' && window.electronAPI) {
        const electronAPI = window.electronAPI as Record<string, unknown>;
        console.log('Available methods:', Object.keys(electronAPI));
        
        // Try the new method first
        if ('getCompanySettings' in electronAPI && typeof electronAPI.getCompanySettings === 'function') {
          console.log('Using getCompanySettings method');
          const result = await (electronAPI.getCompanySettings as () => Promise<ElectronAPIResponse<CompanySettings>>)();
          if (result.success && result.data) {
            return this.createSuccessResponse(result.data);
          } else {
            return this.createErrorResponse<CompanySettings>(result.error || 'Failed to get company settings');
          }
        }
        
        // Fallback to loadData method (legacy)
        if ('loadData' in electronAPI && typeof electronAPI.loadData === 'function') {
          console.log('Using loadData fallback method');
          const result = await (electronAPI.loadData as () => Promise<ElectronAPIResponse<{ settings?: CompanySettings }>>)();
          if (result.success && result.data?.settings) {
            return this.createSuccessResponse(result.data.settings);
          }
        }
      }
      
      // Fallback for development or when Electron is not available
      console.log('Using default settings fallback');
      const defaultSettings: CompanySettings = {
        companyName: 'TopNotch Electronics',
        address: '',
        phone: '',
        email: '',
        taxRate: 0.15,
        currency: 'USD',
      };
      return this.createSuccessResponse(defaultSettings);
    } catch (error) {
      console.error('Error in getCompanySettings:', error);
      return this.handleError<CompanySettings>(error);
    }
  }

  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<ApiResponse<CompanySettings>> {
    try {
      // Debug logging
      console.log('updateCompanySettings called with:', settings);
      console.log('window exists:', typeof window !== 'undefined');
      console.log('electronAPI exists:', !!(typeof window !== 'undefined' && window.electronAPI));
      
      // Call the Electron main process to update settings in database
      if (typeof window !== 'undefined' && window.electronAPI) {
        const electronAPI = window.electronAPI as Record<string, unknown>;
        console.log('Available methods:', Object.keys(electronAPI));
        
        // Try the new method first
        if ('updateCompanySettings' in electronAPI && typeof electronAPI.updateCompanySettings === 'function') {
          console.log('Using updateCompanySettings method');
          const result = await (electronAPI.updateCompanySettings as (settings: Partial<CompanySettings>) => Promise<ElectronAPIResponse<CompanySettings>>)(settings);
          if (result.success && result.data) {
            return this.createSuccessResponse(result.data);
          } else {
            return this.createErrorResponse<CompanySettings>(result.error || 'Failed to update company settings');
          }
        }
        
        // Fallback to saveData method (legacy)
        if ('saveData' in electronAPI && typeof electronAPI.saveData === 'function') {
          console.log('Using saveData fallback method');
          // Load current data first
          const loadResult = await (electronAPI.loadData as () => Promise<ElectronAPIResponse<{ settings?: CompanySettings }>>)();
          if (loadResult.success && loadResult.data) {
            const updatedData = {
              ...loadResult.data,
              settings: { ...loadResult.data.settings, ...settings }
            };
            const saveResult = await (electronAPI.saveData as (data: unknown) => Promise<ElectronAPIResponse<unknown>>)(updatedData);
            if (saveResult.success) {
              // Return the updated settings
              return this.createSuccessResponse({ ...loadResult.data.settings, ...settings } as CompanySettings);
            }
          }
        }
      }
      
      // Fallback for development
      console.log('Electron API not available, using mock response');
      return this.createErrorResponse<CompanySettings>('Electron API not available - please run in Electron app');
    } catch (error) {
      console.error('Error in updateCompanySettings:', error);
      return this.handleError<CompanySettings>(error);
    }
  }

  async exportData(): Promise<ApiResponse<{ success: boolean; path?: string; error?: string }>> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.exportData();
        return this.createSuccessResponse(result);
      } else {
        return this.createErrorResponse('Electron API not available');
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async importData(): Promise<ApiResponse<{ success: boolean; data?: unknown; error?: string }>> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.importData();
        return this.createSuccessResponse(result);
      } else {
        return this.createErrorResponse('Electron API not available');
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPreferences(): Promise<ApiResponse<Preferences>> {
    try {
      console.log('getPreferences called');
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        const electronAPI = window.electronAPI as Record<string, unknown>;
        
        if ('getPreferences' in electronAPI && typeof electronAPI.getPreferences === 'function') {
          console.log('Using getPreferences method');
          const result = await (electronAPI.getPreferences as () => Promise<ElectronAPIResponse<Preferences>>)();
          if (result.success && result.data) {
            return this.createSuccessResponse(result.data);
          } else {
            return this.createErrorResponse<Preferences>(result.error || 'Failed to get preferences');
          }
        }
      }
      
      // Fallback for development
      console.log('Using default preferences fallback');
      const defaultPreferences: Preferences = {
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
      return this.createSuccessResponse(defaultPreferences);
    } catch (error) {
      console.error('Error in getPreferences:', error);
      return this.handleError<Preferences>(error);
    }
  }

  async updatePreferences(preferences: Partial<Preferences>): Promise<ApiResponse<Preferences>> {
    try {
      console.log('updatePreferences called with:', preferences);
      
      if (typeof window !== 'undefined' && window.electronAPI) {
        const electronAPI = window.electronAPI as Record<string, unknown>;
        
        if ('updatePreferences' in electronAPI && typeof electronAPI.updatePreferences === 'function') {
          console.log('Using updatePreferences method');
          const result = await (electronAPI.updatePreferences as (preferences: Partial<Preferences>) => Promise<ElectronAPIResponse<Preferences>>)(preferences);
          if (result.success && result.data) {
            return this.createSuccessResponse(result.data);
          } else {
            return this.createErrorResponse<Preferences>(result.error || 'Failed to update preferences');
          }
        }
      }
      
      // Fallback for development
      console.log('Electron API not available, using mock response');
      return this.createErrorResponse<Preferences>('Electron API not available - please run in Electron app');
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return this.handleError<Preferences>(error);
    }
  }
}
