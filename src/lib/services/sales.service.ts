import { BaseService } from './base.service';
import { Sale, SaleItem, Product, SalesData, ApiResponse, PaginatedResponse } from '../types/core';

interface StorageService {
  getData(): SalesData | null;
  addSale(data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale | null>;
  updateSale(id: string, updates: Partial<Sale>): Promise<Sale | null>;
  deleteSale(id: string): Promise<boolean>;
}

export class SalesService extends BaseService {
  getSales() {
    throw new Error('Method not implemented.');
  }
  constructor(private storageService: StorageService) {
    super();
  }

  async getAllSales(): Promise<ApiResponse<Sale[]>> {
    try {
      const data = this.storageService.getData();
      return this.createSuccessResponse(data?.sales || []);
    } catch (error) {
      return this.handleError<Sale[]>(error);
    }
  }

  async getSaleById(id: string): Promise<ApiResponse<Sale | null>> {
    try {
      const data = this.storageService.getData();
      const sale = data?.sales?.find((s: Sale) => s.id === id) || null;
      return this.createSuccessResponse(sale);
    } catch (error) {
      return this.handleError<Sale | null>(error);
    }
  }

  async createSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Sale>> {
    try {
      const errors = this.validateRequired(saleData, ['items', 'total']);
      if (errors.length > 0) {
        return this.createErrorResponse<Sale>(errors.join(', '));
      }

      if (saleData.items.length === 0) {
        return this.createErrorResponse<Sale>('Sale must have at least one item');
      }

      // Validate stock availability
      const stockValidation = await this.validateStockAvailability(saleData.items);
      if (!stockValidation.success) {
        return this.createErrorResponse<Sale>(stockValidation.error!);
      }

      const result = await this.storageService.addSale(saleData);
      if (!result) {
        return this.createErrorResponse<Sale>('Failed to create sale');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Sale>(error);
    }
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<ApiResponse<Sale>> {
    try {
      const result = await this.storageService.updateSale(id, updates);
      if (!result) {
        return this.createErrorResponse<Sale>('Sale not found');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Sale>(error);
    }
  }

  async deleteSale(id: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.storageService.deleteSale(id);
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<boolean>(error);
    }
  }

  async getSalesByStatus(status: Sale['status']): Promise<ApiResponse<Sale[]>> {
    try {
      const data = this.storageService.getData();
      const sales = data?.sales || [];
      const filtered = sales.filter((sale: Sale) => sale.status === status);
      return this.createSuccessResponse(filtered);
    } catch (error) {
      return this.handleError<Sale[]>(error);
    }
  }

  async getRecentSales(limit: number = 10): Promise<ApiResponse<Sale[]>> {
    try {
      const data = this.storageService.getData();
      const sales = data?.sales || [];
      const recent = sales
        .sort((a: Sale, b: Sale) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      
      return this.createSuccessResponse(recent);
    } catch (error) {
      return this.handleError<Sale[]>(error);
    }
  }

  async getSalesPaginated(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Sale>>> {
    try {
      const data = this.storageService.getData();
      const sales = data?.sales || [];
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSales = sales.slice(startIndex, endIndex);

      return this.createSuccessResponse({
        items: paginatedSales,
        total: sales.length,
        page,
        limit,
        hasNext: endIndex < sales.length,
        hasPrev: page > 1,
      });
    } catch (error) {
      return this.handleError<PaginatedResponse<Sale>>(error);
    }
  }

  async searchSales(query: string): Promise<ApiResponse<Sale[]>> {
    try {
      const data = this.storageService.getData();
      const sales = data?.sales || [];
      
      const filtered = sales.filter((sale: Sale) =>
        sale.id.toLowerCase().includes(query.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(query.toLowerCase()) ||
        sale.paymentMethod.toLowerCase().includes(query.toLowerCase())
      );

      return this.createSuccessResponse(filtered);
    } catch (error) {
      return this.handleError<Sale[]>(error);
    }
  }

  private async validateStockAvailability(items: SaleItem[]): Promise<ApiResponse<boolean>> {
    try {
      const data = this.storageService.getData();
      const products = data?.products || [];

      for (const item of items) {
        const product = products.find((p: Product) => p.id === item.productId);
        if (!product) {
          return this.createErrorResponse<boolean>(`Product ${item.productName} not found`);
        }
        if (product.stock < item.quantity) {
          return this.createErrorResponse<boolean>(`Insufficient stock for ${item.productName}. Available: ${product.stock}`);
        }
      }

      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError<boolean>(error);
    }
  }
}