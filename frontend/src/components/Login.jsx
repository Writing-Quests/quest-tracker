import { useState, useContext } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import api from '../services/api'
import Context from '../services/context'
import useTitle from '../services/useTitle'
import Input, { Button } from './Forms/Input'
import InputGroup from './Forms/InputGroup'
import Page from './Page'
import { getUserTZName } from '../timezones.js'
import { AnimatedContainer, CenteredContainer, ErrorContainer, SuccessContainer, ContentBlock } from './Containers'
import Notices from './Notices'

const { GetLoggedInUserContext } = Context

const BackLink = styled.a`
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 0.02rem;
  opacity: 0.9;
  &:hover, &:focus {
    text-decoration: underline;
    opacity: 1;
  }
`

function PasswordResetForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function submitResetPassword(e) {
    e && e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const apiResult = await api.post('password/$reset/', {email})
      console.log(apiResult)
      if (!apiResult.data?.emailSent) { // email not sent
        const errorMessage = apiResult.data.errors?.[0]?.text || "password reset request wasn't processed"
        setError(`Error: ${errorMessage}`)
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Error: password reset request wasn't processed.")
    } finally {
      setLoading(false)
    }
  }
  const formProps = {disabled: loading}
  return <>
    <h2 style={{color: 'white'}}>Reset your password</h2>
    {success && <SuccessContainer>Success! Your password reset link has been sent to your email address. The link will expire in 24 hours.</SuccessContainer>}
    {error && <ErrorContainer>{error}</ErrorContainer>}
    {success || <form onSubmit={submitResetPassword}>
      <Input type='email' id='email' placeholder='you@example.com' required value={email} onChange={(e) => setEmail(e.target.value)} label='Email address' {...formProps} />
      <Input type="submit" value="Reset password" />
    </form>}
  </>
}

function RegisterForm({onSuccess}) {
  useTitle('New account')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function handleSubmit (e) {
    e && e.preventDefault()
    setLoading(true)
    try {
      const currentTimezoneOffset = (new Date().getTimezoneOffset()/60) * -1 // not using this right now, but we have it
      const data = {
        timezone: getUserTZName(currentTimezoneOffset),
        username: username,
        email: email,
        password: password
      }
      if (password !== confirmPassword) { throw new Error("Password do not match." ) }
      if (password === '' || confirmPassword == '') { throw new Error("Password is required") }
      if (username === '') { throw new Error("Username is required.") }
      if (email === '') { throw new Error("Email is required.") }
      if (error) { setError(null) }
      const resp = await api.post('user/$create/', data)
      if (!resp.data.created) {
        throw new Error(`Account not created: ${resp.data.errors[0].text}`)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  const formProps = {disabled: loading}
  return <>
    <h2 style={{color: 'white'}}>Create an Account</h2>
    {error && error.status && <ErrorContainer>Unknown error. Try again.</ErrorContainer>}
    {error && <ErrorContainer>{error.message}</ErrorContainer>}
    <form onSubmit={handleSubmit}>
      <InputGroup>
        <Input label='Username' type='text' value={username} onChange={e => setUsername(e.target.value)} pattern="[a-zA-Z0-9_]+" minLength='5' maxLength='100' title='Only letters, numbers, or underscore' {...formProps} />
        <Input label='Email' type='email' value={email} onChange={e => setEmail(e.target.value)} {...formProps} />
        <Input label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)} minLength={8} maxLength={100} {...formProps} />
        <Input label='Confirm Password' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={8} maxLength={100} {...formProps} />
      </InputGroup>
      <Input type='submit' value='Create Account' {...formProps} />
    </form>
  </>
}
RegisterForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
}

function LoginForm() {
  useTitle('Login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const getLoggedInUser = useContext(GetLoggedInUserContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()

  const formProps = {isLoading: loading}

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

  return <>
    <h2 style={{color: 'white'}}>Log in</h2>
    {(error && error.status === 400) && <ErrorContainer><strong>Incorrect username/password.</strong> Try again or create a new account.</ErrorContainer>}
    {(error && error.status !== 400) && <ErrorContainer>Unknown error. Try again.</ErrorContainer>}
    <form onSubmit={handleSubmit}>
      <InputGroup>
        <Input label='Username' type='text' value={username} onChange={e => setUsername(e.target.value)} {...formProps} />
        <Input label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)} {...formProps} />
      </InputGroup>
      <Input type='submit' value='Login' {...formProps} />
    </form>
  </>
}

export default function Login({form: initialForm}) {
  const [form, setForm] = useState(initialForm || 'login')
  const [madeNewAccount, setMadeNewAccount] = useState(false)

  function handleChangeForm(newForm) {
    setForm(newForm)
    // This is just a cosmetic URL change that bypasses react router
    if(newForm === 'register') {
      window.history.pushState('register', 'Register', '/register')
    } else if (newForm === 'reset') {
      window.history.pushState('reset', 'Reset Password', '/reset')
    } else {
      window.history.pushState('login', 'Login', '/')
    }
  }

  function handleNewAccount() {
    handleChangeForm('login')
    setMadeNewAccount(true)
  }

  return <Page>
    <AnimatedContainer>
      <ContentBlock maxWidth='500px'>
        <BackLink href='https://www.writingquests.org'>&larr; Writing Quests home</BackLink>
        <Notices />
        <h1 style={{color: 'white', fontWeight: '900', fontSize: '2.5rem'}}>Welcome!</h1>
        {(form === 'login') ?
          <>
            {madeNewAccount ?
              <SuccessContainer>Your account has been created! Log in to get started.</SuccessContainer>
            :
              <>
                <Button type='outline' onClick={() => handleChangeForm('register')}>
                  Create new account <span style={{fontWeight: '200'}}>(100% free!)</span>
                </Button>
                <hr />
              </>
            }
            <LoginForm />
            <Button type='link' onClick={() => handleChangeForm('reset')}>Forgot your password?</Button>
          </> : (form === 'register') ? <>
            <RegisterForm onSuccess={handleNewAccount} />
            <hr />
            <Button type='outline' onClick={() => handleChangeForm('login')}>
              <span style={{fontWeight: '200'}}>Already have an account?</span> Log in
            </Button>
          </> : (form === 'reset') ? <>
            <PasswordResetForm />
            <Button type='link' onClick={() => handleChangeForm('login')}>&larr; Log in</Button>
          </>
          : <div>Page not found</div>}
      </ContentBlock>
    </AnimatedContainer>
  </Page>
}
Login.propTypes = {
  form: PropTypes.string,
}
