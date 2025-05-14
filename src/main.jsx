import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserPreferencesProvider } from './context/UserPreferencesContext.jsx'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserPreferencesProvider>
      <App />
    </UserPreferencesProvider>
  </BrowserRouter>
)