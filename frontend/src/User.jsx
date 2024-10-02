import { useState, useEffect } from 'react'
import { useSearchParams, useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { getUserTZName } from './timezones.js'
import { API_URL, TempMenu } from './App.jsx'
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

    <ul className='formErrors'>
      {errors.username && <li>Username field is required</li>}
      {errors.email && <li>A valid email address is required</li>}
      {errors.passwordMatch && <li>Passwords do not match</li>}
      {registerFailures}
    </ul>
    <TempMenu loggedIn={loggedIn} />
    </>
  )
}

export function UserLogin () {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [_remember_me, set_remember_me] = useState(false) // symfony wants it in this key style specifically
  const [redirectTo, setRedirectTo] = useState('/')
  const [loggedIn, setLoggedIn] = useState(false)
  const [notices,setNotices] = useState('');
  const {state} = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (state !== null) {
      if (state.notices) { 
        const notices = state.notices.map((notices) => <p key={notices.id}>{notices.text}</p>)
        setNotices(notices);
      }
      if (state.redirect) {
        setRedirectTo(state.afterLogin)
      }
    }
    checkLoggedIn()
  },[])
  async function checkLoggedIn () {
    let user_resp = await (await fetch(API_URL+'whoami', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    setLoggedIn(user_resp.loggedIn === true)
    if (loggedIn) {
      navigate(redirectTo)
    }
  }
  async function handleSubmit(e) {
    e.preventDefault()
    const resp = await (await fetch(API_URL+'login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, _remember_me }),
    })).json()
    setLoggedIn(resp.loggedIn === true)
    console.log(loggedIn)
    if (loggedIn === true) {
      navigate(redirectTo)
    }
  }
  return (
    <>
      <h1>Login</h1>
      {notices}
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='username' value={username} onChange={e => setUsername(e.target.value)} />
        <input type='password' placeholder='password' value={password} onChange={e => setPassword(e.target.value)} />
        <label htmlFor='_remember_me'><input type='checkbox' name='_remember_me' value={_remember_me} onChange={e => set_remember_me(e.target.checked)} /> Remember Me</label>
        <input type='submit' value='Login' />
      </form>
      <Link to="/register">Create Account</Link> | <Link to="/reset">Reset Password</Link>
      <TempMenu loggedIn={false} />
    </>
  )
}

export function UserViewProfile () {
  const navigate = useNavigate()
  const { username } = useParams()
  const [loggedIn,setLoggedIn] = useState('')
  const [profile,setProfile] = useState('')
  const [profileOwner,setProfileOwner] = useState(false)
  
  function Description ({ description }) {
    if (description !== null) {
      return (
        <p>{description}</p>
      )
    }
  }
  function Avatar ({img}) {
    // TODO: check if the image exists first; test and see how it behaves with the d=404 we'll test and see how things work
    return (
      <img src={img} alt={"profile image for this user, loaded from gravatar by email"} className={"userAvatar"} />
    )
  }

  function UserLink ({url}) {
    if (url !== null) {
      return (
        <a href={url} target={"_blank"}>{url}</a>
      )
    }
  }

  function ProfileActionItem ({owner}) {
    console.log(owner);
    if (owner === true) {
      return (
        <Link to="/profile/edit">Edit Profile</Link>
      )
    } else {
      return (
        <p>Report Link/Icon</p>
      )
    }
  }
  async function getProfile () {
    console.log(username)
    const profile_resp = await (await fetch(`${API_URL}profile/get?username=${username}`,{
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    setProfile(profile_resp)
    setLoggedIn(profile_resp.loggedIn)
    setProfileOwner(profile_resp.profileOwner)
  }
  
  useEffect(() => {
    getProfile()
  }, [])
  
  useEffect(() => {
    if (loggedIn === false) {
      navigate('/login') // TODO: add state w/ redirect, notices
    }
    console.log(profile)
  }, [loggedIn])
  
  return (
    <>
      <Avatar img={profile.gravatar} />
      <h1>{profile.username}</h1>
      <UserLink url={profile.userLink} />
      <Description description={profile.description} />
      <ProfileActionItem owner={profileOwner} />
      {errors.passwordMatch && <li>Passwords do not match</li>}
      <TempMenu loggedIn={loggedIn} username={profile.loggedInUser} />
    </>
  )
}

export function UserEditProfile () {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm()
  const navigate = useNavigate()
  const [loggedIn,setLoggedIn] = useState('')
  const [profile,setProfile] = useState('')
  const [displayEmail, setDisplayEmail] = useState('')
  const [verificationText, setVerificationText] = useState('')
  const [changesMade,setChangesMade] = useState(false)
  function getCorrectEmail ({email,unverifiedEmail,emailVerified}) {
    let set_email = email;
    let resendVerification = '';
    if (emailVerified === false) {
      set_email = unverifiedEmail;
      resendVerification = "Your email address has not been verified. [LINK: Resend Email]"
      if (email !== unverifiedEmail) {
        resendVerification += ` [LINK: Revert to ${email}`
      }
    }
    setDisplayEmail(set_email)
    setVerificationText(resendVerification)
  }
  async function getProfile () {
    const profile_resp = await (await fetch(`${API_URL}profile/get`,{
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })).json()
    setProfile(profile_resp)
    setLoggedIn(profile_resp.loggedIn)
  }
  async function updateProfile (data) {
    Object.keys(data).forEach(key => data[key] = data[key] === '' ? null : data[key])
    console.log(data)
    const profileChanges = {}
    const profile_keys = ['link','description','public'];
    console.log('lets only sent change information')
    profile_keys.forEach((key) => {
      if (data[key] !== profile[key]) {
        profileChanges[key] = data[key]
        (changesMade === false) ? setChangesMade(true)
      }
    })
    if (data.password1 !== null) {
      if (data.password1 !== data.password2) {
        setError("passwordMatch", { type: "custom", message: "Password do not match" })
      } else {
        profileChanges.password = data.password1
        profileChanges.passwordChange = true
      }
    }
    if (data.email !== null && data.email !== profile.email) {
      profileChanges.unverifiedEmail = data.email
      profileChanges.emailChange = true
    }
    if (changesMade === true) {
      const resp_profile_edit = await (await fetch(API_URL+'profile/edit', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileChanges),
      })).json()
      console.log(resp_profile_edit)
      // TODO: response error management
      // TODO: route back to profile page when done
    }
  }
  useEffect(() => {
    getProfile()
  }, [])
  useEffect(() => {
    if (loggedIn === false) {
      navigate('/login') // TODO: add stat w/ redirect, notices
    }
    getCorrectEmail(profile)
  }, [loggedIn])
  return (
    <>
      <h1>Edit Your Profile</h1>
      <h2>{profile.username}</h2>
      <form onSubmit={handleSubmit(updateProfile)}>
        <fieldset>
          <legend>Profile</legend>
          <label htmlFor="link">Link</label>
          <input type="text" placeholder="https://www.writingquests.org" {...register('link')} defaultValue={profile.link || ''} />

          <label htmlFor="description">Description</label>
          <textarea {...register('description')} defaultValue={profile.description || ''}></textarea>

          <label htmlFor="public"><input type="checkbox" {...register('public')} {...profile.public ? 'checked' : ''} /> Public Profile</label>
          <p>Note: Your user profile image is pulled from <a href="https://gravatar.com/" target="_blank">Gravatar</a>.</p>
        </fieldset>
        
        <fieldset>
          <legend>Account</legend>
          <label htmlFor="email">Email</label>
          <input type="email" {...register('email')} defaultValue={displayEmail} />
          <p>{verificationText}</p>

          <label htmlFor="password">Change Password</label>
          <input type="password" {...register('password1')} placeholder='Enter new password' />
          <input type="password" {...register('password2')} placeholder='Confirm new password' />
        </fieldset>
        <input type="submit" value="Save Changes" />
      </form>
      <p>{errors.passwordMatch && 'Passwords do not match'}</p>
      <TempMenu loggedIn={loggedIn} username={profile.loggedInUser} />
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
     <TempMenu loggedIn={false} />
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
  async function checkTokenData () {
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

          <input type="submit" value="Register" onClick={() => clearErrors()} />
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