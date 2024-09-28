import { useState, useContext } from 'react'
import '../App.css'
import api from '../services/api'
import Context from '../services/context'
import useTitle from '../services/useTitle'

const { GetLoggedInUserContext } = Context

export default function Login() {
  useTitle('Login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const getLoggedInUser = useContext(GetLoggedInUserContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  function handleSubmit(e) {
    e.preventDefault();
    (async () => {
      setLoading(true)
      try {
        const resp = await api.post('auth/login', { username, password })
        if(resp.data?.loggedIn) {
          getLoggedInUser()
        }
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }
  const formProps = {disabled: loading}
  return (
    <>
      <h1>Login</h1>
      {error && <div>Error: {JSON.stringify(error)}</div>}
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} {...formProps} />
        <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} {...formProps} />
        <input type='submit' value='Login' {...formProps} />
      </form>
    </>
  )
}
