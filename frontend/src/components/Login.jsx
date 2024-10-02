import { useState, useContext } from 'react'
import styled from 'styled-components'
import api from '../services/api'
import Context from '../services/context'
import useTitle from '../services/useTitle'
import Input from './Forms/Input'
import InputGroup from './Forms/InputGroup'
import Page from './Page'
import { AnimatedContainer, CenteredContainer } from './Containers'

const { GetLoggedInUserContext } = Context

const ErrorContainer = styled.div`
  width: 100%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
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
    <Page>
      <AnimatedContainer>
        <CenteredContainer>
          <h1 style={{color: 'white', fontWeight: '900', fontSize: '2.5rem'}}>Welcome!</h1>
          {(error && error.status === 400) && <ErrorContainer><strong>Incorrect username/password.</strong> Try again or create a new account.</ErrorContainer>}
          {(error && error.status !== 400) && <ErrorContainer>Unknown error. Try again.</ErrorContainer>}
          <form onSubmit={handleSubmit}>
            <InputGroup>
              <Input label='Username' type='text' value={username} onChange={e => setUsername(e.target.value)} {...formProps} />
              <Input label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)} {...formProps} />
            </InputGroup>
            <Input type='submit' value='Login' {...formProps} />
          </form>
        </CenteredContainer>
      </AnimatedContainer>
    </Page>
  )
}
