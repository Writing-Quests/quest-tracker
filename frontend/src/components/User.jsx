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

function mapFailureArray({ errors }) {
  const errList = errors.map((msg) => <ErrorContainer key={msg.id}>{msg.text}</ErrorContainer>)
  return errList
}

// TODO: what happens when a user tries to verify while logged into another account?

async function newVerificationLink({ type, email, setGeneratingNewLink, setLinkSent }) {
  try {
    let resp = await api.post('/verify/create', {
      'email': email,
      'type': type
    })
    setGeneratingNewLink(false)
    setLinkSent(resp.data?.created)
  } catch (err) {
    console.log(err)
  }
}

export function UserVerifyEmail() {
  const { user, setUser } = useContext(LoggedInUserContext)
  const [invalidLink, setInvalidLink] = useState(false)
  const [reasonLinkInvalid, setReasonLinkInvalid] = useState(null)
  const [generatingNewLink, setGeneratingNewLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const loggedIn = Boolean(useContext(LoggedInUserContext))
  const [queryParameters] = useSearchParams()
  const navigate = useNavigate()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  useEffect(() => {
    (async () => {
      let resp
      let message
      const goTo = (loggedIn) ? '/profile' : '/login'
      try {
        if (!email || !token) {
          throw new Error("Invalid verification link")
        }
        resp = await api.get(`verify/${token}`, {
          params:
            { email: email, token: token, type: 'verify-email' }
        })
        if (resp.data.verified === true) {
          message = { type: 'success', text: `Your email address (${email}) has been verified!` }
          if (loggedIn) { // update the new user value in the context
            setUser({...resp.data?.user})
          }
          navigate(goTo, { state: { notices: [message] } })
        } else {
          setReasonLinkInvalid(resp.data.message);
          setInvalidLink(true)
        }
      } catch (err) {
        console.log(err)
        setInvalidLink(true)
      }
    })()
  }, [email, token, loggedIn, navigate])
  return <Page>
    <AnimatedContainer>
      <CenteredContainer>
        {!invalidLink ?
          <>
            <h1 style={{ color: 'white' }}>Verifying your email address&hellip;</h1>
            <Loading />
          </>
          :
          <>
            <h1 style={{ color: 'white' }}>Unable to verify your email address. :(</h1>
            <p>{!linkSent ? reasonLinkInvalid : "A new verification link has been sent. You can close this window."}</p>
            <div style={{ 'width': '100%', 'display': 'flex', 'justifyContent': 'space-evenly', 'gap': '10px' }}>
              <Button disabled={generatingNewLink || linkSent} onClick={() => { newVerificationLink({ 'type': 'verify-email', 'email': email, 'setGeneratingNewLink': setGeneratingNewLink, 'setLinkSent': setLinkSent }) }}>{generatingNewLink ? 'Sending New Link...' : 'Get New Verification Link'}</Button>
              {loggedIn ?
                <Button onClick={() => navigate('/')}>Home</Button>
                :
                <Button onClick={() => navigate('/login')}>Log In</Button>
              }
            </div>
          </>
        }
      </CenteredContainer>
    </AnimatedContainer>
  </Page>
}

// TODO: What happens if someone is already logged in?
function ResetForm({ username, email, token }) {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formValidity, setFormValidity] = useState(false)
  const formRef = useRef(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!formRef?.current) { return }
    setFormValidity(formRef.current.checkValidity())
  }, [formRef, password, confirmPassword])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (loading) { return }
    if (!formValidity) { return }
    if (password !== confirmPassword) { return }
    setLoading(true)
    try {
      const resp = await api.patch(`users/${username}/reset`, { 'username': username, 'plainPassword': password, 'resetToken': token})
      if (resp.status != 200) {
          setError(`Error: Couldn't change password.`)
      } else {
        navigate('/login', { state: { notices: [{ type: 'success', text: 'Your password has been updated. Login to continue.' }] } })
      } 
    } catch (e) {
      console.error(e)
      setError("Error: Couldn't change password.")
    } finally {
      setLoading(false)
    }
  }

  const formProps = { disabled: loading }

  return <>
    {error && <ErrorContainer>{error}</ErrorContainer>}
    <form onSubmit={handleSubmit} ref={formRef}>
      <InputGroup>
        <Input type='hidden' name="resetToken" readOnly={true} value={token} />
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
  const [tokenValid, setTokenValid] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [generatingNewLink, setGeneratingNewLink] = useState(false)
  const [linkSent, setLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    checkTokenData()
  }, [])
  async function checkTokenData() {
    setLoading(true)
    try {
      if (!email || !token) {
        throw new Error("Invalid verification link")
      }
      let resp = await api.get(`verify/${token}`, {
        params:
          { email: email, token: token, type: 'reset-password' }
      })
      if (resp.data.verified) {
        setTokenValid(true)
        setUsername(resp.data.user.username)
      } else {
        setTokenValid(false)
        setTokenError(resp.data.message)
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
        <h1 style={{ color: 'white' }}>Reset Your Password</h1>
        {tokenError &&
          <>
            <p>{linkSent ? "Your new password reset link has been sent. You can close this page." : `${tokenError} Your password has not been changed; please request a new password reset link.`}</p>
            <div style={{ 'width': '100%', 'display': 'flex', 'justifyContent': 'space-evenly', 'gap': '10px' }}>
              <Button hidden={linkSent} disabled={generatingNewLink || linkSent} onClick={() => { newVerificationLink({ 'type': 'reset-password', 'email': email, 'setGeneratingNewLink': setGeneratingNewLink, 'setLinkSent': setLinkSent }) }}>{generatingNewLink ? 'Sending New Link...' : 'Get New Password Reset Link'}</Button>
              <Button onClick={() => navigate('/login')}>Log In</Button>
            </div>
          </>
        }
        {loading && <Loading />}
        {tokenValid && <ResetForm token={token} username={username} email={email} />}
      </CenteredContainer>
    </AnimatedContainer>
  </Page>
}
