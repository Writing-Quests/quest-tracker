import { useState } from 'react'
import '../App.css'
import api from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState()
  const [resp2, setResp2] = useState()

  function handleSubmit(e) {
    e.preventDefault();
    (async () => {
      const resp = await api.post('auth/login', { username, password })
      if(resp.data?.loggedIn) {
        window.location = '/'
      }
      setResp(resp)
    })()
  }
  async function handleClick(e) {
    e?.preventDefault()
    const resp = await api('users/$me')
    setResp2(resp.data)
  }
  return (
    <>
      <h1>Loginn</h1>
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

