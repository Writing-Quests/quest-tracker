import { useState, useEffect } from 'react'
import {
  UserVerifyEmail,
  UserResetPasswordFinish
} from './components/User'
import UserProfile from './components/User/Profile'
import Login from './components/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import api from './services/api'
import Context from './services/context'
import useTitle from './services/useTitle'

const { LoggedInUserContext, GetLoggedInUserContext } = Context

export function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loggedIn, setLoggedIn] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => { getLoggedInUser() }, [])

  let title = ''
  if(loading) { title = 'Loading...' }
  useTitle(title)

  async function getLoggedInUser() {
    setLoading(true)
    try {
      const resp = await api('users/$me')
      if(resp.data?.anonymousUser || !resp.data?.username) {
        setLoggedIn(false)
      } else {
        setLoggedIn(true)
        setData(resp.data)
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
      <LoggedInUserContext.Provider value={data}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UserProfile />} />
            <Route path="/profile/:username?" element={<UserProfile />} />
            <Route path="/verify" element={<UserVerifyEmail />} />
          </Routes>
        </BrowserRouter>
      </LoggedInUserContext.Provider>
    )
  } else {
    return (
      <GetLoggedInUserContext.Provider value={getLoggedInUser}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login form='login' />} />
            <Route path="/register" element={<Login form='register'/>} />
            <Route path="/reset" element={<Login form='reset' />} />
            <Route path="/verify" element={<UserVerifyEmail />} />
            <Route path="/resetform" element={<UserResetPasswordFinish />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:username?" element={<UserProfile />} />
          </Routes>
        </BrowserRouter>
      </GetLoggedInUserContext.Provider>
    )
  }

}
