// Service layer exports
import { storageService } from '../../services/storage';
import { CustomerService } from './customer.service';
import { ProductService } from './product.service';
import { SalesService } from './sales.service';
import { SettingsService } from './settings.service';

// Initialize services
export const customerService = new CustomerService(storageService);
export const productService = new ProductService(storageService);
export const salesService = new SalesService(storageService);
export const settingsService = new SettingsService();

// Export service types
export type { CustomerService, ProductService, SalesService, SettingsService };