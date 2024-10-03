import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import Input, { Button } from './Forms/Input'
import InputGroup from './Forms/InputGroup'
import CONSTS from '../CONSTS'
import Page from './Page'
import { AnimatedContainer, CenteredContainer, ErrorContainer } from './Containers'

const { API_URL } = CONSTS

function mapFailureArray ({ errors }) {
  const errList = errors.map((msg) => <ErrorContainer key={msg.id}>{msg.text}</ErrorContainer>)
  return errList
}

export function UserVerifyEmail () {
  async function checkTokenData (email,token) {
    const resp = await (await fetch(API_URL+`user/verify?e=${email}&t=${token}&type=verify-email`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    const redirect_state = { state: { notices: []}}
    if (resp.verified === true) {
      redirect_state['state']['notices'].push({ 'id': 'email-verified', 'text': 'Your email address has been verified.'})
    } else {
      redirect_state['state']['notices'] = resp.errors
    }
    navigate('/login', redirect_state)
  }
  // eslint-disable-next-line no-unused-vars
  const [queryParameters, setQueryParameters] = useSearchParams()
  const navigate = useNavigate()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  useEffect(() => {
    checkTokenData(email, token)
  }, [email, token])
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width={96} height={96} viewBox="0 0 24 24"><g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path strokeDasharray={16} strokeDashoffset={16} d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"></animate><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform></path><path strokeDasharray={64} strokeDashoffset={64} strokeOpacity={0.3} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"></animate></path></g></svg>
    </>
  )
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
