/* eslint-disable @typescript-eslint/no-require-imports */
const { ipcMain } = require('electron');
const puppeteer = require('puppeteer');

// Polyfill for ReadableStream (required for Puppeteer in Electron)
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web');
  globalThis.ReadableStream = ReadableStream;
}

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.log('Error closing old browser:', error.message);
      }
    }
    
    console.log('Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }
  return browser;
}

function setupPdfHandlers() {
  // Generate PDF from HTML content sent from renderer
  ipcMain.handle('generate-invoice-pdf-from-html', async (event, { htmlContent }) => {
    try {
      // Convert HTML to PDF using Puppeteer
      const browserInstance = await getBrowser();
      const page = await browserInstance.newPage();
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Wait for Tailwind and rendering
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to wait for fonts, but handle if frame is detached
      try {
        await page.evaluate(async () => {
          if (document.fonts) {
            await document.fonts.ready;
          }
        });
      } catch {
        // Font wait skipped (frame detached)
      }
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        // Zero margins - templates have internal padding
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });
      
      await page.close();
      
      // Convert to Buffer if it's a Uint8Array
      const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
      
      // Return PDF as base64 for IPC transfer
      return buffer.toString('base64');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  });
  
  // Cleanup on app quit
  process.on('exit', async () => {
    if (browser) {
      await browser.close();
    }
  });
  
  // Handle PDF download using Electron's native file dialog
  ipcMain.handle('download-pdf-file', async (event, { pdfBase64, filename }) => {
    try {
      const { dialog } = require('electron');
      const fs = require('fs');
      
      // Show save dialog
      const result = await dialog.showSaveDialog({
        title: 'Save PDF Invoice',
        defaultPath: filename,
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) {
        return { success: false, error: 'User cancelled save dialog' };
      }
      
      // Convert base64 to buffer and save
      const buffer = Buffer.from(pdfBase64, 'base64');
      fs.writeFileSync(result.filePath, buffer);
      
      return { success: true, filePath: result.filePath };
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = {
  setupPdfHandlers
};

