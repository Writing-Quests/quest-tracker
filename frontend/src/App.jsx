import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './App.css'

export const API_URL = 'http://quest-tracker.lndo.site/api/'

export function TempMenu (attr) {
  const navigate = useNavigate()
  async function sendLogout() {
    console.log('clicked logout')
    const logout_resp = await (await fetch(API_URL+'logout',{
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    })).json()
    if (logout_resp === true) {
      navigate(`/login`, { state: {
        'notices': [
          {id: 'loggedOut', text: 'You have been logged out.' }
        ]}
      })
    }
  }
  if (attr.loggedIn) {
    const profileURL = "/profile/"+attr.username
    return (
      <div id="tempMenu">
        <Link to={profileURL}>View Profile</Link>
        <a href="#" onClick={sendLogout}>Logout</a>
      </div>
    ) 
  } else {
    return (
      <div id="tempMenu">
        <Link to="/login">Login</Link>
        <Link to="/register">Create an Account</Link>
        <Link to="/reset">Reset Your Password</Link>
      </div>
    )
  }
}

export function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState()
  const [resp2, setResp2] = useState()
  useEffect(() => {
    handleClick()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const resp = await (await fetch(API_URL+'login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })).json()
    setResp(resp)
  }
  async function handleClick(e) {
    e && e.preventDefault()
    const resp = await (await fetch(API_URL+'whoami', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    setResp2(resp)
  }
  return (
    <>
      <p>Note: /login redirects here (/) unless they were trying to access a login-protected page that was stored in the state. This way they're not logging in against and again when already logged in.</p>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} />
        <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} />
        <input type='submit' />
      </form>
      <h2>Response</h2>
      {JSON.stringify(resp)}
      <hr />
      <button onClick={handleClick}>Who am I?</button>
      <h2>Response</h2>
      {JSON.stringify(resp2)}
    </>
  )
}

