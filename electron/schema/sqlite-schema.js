/**
 * Shared SQLite Database Schema
 * Exact copy from development database (topnotch-sales.db)
 * DO NOT MODIFY - This ensures 100% compatibility
 */

function createTables(db) {
  console.log('Creating database tables from development schema...');

  // Customers table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      avatar TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      country TEXT,
      company TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      store_credit REAL DEFAULT 0
    )
  `);

  // Products table - EXACT from dev
  db.exec(`
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
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      image TEXT,
      is_active INTEGER DEFAULT 1
    )
  `);

  // Sales table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL CHECK (subtotal >= 0),
      tax REAL NOT NULL CHECK (tax >= 0),
      discount REAL NOT NULL CHECK (discount >= 0),
      total REAL NOT NULL CHECK (total >= 0),
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
      payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'other')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      invoice_id TEXT,
      invoice_number TEXT
    )
  `);

  // Company Settings table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      company_name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      tax_rate REAL NOT NULL DEFAULT 0.15 CHECK (tax_rate >= 0 AND tax_rate <= 1),
      currency TEXT NOT NULL DEFAULT 'USD',
      onboarding_completed INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT single_row CHECK (id = 1)
    )
  `);

  // Invoice Templates table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_templates (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      description TEXT,
      preview TEXT,
      colors_primary TEXT NOT NULL,
      colors_secondary TEXT NOT NULL,
      colors_accent TEXT NOT NULL,
      colors_background TEXT NOT NULL,
      colors_text TEXT NOT NULL,
      fonts_primary TEXT NOT NULL,
      fonts_secondary TEXT NOT NULL,
      fonts_size TEXT DEFAULT 'medium',
      layout_header_style TEXT DEFAULT 'classic',
      layout_show_logo INTEGER NOT NULL DEFAULT 1,
      layout_show_border INTEGER NOT NULL DEFAULT 1,
      layout_item_table_style TEXT DEFAULT 'simple',
      layout_footer_style TEXT DEFAULT 'minimal',
      custom_schema TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Invoices table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      number TEXT NOT NULL UNIQUE,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT,
      customer_email TEXT,
      customer_address TEXT,
      customer_phone TEXT,
      items TEXT NOT NULL,
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
      bank_details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sale_id TEXT
    )
  `);

  // Deals table - EXACT from dev
  db.exec(`
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
      tags TEXT DEFAULT '[]',
      notes TEXT,
      negotiation_history TEXT DEFAULT '[]',
      stakeholders TEXT DEFAULT '[]',
      competitor_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      order_number TEXT NOT NULL UNIQUE,
      supplier_id TEXT,
      supplier_name TEXT NOT NULL,
      items TEXT NOT NULL,
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

  // Returns table - EXACT from dev
  db.exec(`
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      return_number TEXT NOT NULL UNIQUE,
      sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT,
      items TEXT NOT NULL,
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

  // Create triggers - EXACT from dev
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_customers_timestamp 
    AFTER UPDATE ON customers 
    BEGIN 
      UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
    AFTER UPDATE ON products 
    BEGIN 
      UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_sales_timestamp
    AFTER UPDATE ON sales
    BEGIN
      UPDATE sales SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_invoice_templates_timestamp
    AFTER UPDATE ON invoice_templates
    BEGIN
      UPDATE invoice_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_invoices_timestamp
    AFTER UPDATE ON invoices
    BEGIN
      UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_deals_timestamp
    AFTER UPDATE ON deals
    BEGIN
      UPDATE deals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_orders_timestamp
    AFTER UPDATE ON orders
    BEGIN
      UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_returns_timestamp
    AFTER UPDATE ON returns
    BEGIN
      UPDATE returns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  // Create indexes for performance
  createIndexes(db);

  console.log('✅ Database tables, triggers, and indexes created successfully');
}

function migrateDatabase(db) {
  console.log('Running database migrations...');
  
  // Add onboarding_completed column if it doesn't exist
  try {
    db.exec(`ALTER TABLE company_settings ADD COLUMN onboarding_completed INTEGER DEFAULT 0`);
    console.log('✅ Added onboarding_completed column');
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column name')) {
      console.log('Migration note:', error.message);
    }
  }
  
  // Add new invoice template columns if they don't exist
  const templateColumns = [
    { name: 'description', type: 'TEXT', default: null },
    { name: 'preview', type: 'TEXT', default: null },
    { name: 'fonts_size', type: 'TEXT', default: "'medium'" },
    { name: 'layout_header_style', type: 'TEXT', default: "'classic'" },
    { name: 'layout_item_table_style', type: 'TEXT', default: "'simple'" },
    { name: 'layout_footer_style', type: 'TEXT', default: "'minimal'" },
    { name: 'custom_schema', type: 'TEXT', default: null },
    { name: 'is_default', type: 'INTEGER', default: '0' }
  ];
  
  templateColumns.forEach(column => {
    try {
      const alterQuery = `ALTER TABLE invoice_templates ADD COLUMN ${column.name} ${column.type}${column.default ? ` DEFAULT ${column.default}` : ''}`;
      db.exec(alterQuery);
      console.log(`✅ Added ${column.name} column to invoice_templates`);
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log(`Migration note for ${column.name}:`, error.message);
      }
    }
  });
}

function createIndexes(db) {
  console.log('Creating database indexes...');

  // Customer indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active)`);

  // Product indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`);

  // Sales indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_total ON sales(total)`);

  // Invoice indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_invoice_type ON invoices(invoice_type)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_sale_id ON invoices(sale_id)`);

  // Order indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_expected_delivery_date ON orders(expected_delivery_date)`);

  // Return indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_sale_id ON returns(sale_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_customer_id ON returns(customer_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_refund_method ON returns(refund_method)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at)`);

  // Deal indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON deals(customer_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_priority ON deals(priority)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value)`);

  // Invoice template indexes
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoice_templates_name ON invoice_templates(name)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoice_templates_created_at ON invoice_templates(created_at)`);

  // Composite indexes for common query patterns
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_customer_status ON sales(customer_id, status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sales_created_status ON sales(created_at, status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_returns_status_created ON returns(status, created_at)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_deals_stage_priority ON deals(stage, priority)`);

  console.log('✅ Database indexes created successfully');
}

function initializeDefaultData(db) {
  // Insert default company settings if none exist
  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM company_settings').get();
  if (existingSettings.count === 0) {
    db.prepare(`
      INSERT INTO company_settings (company_name, address, phone, email, tax_rate, currency)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('TopNotch Electronics', '', '', '', 0.15, 'USD');
    console.log('✅ Default company settings created');
  }
  
  // Insert default invoice templates if none exist
  const existingTemplates = db.prepare('SELECT COUNT(*) as count FROM invoice_templates').get();
  if (existingTemplates.count === 0) {
    const defaultTemplates = [
      {
        id: 'pro-corporate',
        name: 'Pro Corporate',
        description: 'Clean corporate with balanced header and easy-to-scan table',
        preview: 'pro-corporate-preview',
        colors_primary: '#1f2937',
        colors_secondary: '#6b7280',
        colors_accent: '#3b82f6',
        colors_background: '#ffffff',
        colors_text: '#111827',
        fonts_primary: 'Inter',
        fonts_secondary: 'Inter',
        fonts_size: 'medium',
        layout_header_style: 'classic',
        layout_show_logo: 1,
        layout_show_border: 1,
        layout_item_table_style: 'detailed',
        layout_footer_style: 'detailed',
        is_default: 1
      },
      {
        id: 'modern-stripe',
        name: 'Modern Stripe',
        description: 'Bold accent stripe with modern typography',
        preview: 'modern-stripe-preview',
        colors_primary: '#0f172a',
        colors_secondary: '#475569',
        colors_accent: '#8b5cf6',
        colors_background: '#ffffff',
        colors_text: '#0f172a',
        fonts_primary: 'Inter',
        fonts_secondary: 'Inter',
        fonts_size: 'medium',
        layout_header_style: 'modern',
        layout_show_logo: 1,
        layout_show_border: 1,
        layout_item_table_style: 'modern',
        layout_footer_style: 'minimal',
        is_default: 0
      },
      {
        id: 'minimal-outline',
        name: 'Minimal Outline',
        description: 'Clean minimal design with subtle borders',
        preview: 'minimal-outline-preview',
        colors_primary: '#111827',
        colors_secondary: '#6b7280',
        colors_accent: '#10b981',
        colors_background: '#ffffff',
        colors_text: '#111827',
        fonts_primary: 'Inter',
        fonts_secondary: 'Inter',
        fonts_size: 'medium',
        layout_header_style: 'minimal',
        layout_show_logo: 1,
        layout_show_border: 1,
        layout_item_table_style: 'simple',
        layout_footer_style: 'minimal',
        is_default: 0
      },
      {
        id: 'elegant-dark',
        name: 'Elegant Dark',
        description: 'Sophisticated dark theme with gold accents',
        preview: 'elegant-dark-preview',
        colors_primary: '#1e293b',
        colors_secondary: '#64748b',
        colors_accent: '#f59e0b',
        colors_background: '#0f172a',
        colors_text: '#f1f5f9',
        fonts_primary: 'Inter',
        fonts_secondary: 'Inter',
        fonts_size: 'medium',
        layout_header_style: 'premium',
        layout_show_logo: 1,
        layout_show_border: 1,
        layout_item_table_style: 'detailed',
        layout_footer_style: 'detailed',
        is_default: 0
      },
      {
        id: 'classic-column',
        name: 'Classic Column',
        description: 'Traditional two-column layout',
        preview: 'classic-column-preview',
        colors_primary: '#374151',
        colors_secondary: '#9ca3af',
        colors_accent: '#ef4444',
        colors_background: '#ffffff',
        colors_text: '#1f2937',
        fonts_primary: 'Inter',
        fonts_secondary: 'Inter',
        fonts_size: 'medium',
        layout_header_style: 'classic',
        layout_show_logo: 1,
        layout_show_border: 1,
        layout_item_table_style: 'simple',
        layout_footer_style: 'minimal',
        is_default: 0
      }
    ];
    
    const stmt = db.prepare(`
      INSERT INTO invoice_templates (
        id, name, description, preview,
        colors_primary, colors_secondary, colors_accent, colors_background, colors_text,
        fonts_primary, fonts_secondary, fonts_size,
        layout_header_style, layout_show_logo, layout_show_border, layout_item_table_style, layout_footer_style,
        is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    for (const template of defaultTemplates) {
      stmt.run(
        template.id, template.name, template.description, template.preview,
        template.colors_primary, template.colors_secondary, template.colors_accent, template.colors_background, template.colors_text,
        template.fonts_primary, template.fonts_secondary, template.fonts_size,
        template.layout_header_style, template.layout_show_logo, template.layout_show_border, template.layout_item_table_style, template.layout_footer_style,
        template.is_default, now, now
      );
    }
    
    console.log('✅ Default invoice templates created');
  }
}

module.exports = {
  createTables,
  createIndexes,
  migrateDatabase,
  initializeDefaultData
};
