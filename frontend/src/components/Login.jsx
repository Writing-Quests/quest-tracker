import { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api'
import Context from '../services/context'
import useTitle from '../services/useTitle'
import Input, { Button } from './Forms/Input'
import InputGroup from './Forms/InputGroup'
import Page from './Page'
import { getUserTZName } from '../timezones.js'
import { AnimatedContainer, CenteredContainer, ErrorContainer, SuccessContainer } from './Containers'

const { GetLoggedInUserContext } = Context

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
      const resp = await api.post('user/create/', data)
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
        <Input label='Username' type='text' value={username} onChange={e => setUsername(e.target.value)} {...formProps} />
        <Input label='Email' type='email' value={email} onChange={e => setEmail(e.target.value)} {...formProps} />
        <Input label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)} {...formProps} />
        <Input label='Confirm Password' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} {...formProps} />
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

  const formProps = {disabled: loading}

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
    if(newForm === 'login') {
      window.history.pushState('login', 'Login', '/')
    } else {
      window.history.pushState('register', 'Register', '/register')
    }
  }

  function handleNewAccount() {
    handleChangeForm('login')
    setMadeNewAccount(true)
  }

  return (
    <Page>
      <AnimatedContainer>
        <CenteredContainer>
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
            </> : <>
              <RegisterForm onSuccess={handleNewAccount} />
              <hr />
              <Button type='outline' onClick={() => handleChangeForm('login')}>
                <span style={{fontWeight: '200'}}>Already have an account?</span> Log in
              </Button>
            </>}
        </CenteredContainer>
      </AnimatedContainer>
    </Page>
  )
}
Login.propTypes = {
  form: PropTypes.string,
}
