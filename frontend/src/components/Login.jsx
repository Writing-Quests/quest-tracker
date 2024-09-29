import { useState, useContext } from 'react'
import styled from 'styled-components'
import api from '../services/api'
import Context from '../services/context'
import useTitle from '../services/useTitle'
import wave from '../assets/wave.svg'
import Input from './Input'
import InputGroup from './InputGroup'

const { GetLoggedInUserContext } = Context

const ErrorContainer = styled.div`
  width: 100%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
`

const LogoContainer = styled.div`
  max-width: 500px;
  display: flex;
  margin: auto;
  margin-top: 20px;
  margin-bottom: 50px;
  justify-content: center;
  align-items: center;
`

const SiteTitle = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 35px;
  font-weight: bold;
  color: var(--color-primary);
  margin-left: 10px;
`

const AnimatedContainer = styled.div`
  min-height: calc(100vh - 250px);
  margin-top: 20px;
  background-color: var(--color-primary);
  position: relative;
  padding-bottom: 30px;
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
    position: absolute;
    bottom: -20px;
  }
`

const CenteredContainer = styled.div`
  margin: auto;
  max-width: min(500px, calc(100vw - 40px));
  display: flex;
  flex-direction: column;
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
      <LogoContainer>
        <img src='/logo.svg' style={{maxWidth: '75px'}} />
        <SiteTitle>Writing Quests</SiteTitle>
      </LogoContainer>
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
      <CenteredContainer style={{textAlign: 'center', marginTop: '40px', fontSize: '0.7rem', marginBottom: '30px'}}>
        <span>Copyright © {new Date().getFullYear()}</span>
        <br />
        <span>Learn more at <a href='https://writingquests.org'>writingquests.org</a></span>
      </CenteredContainer>
    </>
  )
}
