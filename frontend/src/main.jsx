import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, RegisterUser, VerifyEmail } from './App.jsx'
import './index.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/verify" element={<VerifyEmail />} />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
