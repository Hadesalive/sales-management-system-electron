// Service layer exports
import { CustomerService } from './customer.service';
import { ProductService } from './product.service';
import { SalesService } from './sales.service';
import { SettingsService } from './settings.service';
import { OrderService } from './order.service';
import { ReturnService } from './return.service';

// Initialize services
export const customerService = new CustomerService();
export const productService = new ProductService();
export const salesService = new SalesService();
export const settingsService = new SettingsService();
export const orderService = new OrderService();
export const returnService = new ReturnService();

// Export service types
export type { CustomerService, ProductService, SalesService, SettingsService, OrderService, ReturnService };