import { useState } from 'react'
import './App.css'

const API_URL = 'http://quest-tracker.lndo.site/api/'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState({})
  const [resp2, setResp2] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    const resp = await fetch(API_URL+'login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    setResp(resp)
  }
  async function handleClick(e) {
    e.preventDefault()
    const resp = await fetch(API_URL+'test', {
      credentials: 'include',
    })
    setResp2(resp)
  }
  return (
    <>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} />
        <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} />
        <input type='submit' />
      </form>
      <h2>Response</h2>
      {JSON.stringify(resp)}
      <hr />
      <button onClick={handleClick}>Test</button>
      <h2>Response</h2>
      {JSON.stringify(resp2)}
    </>
  )
}

export default App
