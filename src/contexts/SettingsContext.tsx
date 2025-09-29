'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CompanySettings } from '@/lib/types/core';
import { settingsService } from '@/lib/services';

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

interface SettingsContextType {
  // Company Settings
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
  
  // Preferences
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  
  // Utility Functions
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  getCurrencySymbol: () => string;
  
  // Loading States
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshSettings: () => Promise<void>;
  
  // Invoice numbering
  generateInvoiceNumber: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    taxRate: 0.15,
    currency: 'USD',
  });
  
  const [preferences, setPreferences] = useState<Preferences>({
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
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from database
  const refreshSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load company settings
      const companyResponse = await settingsService.getCompanySettings();
      if (companyResponse.success && companyResponse.data) {
        setCompanySettings(companyResponse.data);
      }
      
      // Load preferences
      const preferencesResponse = await settingsService.getPreferences();
      if (preferencesResponse.success && preferencesResponse.data) {
        setPreferences(preferencesResponse.data as Preferences);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    refreshSettings();
  }, []);

  // Currency formatting function
  const formatCurrency = (amount: number): string => {
    const decimalPlaces = preferences.decimalPlaces || 2;
    
    // Get currency symbol based on position preference
    const symbol = getCurrencySymbol();
    const position = preferences.currencyPosition || 'before';
    
    // Format the number
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(amount);
    
    // Apply currency position
    if (position === 'after') {
      return `${formattedNumber} ${symbol}`;
    } else {
      return `${symbol}${formattedNumber}`;
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    const currencyMap: Record<string, string> = {
      'NLE': 'Le',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'BRL': 'R$'
    };
    
    return currencyMap[companySettings.currency || 'USD'] || '$';
  };

  // Date formatting function
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const format = preferences.dateFormat || 'MM/DD/YYYY';
    
    // Convert format to Intl.DateTimeFormat options
    const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
      'MM/DD/YYYY': { month: '2-digit', day: '2-digit', year: 'numeric' },
      'DD/MM/YYYY': { day: '2-digit', month: '2-digit', year: 'numeric' },
      'YYYY-MM-DD': { year: 'numeric', month: '2-digit', day: '2-digit' },
      'DD-MM-YYYY': { day: '2-digit', month: '2-digit', year: 'numeric' }
    };
    
    const options = formatMap[format] || formatMap['MM/DD/YYYY'];
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };

  // DateTime formatting function
  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const timeFormat = preferences.timeFormat || '12h';
    
    const dateStr = formatDate(dateObj);
    
    const timeOptions: Intl.DateTimeFormatOptions = timeFormat === '24h' 
      ? { hour: '2-digit', minute: '2-digit', hour12: false }
      : { hour: 'numeric', minute: '2-digit', hour12: true };
    
    const timeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(dateObj);
    
    return `${dateStr} ${timeStr}`;
  };

  // Generate invoice number based on user's format preference
  const generateInvoiceNumber = (): string => {
    const format = preferences.invoiceNumberFormat || 'INV-{YYYY}-{MM}-{####}';
    const now = new Date();
    
    // Replace placeholders with actual values
    const invoiceNumber = format
      .replace('{YYYY}', now.getFullYear().toString())
      .replace('{MM}', String(now.getMonth() + 1).padStart(2, '0'))
      .replace('{DD}', String(now.getDate()).padStart(2, '0'))
      .replace('{####}', String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0'));
    
    return invoiceNumber;
  };

  const contextValue: SettingsContextType = {
    companySettings,
    setCompanySettings,
    preferences,
    setPreferences,
    formatCurrency,
    formatDate,
    formatDateTime,
    getCurrencySymbol,
    loading,
    error,
    refreshSettings,
    generateInvoiceNumber
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
