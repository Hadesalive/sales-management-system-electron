import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { SalesProvider } from './contexts/SalesContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <SalesProvider>
            <App />
          </SalesProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
