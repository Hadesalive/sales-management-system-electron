import { BaseService } from './base.service';
import { Customer, SalesData, ApiResponse, PaginatedResponse } from '../types/core';

interface StorageService {
  getData(): SalesData | null;
  addCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null>;
  deleteCustomer(id: string): Promise<boolean>;
}

export class CustomerService extends BaseService {
  constructor(private storageService: StorageService) {
    super();
  }

  async getAllCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const data = this.storageService.getData();
      return this.createSuccessResponse(data?.customers || []);
    } catch (error) {
      return this.handleError<Customer[]>(error);
    }
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer | null>> {
    try {
      const data = this.storageService.getData();
      const customer = data?.customers?.find((c: Customer) => c.id === id) || null;
      return this.createSuccessResponse(customer);
    } catch (error) {
      return this.handleError<Customer | null>(error);
    }
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Customer>> {
    try {
      // Validate required fields
      const errors = this.validateRequired(customerData, ['name']);
      if (errors.length > 0) {
        return this.createErrorResponse<Customer>(errors.join(', '));
      }

      const result = await this.storageService.addCustomer(customerData);
      if (!result) {
        return this.createErrorResponse<Customer>('Failed to create customer');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Customer>(error);
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      const result = await this.storageService.updateCustomer(id, updates);
      if (!result) {
        return this.createErrorResponse<Customer>('Customer not found');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Customer>(error);
    }
  }

  async deleteCustomer(id: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.storageService.deleteCustomer(id);
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<boolean>(error);
    }
  }

  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    try {
      const data = this.storageService.getData();
      const customers = data?.customers || [];
      
      const filtered = customers.filter((customer: Customer) =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email?.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone?.includes(query)
      );

      return this.createSuccessResponse(filtered);
    } catch (error) {
      return this.handleError<Customer[]>(error);
    }
  }

  async getCustomersPaginated(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    try {
      const data = this.storageService.getData();
      const customers = data?.customers || [];
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCustomers = customers.slice(startIndex, endIndex);

      return this.createSuccessResponse({
        items: paginatedCustomers,
        total: customers.length,
        page,
        limit,
        hasNext: endIndex < customers.length,
        hasPrev: page > 1,
      });
    } catch (error) {
      return this.handleError<PaginatedResponse<Customer>>(error);
    }
  }

  async exportCustomers(): Promise<ApiResponse<{ path: string; count: number }>> {
    try {
      // Use Electron API for file export
      if (typeof window !== 'undefined' && window.electronAPI) {
        const response = await window.electronAPI.exportData();
        if (response.success && response.path) {
          const data = this.storageService.getData();
          const customerCount = data?.customers?.length || 0;
          return this.createSuccessResponse({
            path: response.path,
            count: customerCount
          });
        }
      }
      
      return this.createErrorResponse('Export functionality not available');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async importCustomers(): Promise<ApiResponse<{ importedCount: number; totalCount: number }>> {
    try {
      // Use Electron API for file import
      if (typeof window !== 'undefined' && window.electronAPI) {
        const response = await window.electronAPI.importData();
        if (response.success) {
          const data = this.storageService.getData();
          const importedCount = response.data?.customers?.length || 0;
          const totalCount = data?.customers?.length || 0;
          
          return this.createSuccessResponse({
            importedCount,
            totalCount
          });
        }
      }
      
      return this.createErrorResponse('Import functionality not available');
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getActiveCustomers(): Promise<ApiResponse<Customer[]>> {
    try {
      const data = this.storageService.getData();
      const customers = data?.customers || [];
      
      const activeCustomers = customers.filter((customer: Customer) => 
        customer.isActive !== false // Default to active if not specified
      );

      return this.createSuccessResponse(activeCustomers);
    } catch (error) {
      return this.handleError<Customer[]>(error);
    }
  }

  async getCustomerStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    withEmail: number;
    withPhone: number;
  }>> {
    try {
      const data = this.storageService.getData();
      const customers = data?.customers || [];
      
      const stats = {
        total: customers.length,
        active: customers.filter((c: Customer) => c.isActive !== false).length,
        inactive: customers.filter((c: Customer) => c.isActive === false).length,
        withEmail: customers.filter((c: Customer) => c.email && c.email.trim()).length,
        withPhone: customers.filter((c: Customer) => c.phone && c.phone.trim()).length,
      };

      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.handleError(error);
    }
  }
}