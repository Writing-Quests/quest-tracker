import { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import context from '../services/context'
import Input, { Button } from './Forms/Input'
import InputGroup from './Forms/InputGroup'
import Page from './Page'
import Loading from './Loading'
import { AnimatedContainer, CenteredContainer, ErrorContainer } from './Containers'

const { LoggedInUserContext } = context

function mapFailureArray ({ errors }) {
  const errList = errors.map((msg) => <ErrorContainer key={msg.id}>{msg.text}</ErrorContainer>)
  return errList
}

// TODO: what happens when a user tries to verify while logged into another account?
export function UserVerifyEmail () {
  const loggedIn = Boolean(useContext(LoggedInUserContext))
  const [queryParameters] = useSearchParams()
  const navigate = useNavigate()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  useEffect(() => {
    (async () => {
      let resp
      let message
      try {
        if(!email || !token) {
          throw new Error("Invalid verification link")
        }
        resp = await api.get('user/$verify', {params:
          {e: email, t: token, type: 'verify-email'}
        })
        if (resp.data.verified === true) {
          message = {type: 'success', text: `Your email address (${email}) has been verified!`}
        } else {
          message = {type: 'error', text: `Error verifying your email address: ${JSON.stringify(resp.errors)}`}
        }
      } catch (e) {
        console.log(e)
        message = {type: 'error', text: `Error verifying your email address`}
      }
      if(loggedIn) {
        navigate('/profile', {state: {notices: [message]}})
      }
      else {
        navigate('/login', {state: {notices: [message]}})
      }
    })()
  }, [email, token, loggedIn, navigate])
  return <Page>
    <AnimatedContainer>
      <CenteredContainer>
        <h1 style={{color: 'white'}}>Verifying your email address&hellip;</h1>
        <Loading />
      </CenteredContainer>
    </AnimatedContainer>
  </Page>
}

// TODO: What happens if someone is already logged in?
function ResetForm({username, email}) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formValidity, setFormValidity] = useState(false)
  const formRef = useRef(null)
  const navigate = useNavigate()
  useEffect(() => {
    if(!formRef?.current) { return }
    setFormValidity(formRef.current.checkValidity())
  }, [formRef, password, confirmPassword])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if(loading) { return }
    if(!formValidity) { return }
    if(password !== confirmPassword) { return }
    setLoading(true)
    try {
      const res = await api.post('password/submit', {username, email, password})
      if(res?.data?.passwordChanged) {
        navigate('/login', {state: {notices: [{type: 'success', text: 'Your password has been updated. Login to continue.'}]}})
      } else {
        if(res?.data?.errors) {
          setError(`Error: Couldn't change password. ${JSON.stringify(res.data.errors)}`)
        }
      }
    } catch(e) {
      console.error(e)
      setError("Error: Couldn't change password")
    } finally {
      setLoading(false)
    }
  }

  const formProps = {disabled: loading}

  return <>
    {error && <ErrorContainer>{error}</ErrorContainer>}
    <form onSubmit={handleSubmit} ref={formRef}>
      <InputGroup>
        <Input type='text' readOnly={true} value={username} label='Username' />
        <Input type='email' value={email} readOnly={true} label='Email address' />
      </InputGroup>
      <InputGroup>
        <Input type='password' label='New password' required={true} value={password} onChange={e => setPassword(e.target.value)} minLength='4' {...formProps} />
        <Input type='password' label='Confirm new password' required={true} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength='4' {...formProps} />
      </InputGroup>
      <Input type="submit" value="Reset password" {...formProps} />
    </form>
    {(password !== confirmPassword && password.length > 1 && confirmPassword.length > 1) && <ErrorContainer>Passwords must match</ErrorContainer>}
  </>
}
ResetForm.propTypes = {
  username: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
}

export function UserResetPasswordFinish() {
  const [queryParameters] = useSearchParams()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  const [username, setUsername] = useState('')
  const [tokenValid,setTokenValid] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    checkTokenData()
  }, [])
  async function checkTokenData() {
    setLoading(true)
    try {
      const resp = await api('user/$verify', {params: {e: email, t: token, type: 'reset-password'}})
      if (!resp.data.verified) {
        setTokenValid(false)
        setTokenError(mapFailureArray(resp.data))
      } else {
        setTokenValid(true)
        setUsername(resp.data.username)
      }
    } catch {
      setTokenValid(false)
    } finally {
      setLoading(false)
    }
  }
  return <Page>
    <AnimatedContainer>
      <CenteredContainer>
        <Button type='link' as={Link} to='/'>&larr; Log in</Button>
        <h1 style={{color: 'white'}}>Reset Your Password</h1>
        {tokenError}
        {loading && <Loading />}
        {tokenValid && <ResetForm token={token} username={username} email={email} />}
      </CenteredContainer>
    </AnimatedContainer>
  </Page>
}
