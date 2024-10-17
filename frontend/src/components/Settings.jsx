import { useContext,useState,useEffect } from 'react'
import styled from 'styled-components'
import context from '../services/context'
import Page from './Page'
import Notices from './Notices'
import Loading from './Loading'
import api from '../services/api'
import Input from './Forms/Input'
import InputGroup from './Forms/InputGroup'

const { LoggedInUserContext } = context

const ErrorContainer = styled.div`
  width: 100%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
`

const VerificationContainer = styled.div`
  display: ${(props) => (props.hidden == 'true' && 'none') || 'block'};
  background-color: #F4F1ED;
  color: #D7722C;
  width: 100%;
  margin: 10px 0;
  border: 1px solid #D7722C;
  border-radius: 3px;
  padding: 5px;
  font-size: 0.75rem;
`

const SectionOptions = styled.div`
  display: ${(props) => (props.available == 'false' && 'none') || 'flex'};
  width: ${(props) => (props.size === 'small' && '40%') || '100%'};
  background-color: transparent;
  margin: ${(props) => (props.size === 'small' && '5px 0') || '10px 0'};
  border: 1px solid #838686;
  border-radius: 3px;
  padding: 0;
`

const OptionButton = styled.button`
  width: 50%;
  padding: ${(props) => (props.size === 'small' && '8px 0') || '15px 0'};
  margin: 0;
  font-size: ${(props) => (props.size === 'small' && '0.75rem') || '1rem'};
  background-color: ${(props) => (props.selected && '#333') || 'white'};
  color: ${(props) => (props.selected && 'white') || '#333'};
  border: none;
  border-radius: 3px;
  font-weight: ${(props) => (props.selected && 'bold') || 'normal'};
  font-size: 1rem;
  border-bottom: ${(props) => (props.selected && '2px solid black') || 'none'};
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
  top: 0;
  text-shadow: ${(props) => (props.selected && '-1px 1px 0 black') || 'none'};
`

const ToggledSection = styled.div`
  width: 100%;
  margin: 10px 0;
  display: ${(props) => (props.selected && 'block') || 'none'};
  margin-bottom: 1rem;
`

const Label = styled.label`
  background-color: white;
  padding: 15px 5px;
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.01rem;
  color: #333;
`

const NotALink = styled.span`
  color: #D7722C;
  font-weight: bold;
  text-decoration: underline;
  &:hover {
    text-decoration: none;
    cursor: pointer;
  }
`

export default function Settings () {
  // TODO: if they have _never_ verified an email, disable privacy toggle
  async function getProfileInformation (username) {
    try {
      const resp = await api.get('profile/$get', { params: { 'username': username }})
      setProfile(resp.data)
      setPublicProfile(profile.public === 'true')
      //setCurrentEmail((profile.unverifiedEmail !== null) ? profile.unverifiedEmail : profile.email)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  function holdProfileChanges (e,key,value=e.target.value) {
    e && e.preventDefault()
    if (key === 'public') {
      profile['public'] = (value === 'true')
      setPublicProfile(value === 'true')
    } else {
      profile[key] = value
    }
  }
  function checkPassword() {
    setPasswordMatch(password1 === password2)
    if (passwordMatch === false) {
      setFormError('Passwords do not match')
    } else {
      setFormError(null)
    }
  }
  // eslint-disable-next-line react/prop-types
  function VerificationNotice ({unverified,verified,hidden}) {
    if (profile.emailVerified === false) {
      let revertOption = (unverified !== verified)
      return <VerificationContainer hidden={hidden.toString()}>
            <p>Email address pending verification.<br /><NotALink onClick={resendVerification}>Resend Verification to {unverified}</NotALink> {revertOption && <>&bull; <NotALink onClick={revertToVerified}>Revert to {verified}</NotALink></>}</p>
        </VerificationContainer>
    }
  }
  async function updateProfileInformation (e) {
    e && e.preventDefault()
    try {
      clearAll()
      setLoading(true)
      checkPassword()
      if (password1 !== null && passwordMatch == true) {
        profile.passwordChange = true
        profile.password = password1
      } else if (password1 !== null && passwordMatch == false) {
        setFormError('Passwords do not match; no password change submitted')
        setPassword1('')
        setPassword2('')
      }
      if (profile.unverifiedEmail !== null && profile.email !== profile.unverifiedEmail) {
        profile.emailChange = true
      }
      const resp = await api.post('profile/$edit',{...profile})
      console.log(resp)
      if (resp.data.errors.length > 0) {
        setFormError(resp.data.errors[0].text)
        if (resp.data.revertEmail) {
          // the email address wasn't changed
          profile.unverifiedEmail = resp.data.revertEmail
        }
      } else {
        if (resp.data.sendLogout === true) {
          // TODO: some sort of "password changed, plz log in with new password" notice
          await api.post('auth/logout')
          window.location = '/'
        } else {
          setNotice('Profile updated successfully!')
        }
      }
    } catch (err) {
      setFormError('Unable to update profile.')
    } finally {
      setLoading(false)
    }
  }
  async function resendVerification () {
    clearAll()
    try {
      setLoading(true)
      const resp = await api.post('user/$resend',{...profile})
      if (resp.data.sent === true) {
        setNotice('Sent new verification email to ' + profile.unverifiedEmail + '.')
        setVerificationHidden(true)
      }
    } catch (err) {
      setFormError('An error has occurred; unable to send email')
    } finally {
      setLoading(false)
    }
  }
  async function revertToVerified () {
    clearAll()
    try {
      setLoading(true)
      const resp = await api.post('user/$revert',{...profile})
      if (resp.data.changed) {
        setNotice('Reverted user email address to the verified address: ' + profile.email + '.')
        setProfile(resp.data.profile);
        setVerificationHidden(true)
      } else {
        setError(resp.data.errors[0].text)
      }
    } catch (err) {
      setFormError('An error has occurred; unable to revert email')
    } finally {
      setLoading(false)
    }
  }
  const clearAll = () => {
    setError(null)
    setFormError(null)
    setNotice(null)
  }
  const [profile,setProfile] = useState({})
  const [section,setSection] = useState('profile')
  const [publicProfile,setPublicProfile] = useState()
  const [password1,setPassword1] = useState(null)
  const [password2,setPassword2] = useState(null)
  const [passwordMatch,setPasswordMatch] = useState()
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [formError,setFormError] = useState(null)
  const [notice,setNotice] = useState(null)
  const [verificationHidden, setVerificationHidden] = useState(false)
  const user = useContext(LoggedInUserContext)
  const formProps = {disabled: loading}
  useEffect(() => {
    getProfileInformation(user.username)
  },[user])
  if(loading) {
    return <Page>
      <Notices />
      <h1>Loading&hellip;</h1>
      <Loading />
    </Page>
  } else if (error !== null) {
    let msg = 'An unknown error occured.'
    if (error.status === 404) { 
      msg = `No profile found for username: ${user.username}.`
    }
    return <Page>
      <ErrorContainer>{msg}</ErrorContainer>
    </Page>
  } else {
    return <Page>
      <h1>Settings</h1>
      {formError !== null && <ErrorContainer>{formError}</ErrorContainer>}
      {notice && <p>{notice}</p>}
      <SectionOptions>
        <OptionButton selected={(section === 'profile')} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Profile</OptionButton>
        <OptionButton selected={section === 'account'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Account</OptionButton>
      </SectionOptions>
      <form style={{position: 'relative'}} onSubmit={updateProfileInformation}>
        <ToggledSection selected={(section === 'profile')}>
          <InputGroup>
            <Input label='Link' type='text' placeholder='https://www.writingquests.org/' defaultValue={profile.link} onChange={(e)=>{holdProfileChanges(e,'link')}} {...formProps} />
            <Input type='textarea' rows='7' label='Description' defaultValue={profile.description} onChange={(e)=>{holdProfileChanges(e,'description')}} {...formProps} />
          </InputGroup>
          <Label>Privacy</Label>
          {profile.unverifiedAccount && <VerificationContainer>Your account and projects are private. You can choose to make them public after you verifiy your email address.</VerificationContainer>}
          <SectionOptions size='small' available={(profile.unverifiedAccount == false).toString()}>
              <OptionButton size='small' selected={(publicProfile === true)} value='true' onClick={(e) => {holdProfileChanges(e,'public')}}>Public</OptionButton>
              <OptionButton size='small' selected={(publicProfile === false)} value='false' onClick={(e) => {holdProfileChanges(e, 'public')}}>Private</OptionButton>
          </SectionOptions>
          {publicProfile && <p><b>Your profile page and projects will be visible to the public.</b> This includes your username, bio, link, goals, progress, and other project information.</p>}
        </ToggledSection>
        <ToggledSection selected={(section === 'account')}>
          <InputGroup>
            <Input label='Username' disabled={true} type='text' value={profile.username} />
            <Input label='Email Address' type='email' defaultValue={profile.unverifiedEmail ? profile.unverifiedEmail : profile.email} onChange={(e) => {holdProfileChanges(e,'unverifiedEmail')}}{...formProps} />
          </InputGroup>
          <VerificationNotice unverified={profile.unverifiedEmail} verified={profile.email} hidden={(verificationHidden === true)}/>
          <InputGroup>
            <Input label='New Password' type='password' onChange={(e) => {setPassword1(e.target.value)}} {...formProps} />
            <Input label='Confirm Password' type='password' onChange={(e) => {setPassword2(e.target.value)}} onBlur={checkPassword} {...formProps} />
          </InputGroup>
        </ToggledSection>

        <Input type='submit' value='Save Changes' />
      </form>
    </Page>
  }
}