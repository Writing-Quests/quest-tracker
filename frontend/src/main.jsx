import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
import { UserRegister, UserVerifyEmail, UserLogin, UserViewProfile, UserEditProfile, UserResetPasswordRequest,UserResetPasswordFinish } from './User.jsx'
import './index.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/verify" element={<UserVerifyEmail />} />
      <Route path="/reset" element={<UserResetPasswordRequest />} />
      <Route path="/resetform" element={<UserResetPasswordFinish />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/profile/:username" element={<UserViewProfile />} />
      <Route path="/profile/edit" element={<UserEditProfile />} />
    </Routes>
    </BrowserRouter>
    <App />
  </StrictMode>,
)
