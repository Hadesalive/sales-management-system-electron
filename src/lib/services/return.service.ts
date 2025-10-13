import { Return, ApiResponse } from '@/lib/types/core';

export class ReturnService {
  // Get all returns
  async getAllReturns(): Promise<ApiResponse<Return[]>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('get-returns');
        return {
          success: result.success,
          data: result.data || [],
          error: result.error
        };
      }
      return { success: false, error: 'Electron IPC not available', data: [] };
    } catch (error) {
      console.error('Error getting returns:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get returns',
        data: []
      };
    }
  }

  // Get return by ID
  async getReturnById(id: string): Promise<ApiResponse<Return | null>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('get-return-by-id', id);
        return {
          success: result.success,
          data: result.data || null,
          error: result.error
        };
      }
      return { success: false, error: 'Electron IPC not available', data: null };
    } catch (error) {
      console.error('Error getting return:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get return',
        data: null
      };
    }
  }

  // Create new return
  async createReturn(returnData: Omit<Return, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Return>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('create-return', returnData);
        return {
          success: result.success,
          data: result.data,
          error: result.error
        };
      }
      return { success: false, error: 'Electron IPC not available' };
    } catch (error) {
      console.error('Error creating return:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create return'
      };
    }
  }

  // Update return
  async updateReturn(id: string, updates: Partial<Omit<Return, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Return>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('update-return', { id, updates });
        return {
          success: result.success,
          data: result.data,
          error: result.error
        };
      }
      return { success: false, error: 'Electron IPC not available' };
    } catch (error) {
      console.error('Error updating return:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update return'
      };
    }
  }

  // Delete return
  async deleteReturn(id: string): Promise<ApiResponse<void>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
        const result = await window.electron.ipcRenderer.invoke('delete-return', id);
        return {
          success: result.success,
          error: result.error
        };
      }
      return { success: false, error: 'Electron IPC not available' };
    } catch (error) {
      console.error('Error deleting return:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete return'
      };
    }
  }

  // Get returns by status
  async getReturnsByStatus(status: Return['status']): Promise<ApiResponse<Return[]>> {
    const result = await this.getAllReturns();
    if (result.success && result.data) {
      const filtered = result.data.filter(returnItem => returnItem.status === status);
      return { success: true, data: filtered };
    }
    return result;
  }

  // Get returns by sale
  async getReturnsBySale(saleId: string): Promise<ApiResponse<Return[]>> {
    const result = await this.getAllReturns();
    if (result.success && result.data) {
      const filtered = result.data.filter(returnItem => returnItem.saleId === saleId);
      return { success: true, data: filtered };
    }
    return result;
  }

  // Get returns by customer
  async getReturnsByCustomer(customerId: string): Promise<ApiResponse<Return[]>> {
    const result = await this.getAllReturns();
    if (result.success && result.data) {
      const filtered = result.data.filter(returnItem => returnItem.customerId === customerId);
      return { success: true, data: filtered };
    }
    return result;
  }

  // Search returns
  async searchReturns(searchTerm: string): Promise<ApiResponse<Return[]>> {
    const result = await this.getAllReturns();
    if (result.success && result.data) {
      const term = searchTerm.toLowerCase();
      const filtered = result.data.filter(
        returnItem =>
          returnItem.returnNumber.toLowerCase().includes(term) ||
          returnItem.customerName?.toLowerCase().includes(term) ||
          returnItem.notes?.toLowerCase().includes(term)
      );
      return { success: true, data: filtered };
    }
    return result;
  }
}

// Export singleton instance
export const returnService = new ReturnService();

