import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getUserTZName } from './timezones.js'
import './App.css'

const API_URL = 'http://quest-tracker.lndo.site/api/'

export function RegisterUser () {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [passwordMatch,setPasswordMatch] = useState(null)
  const [password1,setPassword1] = useState('')
  const [password2,setPassword2] = useState('')
  const [registerFailures,setRegisterFailures] = useState('');
  useEffect(() => {
    if (password1 !== '' && password2 !== '') {
      setPasswordMatch(password1 === password2)
    }
  }, [password1,password2])

  async function onSubmit (data) {
  // TODO: probably some sort of loading/spinning indicator when the form is doing work
  // TODO: nicer "passwords match/don't match" styling
    const currentTimezoneOffset = (new Date().getTimezoneOffset()/60) * -1 // should get the user's UTC offset in decimcal form
    if (passwordMatch) {
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
        // TODO: clear the errors when they start filling out the form again
        const errList = apiResult.errors.map((msg) => <li key={msg.id}>{msg.text}</li>);
        setRegisterFailures(errList);
      }
    }
  }
  return (
    <>
    <h1>Create an Account</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="username">Username</label>
        <input {...register("username", { required: true})} />

        <label htmlFor='email'>Email Address</label>
        <input type='email' {...register("email", { required: true })} />

        <label htmlFor='password'>Password</label>
        <input type='password' {...register('password', { required: true })} onChange={e => setPassword1(e.target.value)}  />

        <label htmlFor='confirmPassword'>Confirm Password</label>
        <input type='password' {...register('confirmPassword', { required: true })} onChange={e => setPassword2(e.target.value)} />

        <input type="submit" value="Register" />
     </form>
    <ul className='formErrors'>
      {errors.username && <li>Username field is required</li>}
      {errors.email && <li>A valid email address is required</li>}
      {passwordMatch === false && <li id='pwMatchErr'>Passwords do not match</li>}
      {registerFailures}
    </ul>
    </>
  )
}

export function VerifyEmail () {
  async function checkTokenData (email,token) {
    const resp = await (await fetch(API_URL+`user/verify?e=${email}&t=${token}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    setVerifyResult(resp)
  }
  const [queryParameters, setQueryParameters] = useSearchParams()
  const [verifyResult,setVerifyResult] = useState('')
  const email = queryParameters.get('e')
  const token = queryParameters.get('t')
  useEffect(() => {
    checkTokenData(email,token);
  },[])
  return (
    <>
      <p>It's an email verification route!</p>
      <pre>{JSON.stringify(verifyResult)}</pre>
    </>
  )
}

export function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState()
  const [resp2, setResp2] = useState()
  useEffect(() => {
    handleClick()
  }, [])

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
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} />
        <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} />
        <input type='submit' />
      </form>
      <h2>Response</h2>
      {JSON.stringify(resp)}
      <hr />
      <button onClick={handleClick}>Who am I?</button>
      <h2>Response</h2>
      {JSON.stringify(resp2)}
    </>
  )
}

