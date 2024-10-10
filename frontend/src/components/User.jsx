import { useState, useEffect, useContext } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
        resp = await api.get('user/verify', {params:
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

export function UserResetPasswordFinish () {
  const [queryParameters] = useSearchParams()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  const [username, setUsername] = useState('')
  const [tokenValid,setTokenValid] = useState('')
  const [tokenError,setTokenError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    checkTokenData()
  }, [])
  async function checkTokenData() {
    setLoading(true)
    try {
      const resp = await api('user/verify', {params: {e: email, t: token, type: 'reset-password'}})
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
  function ResetForm (attr) {
    async function onSubmit (data) {
      if (data.password === data.confirmPassword) {
        const apiResult = await api.post('password/submit', data)
        if (!apiResult.data.passwordChanged) {
          (mapFailureArray(apiResult.data))
        } else {
          navigate(`/login`, { state: {
            'notices': [
              {id: 'changed', text: (apiResult.data.passwordChanged) ? 'Your password has been updated.' : null }
            ]}
          })
        }
      } else {
        setError("passwordMatch", { type: "custom", message: "Password do not match" })
      }
    }

   const navigate = useNavigate()
    const {
      register,
      handleSubmit,
      clearErrors,
      setError,
      formState: { errors },
    } = useForm()
    if (attr.display === true) {
      return <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <Input {...register("username")} readOnly={true} value={attr.username} label='Username' />
            <Input type='email' {...register("email")} value={attr.email} readOnly={true} label='Email address' />
          </InputGroup>
          <InputGroup>
            <Input type='password' {...register('password', { required: true })} label='New password' />
            <Input type='password' {...register('confirmPassword', { required: true })} label='Confirm new password' />
          </InputGroup>
          <Input type="submit" value="Register" onClick={() => clearErrors()} />
        </form>
        <ul className='formErrors'>
          {errors.passwordMatch && <li>Passwords do not match</li>}
        </ul>
      </>
    }
  }
  return (
    <Page>
      <AnimatedContainer>
        <CenteredContainer>
          <Button type='link' as={Link} to='/'>&larr; Log in</Button>
          <h1 style={{color: 'white'}}>Reset Your Password</h1>
          <ul>{tokenError}</ul>
          {loading && <div>Loading&hellip;</div>}
          <ResetForm display={tokenValid} token={token} username={username} email={email} />
        </CenteredContainer>
      </AnimatedContainer>
    </Page>
  )
}
