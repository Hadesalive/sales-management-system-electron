import {
  Customer,
  Product,
  Sale,
  SaleItem,
  CompanySettings,
  InvoiceTemplate,
  Invoice,
  DatabaseCustomer,
  DatabaseProduct,
  DatabaseSale,
  DatabaseInvoiceTemplate,
  DatabaseInvoice,
  DatabaseDeal,
} from './schema';

export class DatabaseService {
  private db: ReturnType<typeof import('better-sqlite3')> | null = null;
  private dbPath: string;
  private Database: typeof import('better-sqlite3') | null = null;
  private path: typeof import('path') | null = null;
  private app: typeof import('electron').app | null = null;

  constructor() {
    // Set up database path for Electron (will be initialized later)
    this.dbPath = '';
  }

  private async initializeNodeModules() {
    if (typeof window !== 'undefined') {
      throw new Error('Database service can only be used in server-side contexts');
    }

    // Dynamic imports for Node.js modules
    const DatabaseModule = await import('better-sqlite3');
    const pathModule = await import('path');

    this.Database = DatabaseModule.default as typeof import('better-sqlite3');
    this.path = pathModule as typeof import('path');

    // Set up database path
    if (process.versions?.electron) {
      // Only import electron if we're actually in an Electron environment
      const electronModule = await import('electron');
      this.app = electronModule.app as typeof import('electron').app;
      this.dbPath = this.path.join(this.app.getPath('userData'), 'topnotch-sales.db');
    } else if (this.path) {
      // Fallback for development (Next.js)
      this.dbPath = this.path.join(process.cwd(), 'topnotch-sales.db');
    }
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Node.js modules first
      await this.initializeNodeModules();

      // Now we can safely use the Database class
      if (!this.Database) {
        throw new Error('Database module not initialized');
      }
      this.db = new this.Database(this.dbPath);
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
        city TEXT,
        state TEXT,
        zip TEXT,
        country TEXT,
        company TEXT,
        notes TEXT,
        is_active INTEGER DEFAULT 1,
        store_credit REAL DEFAULT 0,
        avatar TEXT,
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
        is_active INTEGER DEFAULT 1,
        image TEXT,
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

    // Orders table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        order_number TEXT NOT NULL UNIQUE,
        supplier_id TEXT,
        supplier_name TEXT NOT NULL,
        items TEXT NOT NULL, -- JSON array of items
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        tax REAL NOT NULL CHECK (tax >= 0),
        discount REAL NOT NULL CHECK (discount >= 0),
        total REAL NOT NULL CHECK (total >= 0),
        status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
        payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
        payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'credit', 'other')),
        expected_delivery_date TEXT,
        actual_delivery_date TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Returns table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS returns (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        return_number TEXT NOT NULL UNIQUE,
        sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
        customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
        customer_name TEXT,
        items TEXT NOT NULL, -- JSON array of items with reason and condition
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        tax REAL NOT NULL CHECK (tax >= 0),
        total REAL NOT NULL CHECK (total >= 0),
        refund_amount REAL NOT NULL CHECK (refund_amount >= 0),
        refund_method TEXT NOT NULL CHECK (refund_method IN ('cash', 'store_credit', 'original_payment', 'exchange')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        processed_by TEXT,
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

    // Invoice templates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_templates (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        colors_primary TEXT NOT NULL,
        colors_secondary TEXT NOT NULL,
        colors_accent TEXT NOT NULL,
        colors_background TEXT NOT NULL,
        colors_text TEXT NOT NULL,
        fonts_primary TEXT NOT NULL,
        fonts_secondary TEXT NOT NULL,
        layout_show_logo INTEGER NOT NULL DEFAULT 1,
        layout_show_border INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Invoices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        number TEXT NOT NULL UNIQUE,
        customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
        customer_name TEXT,
        customer_email TEXT,
        customer_address TEXT,
        customer_phone TEXT,
        items TEXT NOT NULL, -- JSON array of items
        subtotal REAL NOT NULL CHECK (subtotal >= 0),
        tax REAL NOT NULL CHECK (tax >= 0),
        discount REAL NOT NULL CHECK (discount >= 0),
        total REAL NOT NULL CHECK (total >= 0),
        paid_amount REAL NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
        status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
        invoice_type TEXT NOT NULL CHECK (invoice_type IN ('invoice', 'proforma', 'quote', 'credit_note', 'debit_note')),
        currency TEXT NOT NULL,
        due_date TEXT,
        notes TEXT,
        terms TEXT,
        bank_details TEXT, -- JSON object
        sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Deals table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
        customer_name TEXT,
        value REAL NOT NULL CHECK (value > 0),
        probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
        stage TEXT NOT NULL CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost')),
        expected_close_date TEXT,
        actual_close_date TEXT,
        source TEXT,
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
        tags TEXT DEFAULT '[]', -- JSON array
        notes TEXT,
        negotiation_history TEXT DEFAULT '[]', -- JSON array
        stakeholders TEXT DEFAULT '[]', -- JSON array
        competitor_info TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_invoice_templates_timestamp
      AFTER UPDATE ON invoice_templates
      BEGIN
        UPDATE invoice_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_invoices_timestamp
      AFTER UPDATE ON invoices
      BEGIN
        UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_deals_timestamp
      AFTER UPDATE ON deals
      BEGIN
        UPDATE deals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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

    // Check if default invoice templates exist
    const templates = this.db.prepare('SELECT COUNT(*) as count FROM invoice_templates').get() as { count: number };

    if (templates.count === 0) {
      // Insert default templates with proper IDs that match the renderers
      const defaultTemplates = [
        {
          id: 'pro-corporate',
          name: 'Pro Corporate',
          colors_primary: '#1e40af',
          colors_secondary: '#6b7280',
          colors_accent: '#3b82f6',
          colors_background: '#ffffff',
          colors_text: '#1f2937',
          fonts_primary: 'Inter, sans-serif',
          fonts_secondary: 'Inter, sans-serif',
          layout_show_logo: 1,
          layout_show_border: 1
        },
        {
          id: 'modern-stripe',
          name: 'Modern Stripe',
          colors_primary: '#7c3aed',
          colors_secondary: '#9ca3af',
          colors_accent: '#a855f7',
          colors_background: '#ffffff',
          colors_text: '#1f2937',
          fonts_primary: 'Inter, sans-serif',
          fonts_secondary: 'Inter, sans-serif',
          layout_show_logo: 1,
          layout_show_border: 0
        },
        {
          id: 'minimal-outline',
          name: 'Minimal Outline',
          colors_primary: '#059669',
          colors_secondary: '#6b7280',
          colors_accent: '#10b981',
          colors_background: '#ffffff',
          colors_text: '#1f2937',
          fonts_primary: 'Inter, sans-serif',
          fonts_secondary: 'Inter, sans-serif',
          layout_show_logo: 1,
          layout_show_border: 1
        },
        {
          id: 'elegant-dark',
          name: 'Elegant Dark',
          colors_primary: '#f59e0b',
          colors_secondary: '#9ca3af',
          colors_accent: '#fbbf24',
          colors_background: '#1f2937',
          colors_text: '#f9fafb',
          fonts_primary: 'Inter, sans-serif',
          fonts_secondary: 'Inter, sans-serif',
          layout_show_logo: 1,
          layout_show_border: 0
        },
        {
          id: 'classic-column',
          name: 'Classic Column',
          colors_primary: '#dc2626',
          colors_secondary: '#6b7280',
          colors_accent: '#ef4444',
          colors_background: '#ffffff',
          colors_text: '#1f2937',
          fonts_primary: 'Inter, sans-serif',
          fonts_secondary: 'Inter, sans-serif',
          layout_show_logo: 1,
          layout_show_border: 1
        }
      ];

      const templateStmt = this.db.prepare(`
        INSERT INTO invoice_templates (id, name, colors_primary, colors_secondary, colors_accent, colors_background, colors_text, fonts_primary, fonts_secondary, layout_show_logo, layout_show_border, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const template of defaultTemplates) {
        templateStmt.run(
          template.id,
          template.name,
          template.colors_primary,
          template.colors_secondary,
          template.colors_accent,
          template.colors_background,
          template.colors_text,
          template.fonts_primary,
          template.fonts_secondary,
          template.layout_show_logo,
          template.layout_show_border,
          new Date().toISOString(),
          new Date().toISOString()
        );
      }
    }
  }

  // Customer operations
  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    if (!this.db) throw new Error('Database not initialized');

    const customerId = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO customers (id, name, email, phone, address)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(customerId, data.name, data.email || null, data.phone || null, data.address || null);
    const customer = await this.getCustomerById(customerId);
    
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

    const productId = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO products (id, name, description, price, cost, sku, category, stock, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      productId,
      data.name,
      data.description || null,
      data.price,
      data.cost || null,
      data.sku || null,
      data.category || null,
      data.stock,
      data.minStock || null
    );

    const product = await this.getProductById(productId);
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

    const saleId = this.generateId();

    // Start transaction
    const transaction = this.db.transaction(() => {
      // Insert sale
      const stmt = this.db!.prepare(`
        INSERT INTO sales (id, customer_id, customer_name, items, subtotal, tax, discount, total, status, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        saleId,
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

      // Update product stock
      for (const item of data.items) {
        this.db!.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
          .run(item.quantity, item.productId);
      }

      return saleId;
    });

    transaction();
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

  // Invoice Template operations
  async createInvoiceTemplate(data: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceTemplate> {
    if (!this.db) throw new Error('Database not initialized');

    const templateId = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO invoice_templates (id, name, colors_primary, colors_secondary, colors_accent, colors_background, colors_text, fonts_primary, fonts_secondary, layout_show_logo, layout_show_border)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      templateId,
      data.name,
      data.colors.primary,
      data.colors.secondary,
      data.colors.accent,
      data.colors.background,
      data.colors.text,
      data.fonts.primary,
      data.fonts.secondary,
      data.layout.showLogo ? 1 : 0,
      data.layout.showBorder ? 1 : 0
    );

    const template = await this.getInvoiceTemplateById(templateId);
    if (!template) throw new Error('Failed to create invoice template');
    return template;
  }

  async getInvoiceTemplateById(id: string): Promise<InvoiceTemplate | null> {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM invoice_templates WHERE id = ?').get(id) as DatabaseInvoiceTemplate | undefined;
    if (!row) return null;

    return this.mapDatabaseInvoiceTemplateToInvoiceTemplate(row);
  }

  async getAllInvoiceTemplates(): Promise<InvoiceTemplate[]> {
    if (!this.db) return [];

    const rows = this.db.prepare('SELECT * FROM invoice_templates ORDER BY created_at DESC').all() as DatabaseInvoiceTemplate[];
    return rows.map(this.mapDatabaseInvoiceTemplateToInvoiceTemplate);
  }

  async updateInvoiceTemplate(id: string, data: Partial<Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InvoiceTemplate | null> {
    if (!this.db) return null;

    // Filter out fields that don't exist in the database table
    const validFields = ['name', 'colors', 'fonts', 'layout'];
    const fields = Object.keys(data).filter(key => 
      data[key as keyof typeof data] !== undefined && validFields.includes(key)
    );
    if (fields.length === 0) return this.getInvoiceTemplateById(id);

    const setClause = fields.map(field => {
      switch (field) {
        case 'colors':
          return 'colors_primary = ?, colors_secondary = ?, colors_accent = ?, colors_background = ?, colors_text = ?';
        case 'fonts':
          return 'fonts_primary = ?, fonts_secondary = ?';
        case 'layout':
          return 'layout_show_logo = ?, layout_show_border = ?';
        default:
          return `${field} = ?`;
      }
    }).join(', ');

    const values: (string | number)[] = [];
    fields.forEach(field => {
      const value = data[field as keyof typeof data];
      switch (field) {
        case 'colors':
          const colorsValue = value as { primary: string; secondary: string; accent: string; background: string; text: string };
          values.push(...[colorsValue.primary, colorsValue.secondary, colorsValue.accent, colorsValue.background, colorsValue.text]);
          break;
        case 'fonts':
          const fontsValue = value as { primary: string; secondary: string };
          values.push(...[fontsValue.primary, fontsValue.secondary]);
          break;
        case 'layout':
          const layoutValue = value as { showLogo: boolean; showBorder: boolean };
          values.push(...[layoutValue.showLogo ? 1 : 0, layoutValue.showBorder ? 1 : 0]);
          break;
        default:
          values.push(value);
      }
    });

    this.db.prepare(`UPDATE invoice_templates SET ${setClause} WHERE id = ?`).run(...values, id);
    return this.getInvoiceTemplateById(id);
  }

  async deleteInvoiceTemplate(id: string): Promise<boolean> {
    if (!this.db) return false;

    const result = this.db.prepare('DELETE FROM invoice_templates WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Invoice operations
  async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    if (!this.db) throw new Error('Database not initialized');

    // Validate customer_id if provided
    let validCustomerId = null;
    if (data.customerId) {
      const customerExists = this.db.prepare('SELECT id FROM customers WHERE id = ?').get(data.customerId);
      if (customerExists) {
        validCustomerId = data.customerId;
      } else {
        console.warn(`Customer with id ${data.customerId} does not exist. Creating invoice without customer_id link.`);
      }
    }

    // Generate a UUID for the invoice
    const invoiceId = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO invoices (id, number, customer_id, customer_name, customer_email, customer_address, customer_phone, items, subtotal, tax, discount, total, paid_amount, status, invoice_type, currency, due_date, notes, terms, bank_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      invoiceId,
      data.number,
      validCustomerId,
      data.customerName || null,
      data.customerEmail || null,
      data.customerAddress || null,
      data.customerPhone || null,
      JSON.stringify(data.items),
      data.subtotal,
      data.tax,
      data.discount,
      data.total,
      0, // paid_amount defaults to 0
      data.status,
      data.invoiceType,
      data.currency,
      data.dueDate || null,
      data.notes || null,
      data.terms || null,
      data.bankDetails ? JSON.stringify(data.bankDetails) : null
    );

    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Failed to create invoice');
    return invoice;
  }

  // Helper method to generate UUID-like IDs
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as DatabaseInvoice | undefined;
    if (!row) return null;

    return this.mapDatabaseInvoiceToInvoice(row);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    if (!this.db) return [];

    const rows = this.db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all() as DatabaseInvoice[];
    return rows.map(this.mapDatabaseInvoiceToInvoice);
  }

  async updateInvoice(id: string, data: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Invoice | null> {
    if (!this.db) return null;

    // Validate customer_id if provided
    if (data.customerId !== undefined && data.customerId !== null && typeof data.customerId === 'string') {
      const customerExists = this.db.prepare('SELECT id FROM customers WHERE id = ?').get(data.customerId);
      if (!customerExists) {
        console.warn(`Customer with id ${data.customerId} does not exist. Setting customer_id to null.`);
        data.customerId = undefined; // Will be converted to null
      }
    }

    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    if (fields.length === 0) return this.getInvoiceById(id);

    const setClause = fields.map(field => {
      switch (field) {
        case 'items':
          return 'items = ?';
        case 'bankDetails':
          return 'bank_details = ?';
        case 'invoiceType':
          return 'invoice_type = ?';
        case 'customerId':
          return 'customer_id = ?';
        case 'customerName':
          return 'customer_name = ?';
        case 'customerEmail':
          return 'customer_email = ?';
        case 'customerAddress':
          return 'customer_address = ?';
        case 'customerPhone':
          return 'customer_phone = ?';
        case 'dueDate':
          return 'due_date = ?';
        case 'paidAmount':
          return 'paid_amount = ?';
        default:
          return `${field} = ?`;
      }
    }).join(', ');

    const values: (string | number | null)[] = [];
    fields.forEach(field => {
      const value = data[field as keyof typeof data];
      switch (field) {
        case 'items':
          values.push(JSON.stringify(value));
          break;
        case 'bankDetails':
          values.push(value ? JSON.stringify(value) : null);
          break;
        case 'customerId':
          // Handle customer_id specially to avoid foreign key constraint
          // Only set if it's a valid string, otherwise set to null
          values.push(value && typeof value === 'string' ? value : null);
          break;
        default:
          // Handle simple primitive values
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            values.push(value);
          } else if (value && (typeof value === 'object' || Array.isArray(value))) {
            // Handle complex objects or arrays by JSON.stringify
            values.push(JSON.stringify(value));
          } else {
            // Handle null, undefined, or other edge cases
            values.push(null);
          }
      }
    });

    this.db.prepare(`UPDATE invoices SET ${setClause} WHERE id = ?`).run(...values, id);
    return this.getInvoiceById(id);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    if (!this.db) return false;

    const result = this.db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
    return result.changes > 0;
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

  private mapDatabaseInvoiceTemplateToInvoiceTemplate(row: DatabaseInvoiceTemplate): InvoiceTemplate {
    return {
      id: row.id!,
      name: row.name,
      description: `${row.name} - Professional invoice template`,
      preview: '/images/template-preview-placeholder.png', // Placeholder preview
      colors: {
        primary: row.colors_primary!,
        secondary: row.colors_secondary!,
        accent: row.colors_accent!,
        background: row.colors_background!,
        text: row.colors_text!,
      },
      layout: {
        headerStyle: (row.layout_header_style as 'minimal' | 'classic' | 'modern' | 'premium') || 'classic',
        showLogo: Boolean(row.layout_show_logo),
        showBorder: Boolean(row.layout_show_border),
        itemTableStyle: (row.layout_item_table_style as 'simple' | 'detailed' | 'modern') || 'simple',
        footerStyle: (row.layout_footer_style as 'minimal' | 'detailed') || 'minimal',
      },
      fonts: {
        primary: row.fonts_primary!,
        secondary: row.fonts_secondary!,
        size: (row.fonts_size as 'small' | 'medium' | 'large') || 'medium',
      },
      createdAt: row.created_at!,
      updatedAt: row.updated_at!,
    };
  }

  private mapDatabaseInvoiceToInvoice(row: DatabaseInvoice): Invoice {
    const paidAmount = row.paid_amount || 0;
    const total = row.total;
    const balance = Math.max(0, total - paidAmount); // Calculate remaining balance

    return {
      id: row.id!,
      number: row.number,
      customerId: row.customer_id || undefined,
      customerName: row.customer_name || undefined,
      customerEmail: row.customer_email || undefined,
      customerAddress: row.customer_address || undefined,
      customerPhone: row.customer_phone || undefined,
      items: JSON.parse(row.items || '[]'),
      subtotal: row.subtotal,
      tax: row.tax,
      discount: row.discount,
      total: total,
      paidAmount: paidAmount,
      balance: balance,
      status: row.status as Invoice['status'],
      invoiceType: row.invoice_type as Invoice['invoiceType'],
      currency: row.currency,
      dueDate: row.due_date || undefined,
      notes: row.notes || undefined,
      terms: row.terms || undefined,
      bankDetails: row.bank_details ? JSON.parse(row.bank_details) : undefined,
      createdAt: row.created_at!,
      updatedAt: row.updated_at!,
    };
  }

  // Deal CRUD operations
  async createDeal(data: Omit<DatabaseDeal, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseDeal> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO deals (
        title, customer_id, customer_name, value, probability, stage,
        expected_close_date, actual_close_date, source, priority, tags, notes,
        negotiation_history, stakeholders, competitor_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title,
      data.customer_id || null,
      data.customer_name || null,
      data.value,
      data.probability,
      data.stage,
      data.expected_close_date || null,
      data.actual_close_date || null,
      data.source || null,
      data.priority || 'medium',
      data.tags || '[]',
      data.notes || null,
      data.negotiation_history || '[]',
      data.stakeholders || '[]',
      data.competitor_info || null
    );

    const deal = this.db.prepare('SELECT * FROM deals WHERE id = ?').get(result.lastInsertRowid) as DatabaseDeal;
    return deal;
  }

  async getDealById(id: string): Promise<DatabaseDeal | null> {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM deals WHERE id = ?').get(id) as DatabaseDeal | undefined;
    return row || null;
  }

  async getAllDeals(): Promise<DatabaseDeal[]> {
    if (!this.db) return [];

    const rows = this.db.prepare('SELECT * FROM deals ORDER BY created_at DESC').all() as DatabaseDeal[];
    return rows;
  }

  async updateDeal(id: string, data: Partial<Omit<DatabaseDeal, 'id' | 'created_at' | 'updated_at'>>): Promise<DatabaseDeal | null> {
    if (!this.db) return null;

    const fields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);
    if (fields.length === 0) return this.getDealById(id);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => data[field as keyof typeof data]);

    const stmt = this.db.prepare(`UPDATE deals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);

    return this.getDealById(id);
  }

  async deleteDeal(id: string): Promise<boolean> {
    if (!this.db) return false;

    const stmt = this.db.prepare('DELETE FROM deals WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  }

  // Utility methods
  async exportData(): Promise<{
    customers: Customer[];
    products: Product[];
    sales: Sale[];
    invoiceTemplates: InvoiceTemplate[];
    invoices: Invoice[];
    settings: CompanySettings;
    exportedAt: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const customers = await this.getAllCustomers();
    const products = await this.getAllProducts();
    const sales = await this.getAllSales();
    const invoiceTemplates = await this.getAllInvoiceTemplates();
    const invoices = await this.getAllInvoices();
    const settings = await this.getCompanySettings();

    return {
      customers,
      products,
      sales,
      invoiceTemplates,
      invoices,
      settings,
      exportedAt: new Date().toISOString(),
    };
  }

  async importData(data: {
    customers?: Customer[];
    products?: Product[];
    sales?: Sale[];
    invoiceTemplates?: InvoiceTemplate[];
    invoices?: Invoice[];
    settings?: CompanySettings;
  }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(() => {
      // Clear existing data
      this.db!.exec('DELETE FROM invoices');
      this.db!.exec('DELETE FROM invoice_templates');
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

      // Import invoice templates
      for (const template of data.invoiceTemplates || []) {
        this.db!.prepare(`
          INSERT INTO invoice_templates (id, name, colors_primary, colors_secondary, colors_accent, colors_background, colors_text, fonts_primary, fonts_secondary, layout_show_logo, layout_show_border, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          template.id,
          template.name,
          template.colors.primary,
          template.colors.secondary,
          template.colors.accent,
          template.colors.background,
          template.colors.text,
          template.fonts.primary,
          template.fonts.secondary,
          template.layout.showLogo ? 1 : 0,
          template.layout.showBorder ? 1 : 0,
          template.createdAt,
          template.updatedAt
        );
      }

      // Import invoices
      for (const invoice of data.invoices || []) {
        this.db!.prepare(`
          INSERT INTO invoices (id, number, customer_id, customer_name, customer_email, customer_address, customer_phone, items, subtotal, tax, discount, total, status, invoice_type, currency, due_date, notes, terms, bank_details, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          invoice.id,
          invoice.number,
          invoice.customerId || null,
          invoice.customerName || null,
          invoice.customerEmail || null,
          invoice.customerAddress || null,
          invoice.customerPhone || null,
          JSON.stringify(invoice.items),
          invoice.subtotal,
          invoice.tax,
          invoice.discount,
          invoice.total,
          invoice.status,
          invoice.invoiceType,
          invoice.currency,
          invoice.dueDate || null,
          invoice.notes || null,
          invoice.terms || null,
          invoice.bankDetails ? JSON.stringify(invoice.bankDetails) : null,
          invoice.createdAt,
          invoice.updatedAt
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
    this.Database = null;
    this.path = null;
    this.app = null;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
