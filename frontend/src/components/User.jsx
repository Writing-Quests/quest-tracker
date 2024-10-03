import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getUserTZName } from '../timezones.js'
import CONSTS from '../CONSTS'

const { API_URL } = CONSTS

function mapFailureArray ({ errors }) {
  const errList = errors.map((msg) => <li key={msg.id}>{msg.text}</li>);
  return errList;
}

export function UserRegister () {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const navigate = useNavigate()
  const [registerFailures,setRegisterFailures] = useState('')
  async function onSubmit (data) {
    const currentTimezoneOffset = (new Date().getTimezoneOffset()/60) * -1 // not using this right now, but we have it
    if (data.password === data.confirmPassword) {
      data.timezone = getUserTZName(currentTimezoneOffset);
      const apiResult = await (await fetch(API_URL+'user/create/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })).json()
      if (!apiResult.created) {
        setRegisterFailures(mapFailureArray(apiResult));
      } else {
        navigate(`/login`, { state: {
          'notices': [
            {id: 'created', text: (apiResult.created) ? 'Your account has been created! Log in to get started.' : null },
            {id: 'sentVerificationEmail', text: (apiResult.sentVerificationEmail) ? 'A verification email has been sent to your email address.': null }
          ]}
        })
      }
    } else {
      setError("passwordMatch", { type: "custom", message: "Password do not match" })
    }
  }
  return (
    <>
    <h1>Create an Account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Username</label>
        <input {...register("username", { required: true})}/>

        <label htmlFor='email'>Email Address</label>
        <input type='email' {...register("email", { required: true })}/>

        <label htmlFor='password'>Password</label>
        <input type='password' {...register('password', { required: true })} />

        <label htmlFor='confirmPassword'>Confirm Password</label>
        <input type='password' {...register('confirmPassword', { required: true })} />

        <input type="submit" value="Register" onClick={(e) => clearErrors()} />
     </form>
     <Link to="/login">Log in to your account</Link> | <Link to="/reset">Reset Your Password</Link>

    <ul className='formErrors'>
      {errors.username && <li>Username field is required</li>}
      {errors.email && <li>A valid email address is required</li>}
      {errors.passwordMatch && <li>Passwords do not match</li>}
      {registerFailures}
    </ul>
    </>
  )
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
      redirect_state['state']['notices'] = resp.errors;
    }
    navigate('/login', redirect_state)
  }
  // eslint-disable-next-line no-unused-vars
  const [queryParameters, setQueryParameters] = useSearchParams()
  const navigate = useNavigate()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  useEffect(() => {
    checkTokenData(email,token);
  },[])
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width={96} height={96} viewBox="0 0 24 24"><g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path strokeDasharray={16} strokeDashoffset={16} d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"></animate><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform></path><path strokeDasharray={64} strokeDashoffset={64} strokeOpacity={0.3} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"></animate></path></g></svg>
    </>
  )
}

export function UserResetPasswordRequest () {
  const [email,setEmail] = useState('')
  const [resetStatus,setResetStatus] = useState('')
  async function submitResetPassword (e) {
    e && e.preventDefault()
    setResetStatus('')
    const apiResult = await (await fetch(API_URL+'password/request/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({'email':email}),
    })).json()
    if (!apiResult['emailSent']) { // email not sent
      setResetStatus(`Error: ${apiResult['errors'][0]['text']}`) // this endpoint only ever returns one error right now.
    } else {
      setResetStatus('Success: pasword reset link has been sent to your email address. The link will expire in 24 hours.')
    }
  }
  return (
    <>
    <h1>Request Password Reset</h1>
      <p>Enter your email address to request a password reset link.</p>
      <form onSubmit={submitResetPassword}>

        <label htmlFor='email'>Email Address</label>
        <input type='email' id='email' placeholder='you@email.com' required value={email} onChange={(e) => setEmail(e.target.value)}/>

        <input type="submit" value="Request Reset Link" />
     </form>
     <Link to="/login">Log in to your account</Link> | <Link to="/register">Create an account</Link>
     <p>{resetStatus}</p>
    </>
  )
}

export function UserResetPasswordFinish () {
  // eslint-disable-next-line no-unused-vars
  const [queryParameters, setQueryParameters] = useSearchParams()
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  const [username,setUsername] = useState('')
  const [tokenValid,setTokenValid] = useState('')
  const [tokenError,setTokenError] = useState('')
  useEffect(() => {
    checkTokenData()
  }, [])
  async function checkTokenData (e) {
    const resp = await (await fetch(API_URL+`user/verify?e=${email}&t=${token}&type=reset-password`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    if (!resp.verified) {
      setTokenValid(false)
      setTokenError(mapFailureArray(resp))
    } else {
      setTokenValid(true)
      setUsername(resp.username);
    }
  }
  function ResetForm (attr) {
    async function onSubmit (data) {
      if (data.password === data.confirmPassword) {
        const apiResult = await (await fetch(API_URL+'password/submit', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })).json()
        if (!apiResult.passwordChanged) {
          (mapFailureArray(apiResult));
        } else {
          navigate(`/login`, { state: {
            'notices': [
              {id: 'changed', text: (apiResult.passwordChanged) ? 'Your password has been updated.' : null }
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
      return (
        <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="username">Username</label>
          <input {...register("username")} readOnly={true} value={attr.username} />

          <label htmlFor='email'>Email Address</label>
          <input type='email' {...register("email")} value={attr.email} readOnly={true} />

          <label htmlFor='password'>Password</label>
          <input type='password' {...register('password', { required: true })} />

          <label htmlFor='confirmPassword'>Confirm Password</label>
          <input type='password' {...register('confirmPassword', { required: true })} />

          <input type="submit" value="Register" onClick={(e) => clearErrors()} />
        </form>
      <ul className='formErrors'>
        {errors.passwordMatch && <li>Passwords do not match</li>}
      </ul>
      </>
      )
    }
  }
  return (
    <>
    <h1>Reset Your Password</h1>
    <ResetForm display={tokenValid} token={token} username={username} email={email} />
    <ul>
    {tokenError}
    </ul>
    <Link to="/login">Log in to your account</Link> | <Link to="/reset">Reset Your Password</Link>
    </>
  )
}
