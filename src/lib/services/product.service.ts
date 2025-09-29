import { BaseService } from './base.service';
import { Product, SalesData, ApiResponse, PaginatedResponse } from '../types/core';

interface StorageService {
  getData(): SalesData | null;
  addProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
}

export class ProductService extends BaseService {
  constructor(private storageService: StorageService) {
    super();
  }

  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const data = this.storageService.getData();
      return this.createSuccessResponse(data?.products || []);
    } catch (error) {
      return this.handleError<Product[]>(error);
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product | null>> {
    try {
      const data = this.storageService.getData();
      const product = data?.products?.find((p: Product) => p.id === id) || null;
      return this.createSuccessResponse(product);
    } catch (error) {
      return this.handleError<Product | null>(error);
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    try {
      const errors = this.validateRequired(productData, ['name', 'price']);
      if (errors.length > 0) {
        return this.createErrorResponse<Product>(errors.join(', '));
      }

      if (productData.price <= 0) {
        return this.createErrorResponse<Product>('Price must be greater than 0');
      }

      const result = await this.storageService.addProduct(productData);
      if (!result) {
        return this.createErrorResponse<Product>('Failed to create product');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Product>(error);
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const result = await this.storageService.updateProduct(id, updates);
      if (!result) {
        return this.createErrorResponse<Product>('Product not found');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Product>(error);
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<boolean>> {
    try {
      const result = await this.storageService.deleteProduct(id);
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<boolean>(error);
    }
  }

  async getLowStockProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const data = this.storageService.getData();
      const products = data?.products || [];
      
      const lowStock = products.filter((product: Product) => 
        product.minStock && product.stock <= product.minStock
      );

      return this.createSuccessResponse(lowStock);
    } catch (error) {
      return this.handleError<Product[]>(error);
    }
  }

  async updateStock(productId: string, newStock: number): Promise<ApiResponse<Product>> {
    try {
      if (newStock < 0) {
        return this.createErrorResponse<Product>('Stock cannot be negative');
      }

      const result = await this.storageService.updateProduct(productId, { stock: newStock });
      if (!result) {
        return this.createErrorResponse<Product>('Product not found');
      }

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError<Product>(error);
    }
  }

  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const data = this.storageService.getData();
      const products = data?.products || [];
      
      const filtered = products.filter((product: Product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );

      return this.createSuccessResponse(filtered);
    } catch (error) {
      return this.handleError<Product[]>(error);
    }
  }

  async getProductsPaginated(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const data = this.storageService.getData();
      const products = data?.products || [];
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      return this.createSuccessResponse({
        items: paginatedProducts,
        total: products.length,
        page,
        limit,
        hasNext: endIndex < products.length,
        hasPrev: page > 1,
      });
    } catch (error) {
      return this.handleError<PaginatedResponse<Product>>(error);
    }
  }
}