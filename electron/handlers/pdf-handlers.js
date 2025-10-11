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
    console.log('Puppeteer browser launched successfully');
  }
  return browser;
}

function setupPdfHandlers() {
  console.log('Registering PDF handlers...');

  // Generate PDF from HTML content sent from renderer
  ipcMain.handle('generate-invoice-pdf-from-html', async (event, { htmlContent }) => {
    try {
      console.log('Generating PDF from HTML...');
      
      // Convert HTML to PDF using Puppeteer
      const browserInstance = await getBrowser();
      const page = await browserInstance.newPage();
      
      console.log('Setting page content...');
      console.log('HTML length:', htmlContent.length);
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Debug: Check if elements exist and have styles
      const elementInfo = await page.evaluate(() => {
        const elements = document.querySelectorAll('.print-invoice');
        return {
          count: elements.length,
          elements: Array.from(elements).map((el, index) => ({
            index,
            hasBorder: window.getComputedStyle(el).border !== 'none',
            borderWidth: window.getComputedStyle(el).borderWidth,
            borderColor: window.getComputedStyle(el).borderColor,
            borderStyle: window.getComputedStyle(el).borderStyle,
            borderRadius: window.getComputedStyle(el).borderRadius,
            boxShadow: window.getComputedStyle(el).boxShadow,
            inlineStyle: el.getAttribute('style')
          }))
        };
      });
      
      console.log('Element debug info:', JSON.stringify(elementInfo, null, 2));
      
      // Wait for Tailwind and rendering
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to wait for fonts, but handle if frame is detached
      try {
        await page.evaluate(async () => {
          if (document.fonts) {
            await document.fonts.ready;
          }
        });
      } catch (error) {
        console.log('Font wait skipped (frame detached):', error.message);
      }
      
      // No custom styling - render exactly as captured from preview

      console.log('Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        }
      });
      
      await page.close();
      
      console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
      
      // Convert to Buffer if it's a Uint8Array
      const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
      
      // Return PDF as base64 for IPC transfer
      const base64String = buffer.toString('base64');
      console.log('Base64 string length:', base64String.length);
      
      return base64String;
      
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
  
  console.log('PDF handlers registered successfully');
}

module.exports = {
  setupPdfHandlers
};

