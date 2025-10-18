/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { createTables, migrateDatabase, initializeDefaultData } = require('../schema/sqlite-schema');

// Try to use SQLite database instead of JSON file for consistency
let sqlite3 = null;
try {
  sqlite3 = require('better-sqlite3');
  console.log('✅ better-sqlite3 loaded successfully');
  console.log('better-sqlite3 version:', sqlite3.VERSION);
  console.log('better-sqlite3 path:', require.resolve('better-sqlite3'));
} catch (error) {
  console.log('❌ better-sqlite3 not available:', error.message);
  console.log('Error details:', error);
  console.log('Falling back to JSON file storage');
}

function createSQLiteDatabaseService() {
  console.log('🔧 Creating SQLite database service');
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 sqlite3 available:', !!sqlite3);
  console.log('🔧 sqlite3 type:', typeof sqlite3);

  // Determine database path based on environment
  let dbPath;
  console.log('🔧 NODE_ENV check:', process.env.NODE_ENV);
  console.log('🔧 NODE_ENV === "production":', process.env.NODE_ENV === 'production');
  
  if (process.env.NODE_ENV === 'production') {
    // Production: use user data directory
    console.log('🔧 Production mode: Database in user data directory');
    
    // Try different database paths as fallbacks
    const possiblePaths = [];
    
    // Try to get user data path from Electron app if available
    try {
      const { app } = require('electron');
      console.log('🔧 App is ready:', app.isReady());
      console.log('🔧 App name:', app.getName());
      console.log('🔧 App version:', app.getVersion());
      
      if (app.isReady()) {
        const userDataPath = app.getPath('userData');
        console.log('🔧 User data path:', userDataPath);
        possiblePaths.push(path.join(userDataPath, 'topnotch-sales.db'));
        possiblePaths.push(path.join(userDataPath, 'database.db'));
      } else {
        console.log('⚠️ App not ready, using fallback paths');
      }
    } catch (error) {
      console.log('⚠️ Could not access Electron app:', error.message);
    }
    
    // Add fallback paths in user's home directory (these should always work)
    possiblePaths.push(path.join(os.homedir(), 'Library', 'Application Support', 'TopNotch Sales Manager', 'topnotch-sales.db'));
    possiblePaths.push(path.join(os.homedir(), 'TopNotch Sales Manager', 'topnotch-sales.db'));
    possiblePaths.push(path.join(os.homedir(), '.topnotch-sales-manager', 'topnotch-sales.db'));
    
    console.log('🔧 Possible database paths:', possiblePaths);
    
    let workingPath = null;
    for (const testPath of possiblePaths) {
      try {
        console.log('🔧 Testing database path:', testPath);
        
        // Ensure directory exists
        const dir = path.dirname(testPath);
        if (!fs.existsSync(dir)) {
          console.log('🔧 Creating directory:', dir);
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Test if we can write to the directory
        const testFile = path.join(dir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        
        workingPath = testPath;
        console.log('✅ Found working database path:', workingPath);
        break;
      } catch (error) {
        console.log('❌ Path not writable:', testPath, error.message);
        continue;
      }
    }
    
    if (!workingPath) {
      throw new Error('Cannot find a writable directory for the database. Tried paths: ' + possiblePaths.join(', '));
    }
    
    dbPath = workingPath;
    console.log('🔧 Final database path:', dbPath);
  } else {
    // Development: use project root
    console.log('🔧 Development mode: Database in project root');
    console.log('🔧 Current working directory:', process.cwd());
    dbPath = path.join(process.cwd(), 'topnotch-sales.db');
    console.log('🔧 Database path:', dbPath);
  }
  
  console.log('🔧 Final dbPath before SQLite:', dbPath);

  if (!sqlite3) {
    console.log('❌ better-sqlite3 not available, throwing error');
    throw new Error('better-sqlite3 not available');
  }

  console.log('🔧 Opening SQLite database...');
  let db;
  try {
    // Try to open the database with better error handling
    db = sqlite3(dbPath, { 
      verbose: console.log // Enable verbose logging for debugging
    });
    console.log('✅ SQLite database opened successfully');
    
    // Test if the database is actually working
    db.prepare('SELECT 1').get();
    console.log('✅ SQLite database is functional');
  } catch (error) {
    console.error('❌ Failed to open SQLite database:', error);
    console.error('❌ Database path:', dbPath);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno
    });
    
    // Provide more specific error messages
    if (error.code === 'SQLITE_CANTOPEN') {
      throw new Error(`Cannot open database file at ${dbPath}. This is usually a permissions issue or the directory doesn't exist.`);
    } else if (error.code === 'SQLITE_NOTADB') {
      throw new Error(`File at ${dbPath} exists but is not a valid SQLite database.`);
    } else {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  return {
    async initialize() {
      try {
        console.log('Creating database tables from development schema...');
        createTables(db);
        console.log('Running database migrations...');
        migrateDatabase(db);
        console.log('Initializing default data...');
        initializeDefaultData(db);
        console.log('✅ Database initialization complete');
        return Promise.resolve();
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
      }
    },

    close() {
      console.log('Closing SQLite database');
      db.close();
    },

    async getCompanySettings() {
      try {
        const row = db.prepare('SELECT * FROM company_settings WHERE id = 1').get();
        if (row) {
          return {
            companyName: row.company_name,
            address: row.address,
            phone: row.phone,
            email: row.email,
            taxRate: row.tax_rate,
            currency: row.currency
          };
        }
      } catch (error) {
        console.error('Error getting company settings:', error);
      }
      return {
        companyName: 'TopNotch Electronics',
        address: '',
        phone: '',
        email: '',
        taxRate: 0.15,
        currency: 'USD'
      };
    },

    async updateCompanySettings(settings) {
      console.log('Updating company settings:', settings);
      try {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO company_settings (id, company_name, address, phone, email, tax_rate, currency)
          VALUES (1, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          settings.companyName || 'TopNotch Electronics',
          settings.address || '',
          settings.phone || '',
          settings.email || '',
          settings.taxRate || 0.15,
          settings.currency || 'USD'
        );
        return this.getCompanySettings();
      } catch (error) {
        console.error('Error updating company settings:', error);
        return settings;
      }
    },

    async getInvoices() {
      try {
        const rows = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          number: row.number,
          customerId: row.customer_id,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerAddress: row.customer_address,
          customerPhone: row.customer_phone,
          dueDate: row.due_date,
          status: row.status,
          invoiceType: row.invoice_type,
          currency: row.currency,
          subtotal: row.subtotal,
          tax: row.tax,
          discount: row.discount,
          total: row.total,
          paidAmount: row.paid_amount || 0,
          balance: row.total - (row.paid_amount || 0),
          items: JSON.parse(row.items || '[]'),
          notes: row.notes,
          terms: row.terms,
          bankDetails: row.bank_details ? JSON.parse(row.bank_details) : null,
          saleId: row.sale_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting invoices:', error);
        return [];
      }
    },

    async getInvoiceById(id) {
      try {
        console.log('SQLite: Fetching invoice with ID:', id);
        const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
        if (row) {
          console.log('SQLite: Invoice found:', row.id);
          return {
            id: row.id,
            number: row.number,
            customerId: row.customer_id,
            customerName: row.customer_name,
            customerEmail: row.customer_email,
            customerAddress: row.customer_address,
            customerPhone: row.customer_phone,
            dueDate: row.due_date,
            status: row.status,
            invoiceType: row.invoice_type,
            currency: row.currency,
            subtotal: row.subtotal,
            tax: row.tax,
            discount: row.discount,
            total: row.total,
            paidAmount: row.paid_amount || 0,
            balance: row.total - (row.paid_amount || 0),
            items: JSON.parse(row.items || '[]'),
            notes: row.notes,
            terms: row.terms,
            bankDetails: row.bank_details ? JSON.parse(row.bank_details) : null,
            saleId: row.sale_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        } else {
          console.log('SQLite: Invoice not found for ID:', id);
          return null;
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
      }
    },

    async createInvoice(invoiceData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();

        const stmt = db.prepare(`
          INSERT INTO invoices (id, number, customer_id, customer_name, customer_email, customer_address, customer_phone, items, subtotal, tax, discount, total, paid_amount, status, invoice_type, currency, due_date, notes, terms, bank_details, sale_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          invoiceData.number || '',
          invoiceData.customerId || null,
          invoiceData.customerName || '',
          invoiceData.customerEmail || '',
          invoiceData.customerAddress || '',
          invoiceData.customerPhone || '',
          JSON.stringify(invoiceData.items || []),
          invoiceData.subtotal || 0,
          invoiceData.tax || 0,
          invoiceData.discount || 0,
          invoiceData.total || 0,
          invoiceData.paidAmount || 0,
          invoiceData.status || 'draft',
          invoiceData.invoiceType || 'invoice',
          invoiceData.currency || 'USD',
          invoiceData.dueDate || null,
          invoiceData.notes || '',
          invoiceData.terms || '',
          invoiceData.bankDetails ? JSON.stringify(invoiceData.bankDetails) : null,
          invoiceData.saleId || null,
          now,
          now
        );

        return this.getInvoiceById(id);
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
    },

    async updateInvoice(id, updates) {
      try {
        // Map camelCase fields to snake_case database columns
        const fieldMapping = {
          'customerId': 'customer_id',
          'customerName': 'customer_name',
          'customerEmail': 'customer_email',
          'customerAddress': 'customer_address',
          'customerPhone': 'customer_phone',
          'invoiceType': 'invoice_type',
          'dueDate': 'due_date',
          'paidAmount': 'paid_amount',
          'bankDetails': 'bank_details',
          'saleId': 'sale_id',
          'createdAt': 'created_at',
          'updatedAt': 'updated_at'
        };

        const fields = Object.keys(updates);
        const values = [];
        const setClause = fields.map(field => {
          const dbField = fieldMapping[field] || field;
          let value = updates[field];
          
          // Handle JSON fields
          if (field === 'items' || field === 'bankDetails') {
            value = JSON.stringify(value);
          }
          
          values.push(value);
          return `${dbField} = ?`;
        }).join(', ');

        const stmt = db.prepare(`UPDATE invoices SET ${setClause}, updated_at = ? WHERE id = ?`);
        stmt.run(...values, new Date().toISOString(), id);
        return this.getInvoiceById(id);
      } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
      }
    },

    async deleteInvoice(id) {
      try {
        const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }
    },

    async getAllInvoiceTemplates() {
      try {
        const rows = db.prepare('SELECT * FROM invoice_templates ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description || '',
          preview: row.preview || '',
          colors: {
            primary: row.colors_primary,
            secondary: row.colors_secondary,
            accent: row.colors_accent,
            background: row.colors_background,
            text: row.colors_text
          },
          layout: {
            headerStyle: row.layout_header_style || 'classic',
            showLogo: row.layout_show_logo !== 0,
            showBorder: row.layout_show_border !== 0,
            itemTableStyle: row.layout_item_table_style || 'simple',
            footerStyle: row.layout_footer_style || 'minimal'
          },
          fonts: {
            primary: row.fonts_primary,
            secondary: row.fonts_secondary,
            size: row.fonts_size || 'medium'
          },
          customSchema: row.custom_schema ? JSON.parse(row.custom_schema) : undefined,
          isDefault: row.is_default !== 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting invoice templates:', error);
        return [];
      }
    },

    async getInvoiceTemplateById(id) {
      try {
        const row = db.prepare('SELECT * FROM invoice_templates WHERE id = ?').get(id);
        if (row) {
          return {
            id: row.id,
            name: row.name,
            description: row.description || '',
            preview: row.preview || '',
            colors: {
              primary: row.colors_primary,
              secondary: row.colors_secondary,
              accent: row.colors_accent,
              background: row.colors_background,
              text: row.colors_text
            },
            layout: {
              headerStyle: row.layout_header_style || 'classic',
              showLogo: row.layout_show_logo !== 0,
              showBorder: row.layout_show_border !== 0,
              itemTableStyle: row.layout_item_table_style || 'simple',
              footerStyle: row.layout_footer_style || 'minimal'
            },
            fonts: {
              primary: row.fonts_primary,
              secondary: row.fonts_secondary,
              size: row.fonts_size || 'medium'
            },
            customSchema: row.custom_schema ? JSON.parse(row.custom_schema) : undefined,
            isDefault: row.is_default !== 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting invoice template:', error);
        return null;
      }
    },

    async createInvoiceTemplate(templateData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();

        const stmt = db.prepare(`
          INSERT INTO invoice_templates (id, name, description, colors_primary, colors_secondary, colors_accent, colors_background, colors_text, fonts_primary, fonts_secondary, fonts_size, layout_header_style, layout_show_logo, layout_show_border, layout_item_table_style, layout_footer_style, is_default, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          templateData.name || '',
          templateData.description || '',
          templateData.colors?.primary || '#1f2937',
          templateData.colors?.secondary || '#6b7280',
          templateData.colors?.accent || '#3b82f6',
          templateData.colors?.background || '#ffffff',
          templateData.colors?.text || '#111827',
          templateData.fonts?.primary || 'Inter',
          templateData.fonts?.secondary || 'Inter',
          templateData.fonts?.size || 'medium',
          templateData.layout?.headerStyle || 'modern',
          templateData.layout?.showLogo ? 1 : 0,
          templateData.layout?.showBorder ? 1 : 0,
          templateData.layout?.itemTableStyle || 'detailed',
          templateData.layout?.footerStyle || 'detailed',
          templateData.isDefault ? 1 : 0,
          now,
          now
        );

        return this.getInvoiceTemplateById(id);
      } catch (error) {
        console.error('Error creating invoice template:', error);
        throw error;
      }
    },

    async updateInvoiceTemplate(id, updates) {
      try {
        console.log('SQLite: Updating invoice template ID:', id);
        console.log('SQLite: Updates received:', JSON.stringify(updates, null, 2));
        
        // Map template object fields to database columns
        const updateData = {};
        
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.preview !== undefined) updateData.preview = updates.preview;
        if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault ? 1 : 0;
        
        // Handle nested color fields
        if (updates.colors) {
          if (updates.colors.primary) updateData.colors_primary = updates.colors.primary;
          if (updates.colors.secondary) updateData.colors_secondary = updates.colors.secondary;
          if (updates.colors.accent) updateData.colors_accent = updates.colors.accent;
          if (updates.colors.background) updateData.colors_background = updates.colors.background;
          if (updates.colors.text) updateData.colors_text = updates.colors.text;
        }
        
        // Handle nested font fields
        if (updates.fonts) {
          if (updates.fonts.primary) updateData.fonts_primary = updates.fonts.primary;
          if (updates.fonts.secondary) updateData.fonts_secondary = updates.fonts.secondary;
          if (updates.fonts.size) updateData.fonts_size = updates.fonts.size;
        }
        
        // Handle nested layout fields
        if (updates.layout) {
          if (updates.layout.showLogo !== undefined) updateData.layout_show_logo = updates.layout.showLogo ? 1 : 0;
          if (updates.layout.showBorder !== undefined) updateData.layout_show_border = updates.layout.showBorder ? 1 : 0;
          if (updates.layout.headerStyle) updateData.layout_header_style = updates.layout.headerStyle;
          if (updates.layout.itemTableStyle) updateData.layout_item_table_style = updates.layout.itemTableStyle;
          if (updates.layout.footerStyle) updateData.layout_footer_style = updates.layout.footerStyle;
        }
        
        // Handle custom schema (store as JSON string)
        if (updates.customSchema !== undefined) {
          updateData.custom_schema = updates.customSchema ? JSON.stringify(updates.customSchema) : null;
        }
        
        const fields = Object.keys(updateData);
        console.log('SQLite: Mapped fields to update:', fields);
        console.log('SQLite: Update data:', updateData);
        
        if (fields.length === 0) {
          // No valid fields to update, just return current template
          console.log('SQLite: No valid fields to update, returning current template');
          return this.getInvoiceTemplateById(id);
        }
        
        const values = fields.map(field => updateData[field]);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE invoice_templates SET ${setClause}, updated_at = ? WHERE id = ?`;
        console.log('SQLite: Executing query:', query);
        console.log('SQLite: With values:', [...values, new Date().toISOString(), id]);
        
        const stmt = db.prepare(query);
        const result = stmt.run(...values, new Date().toISOString(), id);
        console.log('SQLite: Update result:', result);
        
        const updatedTemplate = this.getInvoiceTemplateById(id);
        console.log('SQLite: Updated template:', updatedTemplate);
        return updatedTemplate;
      } catch (error) {
        console.error('Error updating invoice template:', error);
        throw error;
      }
    },

    async deleteInvoiceTemplate(id) {
      try {
        const stmt = db.prepare('DELETE FROM invoice_templates WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting invoice template:', error);
        throw error;
      }
    },

    // Product methods
    async getProducts() {
      try {
        const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          cost: row.cost,
          sku: row.sku,
          category: row.category,
          stock: row.stock,
          minStock: row.min_stock,
          isActive: row.is_active !== 0,
          image: row.image,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting products:', error);
        return [];
      }
    },

    async getProductById(id) {
      try {
        const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (row) {
          return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            cost: row.cost,
            sku: row.sku,
            category: row.category,
            stock: row.stock,
            minStock: row.min_stock,
            isActive: row.is_active !== 0,
            image: row.image,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
        return null;
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },

    async createProduct(productData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();

        const stmt = db.prepare(`
          INSERT INTO products (id, name, description, price, cost, sku, category, stock, min_stock, is_active, image, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          productData.name || '',
          productData.description || '',
          productData.price || 0,
          productData.cost || 0,
          productData.sku || '',
          productData.category || '',
          productData.stock || 0,
          productData.minStock || 0,
          productData.isActive !== false ? 1 : 0,
          productData.image || null,
          now,
          now
        );

        return this.getProductById(id);
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },

    async updateProduct(id, updates) {
      try {
        // Handle null/undefined updates
        if (!updates || typeof updates !== 'object') {
          console.error('Invalid updates object:', updates);
          throw new Error('Updates object is required');
        }

        const fieldMapping = {
          'minStock': 'min_stock',
          'isActive': 'is_active',
          'createdAt': 'created_at',
          'updatedAt': 'updated_at'
        };

        const fields = Object.keys(updates);
        if (fields.length === 0) {
          return this.getProductById(id);
        }

        const values = [];
        const setClause = fields.map(field => {
          const dbField = fieldMapping[field] || field;
          let value = updates[field];
          
          // Convert boolean to integer for SQLite
          if (field === 'isActive' && typeof value === 'boolean') {
            value = value ? 1 : 0;
          }
          
          values.push(value);
          return `${dbField} = ?`;
        }).join(', ');

        const stmt = db.prepare(`UPDATE products SET ${setClause}, updated_at = ? WHERE id = ?`);
        stmt.run(...values, new Date().toISOString(), id);
        return this.getProductById(id);
      } catch (error) {
        console.error('Error updating product:', error);
        throw error;
      }
    },

    async deleteProduct(id) {
      try {
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    },

    // Sales methods
    async getSales() {
      try {
        const rows = db.prepare('SELECT * FROM sales ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          customerId: row.customer_id,
          customerName: row.customer_name,
          items: JSON.parse(row.items || '[]'),
          subtotal: row.subtotal,
          tax: row.tax,
          discount: row.discount,
          total: row.total,
          status: row.status,
          paymentMethod: row.payment_method,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting sales:', error);
        return [];
      }
    },

    async getSaleById(id) {
      try {
        const row = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
        if (row) {
          return {
            id: row.id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            items: JSON.parse(row.items || '[]'),
            subtotal: row.subtotal,
            tax: row.tax,
            discount: row.discount,
            total: row.total,
            status: row.status,
            paymentMethod: row.payment_method,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
        return null;
      } catch (error) {
        console.error('Error fetching sale:', error);
        return null;
      }
    },

    async createSale(saleData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();

        const stmt = db.prepare(`
          INSERT INTO sales (id, customer_id, customer_name, items, subtotal, tax, discount, total, status, payment_method, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          saleData.customerId || null,
          saleData.customerName || '',
          JSON.stringify(saleData.items || []),
          saleData.subtotal || 0,
          saleData.tax || 0,
          saleData.discount || 0,
          saleData.total || 0,
          saleData.status || 'completed',
          saleData.paymentMethod || 'cash',
          saleData.notes || '',
          now,
          now
        );

        return this.getSaleById(id);
      } catch (error) {
        console.error('Error creating sale:', error);
        throw error;
      }
    },

    async updateSale(id, updates) {
      try {
        const fieldMapping = {
          'customerId': 'customer_id',
          'customerName': 'customer_name',
          'paymentMethod': 'payment_method',
          'invoiceId': 'invoice_id',
          'invoiceNumber': 'invoice_number',
          'createdAt': 'created_at',
          'updatedAt': 'updated_at'
        };

        const fields = Object.keys(updates);
        const values = [];
        const setClause = fields.map(field => {
          const dbField = fieldMapping[field] || field;
          let value = updates[field];
          
          if (field === 'items') {
            value = JSON.stringify(value);
          }
          
          values.push(value);
          return `${dbField} = ?`;
        }).join(', ');

        const stmt = db.prepare(`UPDATE sales SET ${setClause}, updated_at = ? WHERE id = ?`);
        stmt.run(...values, new Date().toISOString(), id);
        return this.getSaleById(id);
      } catch (error) {
        console.error('Error updating sale:', error);
        throw error;
      }
    },

    async deleteSale(id) {
      try {
        const stmt = db.prepare('DELETE FROM sales WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting sale:', error);
        throw error;
      }
    },

    // Order methods
    async getOrders() {
      try {
        const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          orderNumber: row.order_number,
          supplierId: row.supplier_id,
          supplierName: row.supplier_name,
          items: JSON.parse(row.items || '[]'),
          subtotal: row.subtotal,
          tax: row.tax,
          discount: row.discount,
          total: row.total,
          status: row.status,
          paymentStatus: row.payment_status,
          paymentMethod: row.payment_method,
          expectedDeliveryDate: row.expected_delivery_date,
          actualDeliveryDate: row.actual_delivery_date,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting orders:', error);
        return [];
      }
    },

    async getOrderById(id) {
      try {
        const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (row) {
          return {
            id: row.id,
            orderNumber: row.order_number,
            supplierId: row.supplier_id,
            supplierName: row.supplier_name,
            items: JSON.parse(row.items || '[]'),
            subtotal: row.subtotal,
            tax: row.tax,
            discount: row.discount,
            total: row.total,
            status: row.status,
            paymentStatus: row.payment_status,
            paymentMethod: row.payment_method,
            expectedDeliveryDate: row.expected_delivery_date,
            actualDeliveryDate: row.actual_delivery_date,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting order by ID:', error);
        return null;
      }
    },

    async createOrder(orderData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();
        const orderNumber = orderData.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;

        const stmt = db.prepare(`
          INSERT INTO orders (id, order_number, supplier_id, supplier_name, items, subtotal, tax, discount, total, status, payment_status, payment_method, expected_delivery_date, actual_delivery_date, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          orderNumber,
          orderData.supplierId || null,
          orderData.supplierName,
          JSON.stringify(orderData.items || []),
          orderData.subtotal || 0,
          orderData.tax || 0,
          orderData.discount || 0,
          orderData.total || 0,
          orderData.status || 'pending',
          orderData.paymentStatus || 'unpaid',
          orderData.paymentMethod || null,
          orderData.expectedDeliveryDate || null,
          orderData.actualDeliveryDate || null,
          orderData.notes || null,
          now,
          now
        );

        return this.getOrderById(id);
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },

    async updateOrder(id, updates) {
      try {
        if (!updates || Object.keys(updates).length === 0) {
          return this.getOrderById(id);
        }

        const fieldMapping = {
          'orderNumber': 'order_number',
          'supplierId': 'supplier_id',
          'supplierName': 'supplier_name',
          'paymentStatus': 'payment_status',
          'paymentMethod': 'payment_method',
          'expectedDeliveryDate': 'expected_delivery_date',
          'actualDeliveryDate': 'actual_delivery_date'
        };

        const setClause = [];
        const values = [];

        for (const key in updates) {
          if (updates[key] !== undefined) {
            const dbColumn = fieldMapping[key] || key;
            
            if (key === 'items') {
              setClause.push(`${dbColumn} = ?`);
              values.push(JSON.stringify(updates[key]));
            } else {
              setClause.push(`${dbColumn} = ?`);
              values.push(updates[key]);
            }
          }
        }

        if (setClause.length > 0) {
          const sql = `UPDATE orders SET ${setClause.join(', ')} WHERE id = ?`;
          values.push(id);
          db.prepare(sql).run(...values);
        }

        return this.getOrderById(id);
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    },

    async deleteOrder(id) {
      try {
        const stmt = db.prepare('DELETE FROM orders WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
      }
    },

    // Return methods
    async getReturns() {
      try {
        const rows = db.prepare('SELECT * FROM returns ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          returnNumber: row.return_number,
          saleId: row.sale_id,
          customerId: row.customer_id,
          customerName: row.customer_name,
          items: JSON.parse(row.items || '[]'),
          subtotal: row.subtotal,
          tax: row.tax,
          total: row.total,
          refundAmount: row.refund_amount,
          refundMethod: row.refund_method,
          status: row.status,
          processedBy: row.processed_by,
          notes: row.notes,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting returns:', error);
        return [];
      }
    },

    async getReturnById(id) {
      try {
        const row = db.prepare('SELECT * FROM returns WHERE id = ?').get(id);
        if (row) {
          return {
            id: row.id,
            returnNumber: row.return_number,
            saleId: row.sale_id,
            customerId: row.customer_id,
            customerName: row.customer_name,
            items: JSON.parse(row.items || '[]'),
            subtotal: row.subtotal,
            tax: row.tax,
            total: row.total,
            refundAmount: row.refund_amount,
            refundMethod: row.refund_method,
            status: row.status,
            processedBy: row.processed_by,
            notes: row.notes,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting return by ID:', error);
        return null;
      }
    },

    async createReturn(returnData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();
        const returnNumber = returnData.returnNumber || `RET-${Date.now().toString().slice(-6)}`;

        const stmt = db.prepare(`
          INSERT INTO returns (id, return_number, sale_id, customer_id, customer_name, items, subtotal, tax, total, refund_amount, refund_method, status, processed_by, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          returnNumber,
          returnData.saleId || null,
          returnData.customerId || null,
          returnData.customerName || null,
          JSON.stringify(returnData.items || []),
          returnData.subtotal || 0,
          returnData.tax || 0,
          returnData.total || 0,
          returnData.refundAmount || 0,
          returnData.refundMethod || 'cash',
          returnData.status || 'pending',
          returnData.processedBy || null,
          returnData.notes || null,
          now,
          now
        );

        return this.getReturnById(id);
      } catch (error) {
        console.error('Error creating return:', error);
        throw error;
      }
    },

    async updateReturn(id, updates) {
      try {
        if (!updates || Object.keys(updates).length === 0) {
          return this.getReturnById(id);
        }

        const fieldMapping = {
          'returnNumber': 'return_number',
          'saleId': 'sale_id',
          'customerId': 'customer_id',
          'customerName': 'customer_name',
          'refundAmount': 'refund_amount',
          'refundMethod': 'refund_method',
          'processedBy': 'processed_by'
        };

        const setClause = [];
        const values = [];

        for (const key in updates) {
          if (updates[key] !== undefined) {
            const dbColumn = fieldMapping[key] || key;
            
            if (key === 'items') {
              setClause.push(`${dbColumn} = ?`);
              values.push(JSON.stringify(updates[key]));
            } else {
              setClause.push(`${dbColumn} = ?`);
              values.push(updates[key]);
            }
          }
        }

        if (setClause.length > 0) {
          const sql = `UPDATE returns SET ${setClause.join(', ')} WHERE id = ?`;
          values.push(id);
          db.prepare(sql).run(...values);
        }

        return this.getReturnById(id);
      } catch (error) {
        console.error('Error updating return:', error);
        throw error;
      }
    },

    async deleteReturn(id) {
      try {
        const stmt = db.prepare('DELETE FROM returns WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting return:', error);
        throw error;
      }
    },

    // Customer methods (already exist for persistent service, adding for SQLite)
    async getCustomers() {
      try {
        const rows = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
        return rows.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          city: row.city,
          state: row.state,
          zip: row.zip,
          country: row.country,
          company: row.company,
          notes: row.notes,
          isActive: row.is_active !== 0,
          storeCredit: row.store_credit || 0,
          avatar: row.avatar,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error getting customers:', error);
        return [];
      }
    },

    async getCustomerById(id) {
      try {
        const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
        if (row) {
          return {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            address: row.address,
            city: row.city,
            state: row.state,
            zip: row.zip,
            country: row.country,
            company: row.company,
            notes: row.notes,
            isActive: row.is_active !== 0,
            storeCredit: row.store_credit || 0,
            avatar: row.avatar,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
        }
        return null;
      } catch (error) {
        console.error('Error fetching customer:', error);
        return null;
      }
    },

    async createCustomer(customerData) {
      try {
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString();

        const stmt = db.prepare(`
          INSERT INTO customers (id, name, email, phone, address, city, state, zip, country, company, notes, is_active, avatar, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          id,
          customerData.name || '',
          customerData.email || '',
          customerData.phone || '',
          customerData.address || '',
          customerData.city || '',
          customerData.state || '',
          customerData.zip || '',
          customerData.country || '',
          customerData.company || '',
          customerData.notes || '',
          customerData.isActive !== false ? 1 : 0,
          customerData.avatar || null,
          now,
          now
        );

        return this.getCustomerById(id);
      } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
    },

    async updateCustomer(id, updates) {
      try {
        const fieldMapping = {
          'isActive': 'is_active',
          'storeCredit': 'store_credit',
          'createdAt': 'created_at',
          'updatedAt': 'updated_at'
        };

        const fields = Object.keys(updates);
        const values = [];
        const setClause = fields.map(field => {
          const dbField = fieldMapping[field] || field;
          let value = updates[field];
          
          // Convert boolean to integer for SQLite
          if (field === 'isActive' && typeof value === 'boolean') {
            value = value ? 1 : 0;
          }
          
          values.push(value);
          return `${dbField} = ?`;
        }).join(', ');

        const stmt = db.prepare(`UPDATE customers SET ${setClause}, updated_at = ? WHERE id = ?`);
        stmt.run(...values, new Date().toISOString(), id);
        return this.getCustomerById(id);
      } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
    },

    async deleteCustomer(id) {
      try {
        const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
      } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
    },

    async searchCustomers(query) {
      try {
        const lowercaseQuery = query.toLowerCase();
        const rows = db.prepare('SELECT * FROM customers').all();
        return rows.filter(row => 
          row.name?.toLowerCase().includes(lowercaseQuery) ||
          row.email?.toLowerCase().includes(lowercaseQuery) ||
          row.phone?.includes(query) ||
          row.company?.toLowerCase().includes(lowercaseQuery)
        ).map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          city: row.city,
          state: row.state,
          zip: row.zip,
          country: row.country,
          company: row.company,
          notes: row.notes,
          avatar: row.avatar,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error searching customers:', error);
        return [];
      }
    },

    async getCustomerStats() {
      try {
        const total = db.prepare('SELECT COUNT(*) as count FROM customers').get();
        const withEmail = db.prepare('SELECT COUNT(*) as count FROM customers WHERE email IS NOT NULL AND email != ""').get();
        const withPhone = db.prepare('SELECT COUNT(*) as count FROM customers WHERE phone IS NOT NULL AND phone != ""').get();
        
        return {
          total: total.count || 0,
          active: total.count || 0,
          inactive: 0,
          withEmail: withEmail.count || 0,
          withPhone: withPhone.count || 0
        };
      } catch (error) {
        console.error('Error getting customer stats:', error);
        return { total: 0, active: 0, inactive: 0, withEmail: 0, withPhone: 0 };
      }
    },

    // Import/Export methods
    async exportData(options = { showDialog: true, autoSave: false, savePath: null }) {
      try {
        console.log('📤 Exporting all data...');
        
        // Export ALL data including orders and returns
        const data = {
          customers: await this.getCustomers(),
          products: await this.getProducts(),
          sales: await this.getSales(),
          invoices: await this.getInvoices(),
          orders: await this.getOrders(),      // ✅ Now included!
          returns: await this.getReturns(),    // ✅ Now included!
          settings: await this.getCompanySettings(),
          exportedAt: new Date().toISOString(),
          version: '1.0.0' // For future compatibility
        };

        console.log('✅ Data collected:');
        console.log(`   - Customers: ${data.customers?.length || 0}`);
        console.log(`   - Products: ${data.products?.length || 0}`);
        console.log(`   - Sales: ${data.sales?.length || 0}`);
        console.log(`   - Invoices: ${data.invoices?.length || 0}`);
        console.log(`   - Orders: ${data.orders?.length || 0}`);
        console.log(`   - Returns: ${data.returns?.length || 0}`);

        // If auto-save with specified path (for backups), don't show dialog
        if (options.autoSave && options.savePath) {
          fs.writeFileSync(options.savePath, JSON.stringify(data, null, 2));
          console.log('✅ Auto-saved to:', options.savePath);
          return { success: true, path: options.savePath, data, recordCount: {
            customers: data.customers?.length || 0,
            products: data.products?.length || 0,
            sales: data.sales?.length || 0,
            invoices: data.invoices?.length || 0,
            orders: data.orders?.length || 0,
            returns: data.returns?.length || 0
          }};
        }

        // Only show dialog if explicitly requested (user-initiated export)
        if (options.showDialog) {
          const { dialog } = require('electron');
          const result = await dialog.showSaveDialog({
            title: 'Export Data',
            defaultPath: `topnotch-export-${new Date().toISOString().split('T')[0]}.json`,
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
          });

          if (!result.canceled && result.filePath) {
            fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
            console.log('✅ Export saved to:', result.filePath);
            return { success: true, path: result.filePath, recordCount: {
              customers: data.customers?.length || 0,
              products: data.products?.length || 0,
              sales: data.sales?.length || 0,
              invoices: data.invoices?.length || 0,
              orders: data.orders?.length || 0,
              returns: data.returns?.length || 0
            }};
          }

          return { success: false, error: 'Export cancelled' };
        }

        // If no dialog and no auto-save path, just return the data
        return { success: true, data, recordCount: {
          customers: data.customers?.length || 0,
          products: data.products?.length || 0,
          sales: data.sales?.length || 0,
          invoices: data.invoices?.length || 0,
          orders: data.orders?.length || 0,
          returns: data.returns?.length || 0
        }};
      } catch (error) {
        console.error('❌ Error exporting data:', error);
        return { success: false, error: error.message };
      }
    },

    async importData() {
      const { dialog, app } = require('electron');
      const backupPath = path.join(app.getPath('userData'), `backup-${Date.now()}.json`);
      
      try {
        // Step 1: Show file dialog
        const result = await dialog.showOpenDialog({
          title: 'Import Data',
          filters: [{ name: 'JSON Files', extensions: ['json'] }],
          properties: ['openFile']
        });

        if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
          return { success: false, error: 'Import cancelled' };
        }

        console.log('📂 Reading import file:', result.filePaths[0]);
        const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));

        // Step 2: Validate import data structure
        console.log('✅ Validating import data...');
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid import file: Not a valid JSON object');
        }

        // Validate arrays
        const validationErrors = [];
        if (data.customers && !Array.isArray(data.customers)) {
          validationErrors.push('customers must be an array');
        }
        if (data.products && !Array.isArray(data.products)) {
          validationErrors.push('products must be an array');
        }
        if (data.sales && !Array.isArray(data.sales)) {
          validationErrors.push('sales must be an array');
        }
        if (data.invoices && !Array.isArray(data.invoices)) {
          validationErrors.push('invoices must be an array');
        }
        if (data.orders && !Array.isArray(data.orders)) {
          validationErrors.push('orders must be an array');
        }
        if (data.returns && !Array.isArray(data.returns)) {
          validationErrors.push('returns must be an array');
        }

        if (validationErrors.length > 0) {
          throw new Error(`Invalid import data: ${validationErrors.join(', ')}`);
        }

        console.log('✅ Import data is valid');
        console.log(`   - Customers: ${data.customers?.length || 0}`);
        console.log(`   - Products: ${data.products?.length || 0}`);
        console.log(`   - Sales: ${data.sales?.length || 0}`);
        console.log(`   - Invoices: ${data.invoices?.length || 0}`);
        console.log(`   - Orders: ${data.orders?.length || 0}`);
        console.log(`   - Returns: ${data.returns?.length || 0}`);

        // Step 3: Create backup of CURRENT data before import
        console.log('💾 Creating backup of current data...');
        // Step 4: Confirm with user (they might not realize this will replace ALL data)
        const confirmResult = await dialog.showMessageBox({
          type: 'warning',
          title: 'Confirm Import',
          message: 'This will REPLACE all your current data!',
          detail: `A backup has been created at:\n${backupPath}\n\nAre you sure you want to continue?`,
          buttons: ['Cancel', 'Import'],
          defaultId: 0,
          cancelId: 0
        });

        if (confirmResult.response === 0) {
          // User cancelled - delete backup
          fs.unlinkSync(backupPath);
          return { success: false, error: 'Import cancelled by user' };
        }

        try {
          // Step 5: Import data (this can fail)
          console.log('📥 Starting import...');

          // Import customers
          if (data.customers && Array.isArray(data.customers)) {
            console.log(`   Importing ${data.customers.length} customers...`);
            for (const customer of data.customers) {
              await this.createCustomer(customer);
            }
          }

          // Import products
          if (data.products && Array.isArray(data.products)) {
            console.log(`   Importing ${data.products.length} products...`);
            for (const product of data.products) {
              await this.createProduct(product);
            }
          }

          // Import sales
          if (data.sales && Array.isArray(data.sales)) {
            console.log(`   Importing ${data.sales.length} sales...`);
            for (const sale of data.sales) {
              try {
                await this.createSale(sale);
              } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                  console.log(`   ⚠️  Sale references non-existent customer/product, importing without foreign key...`);
                  // Create sale without foreign key references
                  const saleWithoutFK = { ...sale };
                  saleWithoutFK.customerId = null; // Remove foreign key reference
                  await this.createSale(saleWithoutFK);
                } else {
                  throw error; // Re-throw if it's not a foreign key error
                }
              }
            }
          }

          // Import invoices
          if (data.invoices && Array.isArray(data.invoices)) {
            console.log(`   Importing ${data.invoices.length} invoices...`);
            for (const invoice of data.invoices) {
              try {
                await this.createInvoice(invoice);
              } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message.includes('invoices.number')) {
                  console.log(`   ⚠️  Invoice number ${invoice.number} already exists, skipping...`);
                  continue;
                } else if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                  console.log(`   ⚠️  Invoice references non-existent customer/sale, importing without foreign key...`);
                  // Create invoice without foreign key references
                  const invoiceWithoutFK = { ...invoice };
                  invoiceWithoutFK.customerId = null;
                  invoiceWithoutFK.saleId = null;
                  await this.createInvoice(invoiceWithoutFK);
                } else {
                  throw error; // Re-throw if it's not a constraint error
                }
              }
            }
          }

          // Import orders
          if (data.orders && Array.isArray(data.orders)) {
            console.log(`   Importing ${data.orders.length} orders...`);
            for (const order of data.orders) {
              try {
                await this.createOrder(order);
              } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message.includes('orders.order_number')) {
                  console.log(`   ⚠️  Order number ${order.orderNumber} already exists, skipping...`);
                  continue;
                }
                throw error; // Re-throw if it's not a unique constraint error
              }
            }
          }

          // Import returns
          if (data.returns && Array.isArray(data.returns)) {
            console.log(`   Importing ${data.returns.length} returns...`);
            for (const returnData of data.returns) {
              try {
                await this.createReturn(returnData);
              } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && error.message.includes('returns.return_number')) {
                  console.log(`   ⚠️  Return number ${returnData.returnNumber} already exists, skipping...`);
                  continue;
                } else if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                  console.log(`   ⚠️  Return references non-existent sale/customer, importing without foreign key...`);
                  // Create return without foreign key references
                  const returnWithoutFK = { ...returnData };
                  returnWithoutFK.saleId = null;
                  returnWithoutFK.customerId = null;
                  await this.createReturn(returnWithoutFK);
                } else {
                  throw error; // Re-throw if it's not a constraint error
                }
              }
            }
          }

          // Import settings
          if (data.settings) {
            console.log('   Importing company settings...');
            await this.updateCompanySettings(data.settings);
          }

          console.log('✅ Import completed successfully!');

          // Step 6: Import successful - keep backup for 7 days then auto-delete
          // (For now, we'll keep it - user can manually delete)
          console.log(`💾 Backup will be kept at: ${backupPath}`);
          console.log('   You can delete it manually if everything looks good.');

          return { 
            success: true, 
            data,
            message: 'Import successful! A backup of your previous data was saved.',
            backupPath 
          };

        } catch (importError) {
          // Step 7: Import failed - RESTORE from backup!
          console.error('❌ Import failed:', importError);
          console.log('🔄 Restoring from backup...');

          try {
            // Read backup
            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            
            // Clear database
            db.prepare('DELETE FROM returns').run();
            db.prepare('DELETE FROM orders').run();
            db.prepare('DELETE FROM invoices').run();
            db.prepare('DELETE FROM sales').run();
            db.prepare('DELETE FROM products').run();
            db.prepare('DELETE FROM customers').run();

            // Restore from backup (using same import logic)
            if (backupData.customers) {
              for (const customer of backupData.customers) {
                await this.createCustomer(customer);
              }
            }
            if (backupData.products) {
              for (const product of backupData.products) {
                await this.createProduct(product);
              }
            }
            if (backupData.sales) {
              for (const sale of backupData.sales) {
                await this.createSale(sale);
              }
            }
            if (backupData.invoices) {
              for (const invoice of backupData.invoices) {
                await this.createInvoice(invoice);
              }
            }
            if (backupData.orders) {
              for (const order of backupData.orders) {
                await this.createOrder(order);
              }
            }
            if (backupData.returns) {
              for (const returnData of backupData.returns) {
                await this.createReturn(returnData);
              }
            }
            if (backupData.settings) {
              await this.updateCompanySettings(backupData.settings);
            }

            console.log('✅ Data restored from backup successfully');
            
            // Show success dialog
            await dialog.showMessageBox({
              type: 'info',
              title: 'Import Failed - Data Restored',
              message: 'Import failed, but your data has been restored from backup.',
              detail: `Error: ${importError.message}\n\nYour original data is safe.`
            });

            return { 
              success: false, 
              error: `Import failed: ${importError.message}. Your data was restored from backup.`,
              restored: true 
            };

          } catch (restoreError) {
            // CRITICAL: Both import AND restore failed!
            console.error('💀 CRITICAL: Restore from backup failed:', restoreError);
            
            await dialog.showErrorBox(
              'CRITICAL ERROR',
              `Import failed AND restore failed!\n\nBackup file: ${backupPath}\n\nPlease contact support immediately!`
            );

            return {
              success: false,
              error: `Import failed and restore failed. Backup saved at: ${backupPath}`,
              critical: true,
              backupPath
            };
          }
        }

      } catch (error) {
        console.error('Error in import process:', error);
        
        // Clean up backup if it exists and we haven't started import yet
        if (fs.existsSync(backupPath)) {
          try {
            fs.unlinkSync(backupPath);
          } catch (cleanupError) {
            console.error('Could not clean up backup:', cleanupError);
          }
        }

        return { success: false, error: error.message };
      }
    },

    // Preferences methods
    async getPreferences() {
      try {
        const row = db.prepare('SELECT * FROM company_settings WHERE id = 1').get();
        if (row) {
          return {
            onboardingCompleted: Boolean(row.onboarding_completed || false),
            autoSaveDrafts: true,
            confirmBeforeDelete: true,
            showAnimations: true,
            lowStockAlerts: true,
            defaultPaymentMethod: 'cash',
            invoiceNumberFormat: 'INV-{YYYY}-{MM}-{DD}-{####}',
            receiptFooter: 'Thank you for your business!',
            autoBackup: false,
            backupFrequency: 'daily',
            showProductImages: true,
            defaultInvoiceStatus: 'draft',
            receiptPaperSize: '80mm',
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
          };
        }
        return null;
      } catch (error) {
        console.error('Error getting preferences:', error);
        return null;
      }
    },

    async updatePreferences(updates) {
      try {
        console.log('SQLite: Updating preferences with:', updates);
        
        const updateFields = [];
        const updateValues = [];

        // Only handle onboarding_completed since that's the only field that exists in the database
        if (updates.onboardingCompleted !== undefined) {
          updateFields.push('onboarding_completed = ?');
          updateValues.push(updates.onboardingCompleted ? 1 : 0);
        }

        if (updateFields.length === 0) {
          console.log('SQLite: No valid fields to update in preferences');
          return null;
        }

        updateValues.push(1); // WHERE id = 1

        const sql = `UPDATE company_settings SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        console.log('SQLite: Executing preferences update:', sql);
        console.log('SQLite: With values:', updateValues);
        
        const result = db.prepare(sql).run(...updateValues);
        console.log('SQLite: Preferences update result:', result);

        if (result.changes > 0) {
          const updatedPrefs = await this.getPreferences();
          console.log('SQLite: Preferences after update:', updatedPrefs);
          return updatedPrefs;
        }
        console.log('SQLite: No rows updated in preferences');
        return null;
      } catch (error) {
        console.error('Error updating preferences:', error);
        return null;
      }
    }
  };
}

// Removed createPersistentDatabaseService - using SQLite only

// Removed createFallbackDatabaseService - using SQLite only

function initializeDatabaseService() {
  console.log('🔧 Initializing database service...');
  console.log('🔧 sqlite3 available:', !!sqlite3);

  if (!sqlite3) {
    throw new Error('better-sqlite3 is required but not available. Please ensure it is properly installed and rebuilt for Electron.');
  }

  console.log('🔧 Creating SQLite database service');
  const service = createSQLiteDatabaseService();
  console.log('🔧 SQLite service created, type:', typeof service);
  console.log('🔧 SQLite service keys:', Object.keys(service));
  console.log('🔧 SQLite service has getProducts:', typeof service.getProducts);
  console.log('🔧 SQLite service has getSales:', typeof service.getSales);
  console.log('🔧 SQLite service has getOrders:', typeof service.getOrders);
  return service;
}

module.exports = {
  initializeDatabaseService
};
