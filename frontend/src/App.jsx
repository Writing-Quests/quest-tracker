import { useState, useEffect } from 'react'
import './App.css'
import {
  UserRegister,
  UserVerifyEmail,
  UserLogin,
  UserProfile,
  UserResetPasswordRequest,UserResetPasswordFinish
} from './User.jsx'
import Login from './components/Login'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import api from './services/api'

export function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loggedIn, setLoggedIn] = useState(null)

  useEffect(() => { getLoggedInUser() }, [])

  async function getLoggedInUser() {
    setLoading(true)
    try {
      const resp = await api('users/$me', {
         validateStatus: function (status) {
           return (status >= 200 && status < 300) || status === 400;
        }
      })
      if(resp.status === 400) {
        setLoggedIn(false)
      } else {
        setLoggedIn(true)
      }
    } catch (e) {
      console.log(e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  if(loading) {
    return <div>Loading&hellip;</div>
  }
  if(error) {
    return <div>Error: {JSON.stringify(error)}</div>
  }

  if(loggedIn) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserProfile />} />
          <Route path="/verify" element={<UserVerifyEmail />} />
        </Routes>
      </BrowserRouter>
    )
  } else {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/verify" element={<UserVerifyEmail />} />
          <Route path="/reset" element={<UserResetPasswordRequest />} />
          <Route path="/resetform" element={<UserResetPasswordFinish />} />
          <Route path="/login" element={<UserLogin />} />
        </Routes>
      </BrowserRouter>
    )
  }

}

