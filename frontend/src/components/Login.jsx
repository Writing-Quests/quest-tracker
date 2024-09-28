import { useState, useEffect } from 'react'
import '../App.css'
import api from '../services/api'
import CONSTS from '../CONSTS'

const { API_URL } = CONSTS

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState()
  const [resp2, setResp2] = useState()
  //useEffect(() => {
    //handleClick()
  //}, [])

  function handleSubmit(e) {
    e.preventDefault();
    (async () => {
      const resp = await (await fetch(API_URL+'auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })).json()
      setResp(resp)
      //const resp = await api.post('auth/login', { username, password }, { withCredentials: false })
      //if(resp.data?.loggedIn) {
        //window.location = '/'
      //}
      //setResp(resp)
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

