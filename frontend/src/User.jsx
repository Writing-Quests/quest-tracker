import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getUserTZName } from './timezones.js'
import { API_URL } from './App.jsx'
import './App.css'

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
      console.log(apiResult);
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

export function UserLogin () {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState()
  const [resp2, setResp2] = useState()
  const [notices,setNotices] = useState('');
  const {state} = useLocation();
  useEffect(() => {
    handleClick()
  }, [])
  useEffect(() => {
    if (state.notices) { 
      const notices = state.notices.map((notices) => <p key={notices.id}>{notices.text}</p>)
      setNotices(notices);
    }
  },[])
  async function handleSubmit(e) {
    e.preventDefault()
    const resp = await (await fetch(API_URL+'login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })).json()
    setResp(resp)
  }
  async function handleClick(e) {
    e && e.preventDefault()
    const resp = await (await fetch(API_URL+'whoami', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    setResp2(resp)
  }
  return (
    <>
      <h1>Login</h1>
      {notices}
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} />
        <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} />
        <input type='submit' />
      </form>
      <Link to="/register">Create Account</Link> | <Link to="/reset">Reset Password</Link>
      <h2>Response</h2>
      {JSON.stringify(resp)}
      <hr />
      <button onClick={handleClick}>Who am I?</button>
      <h2>Response</h2>
      {JSON.stringify(resp2)}
    </>
  )
}

export function UserProfile () {
  return (
    <>
      <p>The eventual profile page. Get state if redircted because of change</p>
    </>
  )
}

export function UserVerifyEmail () {
  async function checkTokenData (email,token) {
    const resp = await (await fetch(API_URL+`user/verify?e=${email}&t=${token}`, {
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
    console.log(redirect_state)
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
  return (
    <>
      <p>User fills in email to request password reset link via email.</p>
    </>
  )
}

export function UserResetPasswordFinish () {
  return (
    <>
      <p>User form with disabled username, includes password and confirmpassword.</p>
    </>
  )
}