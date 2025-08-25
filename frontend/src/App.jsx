import { useState, useEffect } from 'react'
import {
  UserVerifyEmail,
  UserResetPasswordFinish
} from './components/User'
import EditProject from './components/EditProject'
import Profile from './components/User/Profile'
import {Connections } from './components/User/Connections'
import Login from './components/Login'
import Settings from './components/Settings'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import api from './services/api'
import Context from './services/context'
import useTitle from './services/useTitle'
import Loading from './components/Loading'
import { ErrorContainer } from './components/Containers'
import { PrivacyPolicy } from './components/Static/Privacy'
import { TermsOfUse } from './components/Static/Terms'
import { AboutQuesty } from './components/Static/About'
import { ReviewReport } from './components/Admin/Report'
import { HomeFeed, PublicFeed, BuddyFeed, QuestsFeed } from './components/Feed'
import Modal from 'react-modal'
import {UserProjects, ViewProject} from './components/User/Projects'

const { LoggedInUserContext, GetLoggedInUserContext } = Context

function NavigateWithPath () {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    navigate(`/login?ref=${encodeURIComponent(location.pathname)}`)
  }, [navigate, location])
}

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
  
  // eslint-disable-next-line no-unused-vars
  async function getLoggedInUser(ref=null) {
    /* TODO: 2024-04-02 - I got as far as passing the reference, re: where the user was trying to go, here (if it exists.) But then I'm stumped as to how best/effectively reroute the user data with it */
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
            <Route path="/" element={<HomeFeed />} />
            <Route path="/profiles/public" element={<PublicFeed />} />
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/projects" element={<UserProjects />} />
            <Route path="/project/new" element={<EditProject />} />
            <Route path="/project/view/:projectCode" element={<ViewProject />} />
            <Route path="/project/edit/:projectCode" element={<EditProject />} />
            <Route path="/verify" element={<UserVerifyEmail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/buddies" element={<BuddyFeed />} />
            <Route path="/quests" element={<QuestsFeed />} />
            <Route path="/connections" element={<Connections />} />
            {/* <Route path="/connections/manage" element={<ConnectionLink />} /> */}
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
      <GetLoggedInUserContext.Provider value={getLoggedInUser} path={window.location.href}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login form='login' />} />
            <Route path="/profiles/public" element={<PublicFeed />} />
            <Route path="/register" element={<Login form='register'/>} />
            <Route path="/reset" element={<Login form='reset' />} />
            <Route path="/verify" element={<UserVerifyEmail />} />
            <Route path="/resetform" element={<UserResetPasswordFinish />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile/:username?" element={<Profile />} />
            <Route path="/project/view/:projectCode" element={<ViewProject />} />
            <Route path="/about" element={<AboutQuesty />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/*<Route path="*" element={<Navigate to='/' replace />} />*/}
            <Route path="*" element={<NavigateWithPath />} />
          </Routes>
        </BrowserRouter>
      </GetLoggedInUserContext.Provider>
    )
  }

}
