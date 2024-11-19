import { useState, useEffect } from 'react'
import {
  UserVerifyEmail,
  UserResetPasswordFinish
} from './components/User'
import EditProject from './components/EditProject'
import Profile from './components/User/Profile'
import Login from './components/Login'
import Settings from './components/Settings'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import api from './services/api'
import Context from './services/context'
import useTitle from './services/useTitle'
import Loading from './components/Loading'
import { ErrorContainer } from './components/Containers'
import { PrivacyPolicy } from './components/Static/Privacy'
import { TermsOfUse } from './components/Static/Terms'
import { AboutQuesty } from './components/Static/About'
import { ReviewReport } from './components/Admin/Report'
import Modal from 'react-modal'

const { LoggedInUserContext, GetLoggedInUserContext } = Context

export function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loggedIn, setLoggedIn] = useState(null)
  const [data, setData] = useState(null)
  Modal.setAppElement('#root')
  useEffect(() => { getLoggedInUser() }, [])

  let title = ''
  if(loading) { title = 'Loading...' }
  useTitle(title)

  async function getLoggedInUser() {
    setLoading(true)
    try {
      const resp = await api('me')
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
    return <Loading fullPage={true} />
  }
  if(error) {
    return <div style={{marginTop: 50}}>
      <ErrorContainer error={error} />
    </div>
  }

  if(loggedIn) {
    return (
      <LoggedInUserContext.Provider value={data}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/project/new" element={<EditProject />} />
            <Route path="/project/:projectCode" element={<EditProject />} />
            <Route path="/verify" element={<UserVerifyEmail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<AboutQuesty />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin/report/:code" element={<ReviewReport />} />
            <Route path="*" element={<Navigate to='/' replace />} />
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
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/about" element={<AboutQuesty />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to='/' replace />} />
          </Routes>
        </BrowserRouter>
      </GetLoggedInUserContext.Provider>
    )
  }

}
