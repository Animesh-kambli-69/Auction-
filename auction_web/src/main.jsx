import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Nav, { AuthProvider } from './components/nav bar/nav.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Nav />
      <App />
    </AuthProvider>
  </StrictMode>,
)
