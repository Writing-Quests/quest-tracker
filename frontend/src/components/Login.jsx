import { useState, useContext } from 'react'
import styled from 'styled-components'
import api from '../services/api'
import Context from '../services/context'
import useTitle from '../services/useTitle'
import wave from '../wave.svg'

const { GetLoggedInUserContext } = Context

const AnimatedContainer = styled.div`
  height: 100%;
  margin-top: 20px;
  background-color: var(--color-primary);
  &::before {
    content: '';
    display: block;
    background-image: url("${wave}");
    background-position: '0 0';
    background-repeat: repeat-x;
    width: 100vw;
    height: 20px;
    position: relative;
    top: -20px;
  }
  &::after {
    content: '';
    background-image: url("${wave}");
    display: block;
    background-repeat: repeat-x;
    width: 100vw;
    height: 20px;
    transform: rotate(180deg);
    position: relative;
    top: 20px;
  }
`

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
      <div>Writing Quests</div>
      <AnimatedContainer>
        <h1>Login</h1>
        {error && <div>Error: {JSON.stringify(error)}</div>}
        <form onSubmit={handleSubmit}>
          <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} {...formProps} />
          <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} {...formProps} />
          <input type='submit' value='Login' {...formProps} />
        </form>
      </AnimatedContainer>
    </>
  )
}
