import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import {
  Customer,
  Product,
  Sale,
  SaleItem,
  CompanySettings,
  DatabaseCustomer,
  DatabaseProduct,
  DatabaseSale,
} from './schema';

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    // Set up database path for Electron
    if (typeof window === 'undefined' && process.versions.electron) {
      this.dbPath = path.join(app.getPath('userData'), 'topnotch-sales.db');
    } else {
      // Fallback for development
      this.dbPath = path.join(process.cwd(), 'topnotch-sales.db');
    }
  }

  async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
      await this.createTables();
      await this.seedDefaultData();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Customers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL CHECK (price > 0),
        cost REAL CHECK (cost > 0),
        sku TEXT,
        category TEXT,
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        min_stock INTEGER CHECK (min_stock >= 0),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sales table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
        customer_name TEXT,
        items TEXT NOT NULL, -- JSON array of items
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        tax REAL NOT NULL CHECK (tax >= 0),
        discount REAL NOT NULL CHECK (discount >= 0),
        total REAL NOT NULL CHECK (total >= 0),
        status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'other')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Company settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        company_name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        tax_rate REAL NOT NULL DEFAULT 0.15 CHECK (tax_rate >= 0 AND tax_rate <= 1),
        currency TEXT NOT NULL DEFAULT 'USD',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT single_row CHECK (id = 1)
      )
    `);

    // Create triggers for updated_at
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_customers_timestamp 
      AFTER UPDATE ON customers 
      BEGIN 
        UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
      AFTER UPDATE ON products 
      BEGIN 
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_sales_timestamp 
      AFTER UPDATE ON sales 
      BEGIN 
        UPDATE sales SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);
  }

  private async seedDefaultData(): Promise<void> {
    if (!this.db) return;

    // Check if settings exist
    const settings = this.db.prepare('SELECT COUNT(*) as count FROM company_settings').get() as { count: number };
    
    if (settings.count === 0) {
      this.db.prepare(`
        INSERT INTO company_settings (company_name, address, phone, email, tax_rate, currency)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'TopNotch Electronics',
        '',
        '',
        '',
        0.15,
        'USD'
      );
    }
  }

  // Customer operations
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO customers (name, email, phone, address)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(data.name, data.email || null, data.phone || null, data.address || null);
    const customer = await this.getCustomerById(result.lastInsertRowid?.toString() || '');
    
    if (!customer) throw new Error('Failed to create customer');
    return customer;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as DatabaseCustomer | undefined;
    if (!row) return null;

    return this.mapDatabaseCustomerToCustomer(row);
  }

  async getAllCustomers(): Promise<Customer[]> {
    if (!this.db) return [];

    const rows = this.db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all() as DatabaseCustomer[];
    return rows.map(this.mapDatabaseCustomerToCustomer);
  }

  async updateCustomer(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Customer | null> {
    if (!this.db) return null;

    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    if (fields.length === 0) return this.getCustomerById(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => data[field as keyof typeof data]);

    this.db.prepare(`UPDATE customers SET ${setClause} WHERE id = ?`).run(...values, id);
    return this.getCustomerById(id);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    if (!this.db) return false;

    const result = this.db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Product operations
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO products (name, description, price, cost, sku, category, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.description || null,
      data.price,
      data.cost || null,
      data.sku || null,
      data.category || null,
      data.stock,
      data.minStock || null
    );

    const product = await this.getProductById(result.lastInsertRowid?.toString() || '');
    if (!product) throw new Error('Failed to create product');
    return product;
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id) as DatabaseProduct | undefined;
    if (!row) return null;

    return this.mapDatabaseProductToProduct(row);
  }

  async getAllProducts(): Promise<Product[]> {
    if (!this.db) return [];

    const rows = this.db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as DatabaseProduct[];
    return rows.map(this.mapDatabaseProductToProduct);
  }

  async updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | null> {
    if (!this.db) return null;

    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    if (fields.length === 0) return this.getProductById(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => data[field as keyof typeof data]);

    this.db.prepare(`UPDATE products SET ${setClause} WHERE id = ?`).run(...values, id);
    return this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!this.db) return false;

    const result = this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Sale operations
  async createSale(data: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> {
    if (!this.db) throw new Error('Database not initialized');

    // Start transaction
    const transaction = this.db.transaction(() => {
      // Insert sale
      const stmt = this.db!.prepare(`
        INSERT INTO sales (customer_id, customer_name, items, subtotal, tax, discount, total, status, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.customerId || null,
        data.customerName || null,
        JSON.stringify(data.items),
        data.subtotal,
        data.tax,
        data.discount,
        data.total,
        data.status,
        data.paymentMethod,
        data.notes || null
      );

      const saleId = result.lastInsertRowid?.toString() || '';

      // Update product stock
      for (const item of data.items) {
        this.db!.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
          .run(item.quantity, item.productId);
      }

      return saleId;
    });

    const saleId = transaction();
    const sale = await this.getSaleById(saleId);
    if (!sale) throw new Error('Failed to create sale');
    return sale;
  }

  async getSaleById(id: string): Promise<Sale | null> {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as DatabaseSale | undefined;
    if (!row) return null;

    return this.mapDatabaseSaleToSale(row);
  }

  async getAllSales(): Promise<Sale[]> {
    if (!this.db) return [];

    const rows = this.db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all() as DatabaseSale[];
    return rows.map(this.mapDatabaseSaleToSale);
  }

  async updateSale(id: string, data: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Sale | null> {
    if (!this.db) return null;

    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    if (fields.length === 0) return this.getSaleById(id);

    const setClause = fields.map(field => `${field === 'items' ? 'items' : field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = data[field as keyof typeof data];
      return field === 'items' ? JSON.stringify(value) : value;
    });

    this.db.prepare(`UPDATE sales SET ${setClause} WHERE id = ?`).run(...values, id);
    return this.getSaleById(id);
  }

  async deleteSale(id: string): Promise<boolean> {
    if (!this.db) return false;

    const transaction = this.db.transaction(() => {
      // Get sale to restore stock
      const sale = this.db!.prepare('SELECT items FROM sales WHERE id = ?').get(id) as { items: string } | undefined;
      
      if (sale) {
        const items: SaleItem[] = JSON.parse(sale.items);
        for (const item of items) {
          this.db!.prepare('UPDATE products SET stock = stock + ? WHERE id = ?')
            .run(item.quantity, item.productId);
        }
      }

      // Delete sale
      const result = this.db!.prepare('DELETE FROM sales WHERE id = ?').run(id);
      return result.changes > 0;
    });

    return transaction();
  }

  // Company settings operations
  async getCompanySettings(): Promise<CompanySettings> {
    if (!this.db) throw new Error('Database not initialized');

    const row = this.db.prepare('SELECT * FROM company_settings WHERE id = 1').get() as {
      company_name: string;
      address: string | null;
      phone: string | null;
      email: string | null;
      tax_rate: number;
      currency: string;
    };
    if (!row) throw new Error('Company settings not found');

    return {
      companyName: row.company_name,
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      taxRate: row.tax_rate,
      currency: row.currency,
    };
  }

  async updateCompanySettings(data: Partial<CompanySettings>): Promise<CompanySettings> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    if (fields.length === 0) return this.getCompanySettings();

    const setClause = fields.map(field => `${field === 'companyName' ? 'company_name' : field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = data[field as keyof typeof data];
      return field === 'companyName' ? value : value;
    });

    this.db.prepare(`UPDATE company_settings SET ${setClause} WHERE id = 1`).run(...values);
    return this.getCompanySettings();
  }

  // Helper methods for mapping database rows to types
  private mapDatabaseCustomerToCustomer(row: DatabaseCustomer): Customer {
    return {
      id: row.id!,
      name: row.name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      address: row.address || undefined,
      createdAt: row.created_at!,
      updatedAt: row.updated_at!,
    };
  }

  private mapDatabaseProductToProduct(row: DatabaseProduct): Product {
    return {
      id: row.id!,
      name: row.name,
      description: row.description || undefined,
      price: row.price,
      cost: row.cost || undefined,
      sku: row.sku || undefined,
      category: row.category || undefined,
      stock: row.stock,
      minStock: row.min_stock || undefined,
      createdAt: row.created_at!,
      updatedAt: row.updated_at!,
    };
  }

  private mapDatabaseSaleToSale(row: DatabaseSale): Sale {
    return {
      id: row.id!,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name || undefined,
      items: JSON.parse(row.items || '[]'),
      subtotal: row.subtotal,
      tax: row.tax,
      discount: row.discount,
      total: row.total,
      status: row.status as Sale['status'],
      paymentMethod: row.payment_method as Sale['paymentMethod'],
      notes: row.notes || undefined,
      createdAt: row.created_at!,
      updatedAt: row.updated_at!,
    };
  }

  // Utility methods
  async exportData(): Promise<{
    customers: Customer[];
    products: Product[];
    sales: Sale[];
    settings: CompanySettings;
    exportedAt: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const customers = await this.getAllCustomers();
    const products = await this.getAllProducts();
    const sales = await this.getAllSales();
    const settings = await this.getCompanySettings();

    return {
      customers,
      products,
      sales,
      settings,
      exportedAt: new Date().toISOString(),
    };
  }

  async importData(data: {
    customers?: Customer[];
    products?: Product[];
    sales?: Sale[];
    settings?: CompanySettings;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(() => {
      // Clear existing data
      this.db!.exec('DELETE FROM sales');
      this.db!.exec('DELETE FROM products');
      this.db!.exec('DELETE FROM customers');
      this.db!.exec('DELETE FROM company_settings');

      // Import customers
      for (const customer of data.customers || []) {
        this.db!.prepare(`
          INSERT INTO customers (id, name, email, phone, address, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          customer.id,
          customer.name,
          customer.email || null,
          customer.phone || null,
          customer.address || null,
          customer.createdAt,
          customer.updatedAt
        );
      }

      // Import products
      for (const product of data.products || []) {
        this.db!.prepare(`
          INSERT INTO products (id, name, description, price, cost, sku, category, stock, min_stock, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          product.id,
          product.name,
          product.description || null,
          product.price,
          product.cost || null,
          product.sku || null,
          product.category || null,
          product.stock,
          product.minStock || null,
          product.createdAt,
          product.updatedAt
        );
      }

      // Import sales
      for (const sale of data.sales || []) {
        this.db!.prepare(`
          INSERT INTO sales (id, customer_id, customer_name, items, subtotal, tax, discount, total, status, payment_method, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          sale.id,
          sale.customerId || null,
          sale.customerName || null,
          JSON.stringify(sale.items),
          sale.subtotal,
          sale.tax,
          sale.discount,
          sale.total,
          sale.status,
          sale.paymentMethod,
          sale.notes || null,
          sale.createdAt,
          sale.updatedAt
        );
      }

      // Import settings
      if (data.settings) {
        this.db!.prepare(`
          INSERT INTO company_settings (company_name, address, phone, email, tax_rate, currency)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          data.settings.companyName,
          data.settings.address || null,
          data.settings.phone || null,
          data.settings.email || null,
          data.settings.taxRate,
          data.settings.currency
        );
      }
    });

    transaction();
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
