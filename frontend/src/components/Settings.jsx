import { useContext,useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WarningContainer, ContentContainer, ContentBlock, SuccessContainer } from './Containers'
import styled from 'styled-components'
import context from '../services/context'
import Page from './Page'
import Notices from './Notices'
import Loading from './Loading'
import api from '../services/api'
import Input, { SectionOptions, OptionButton } from './Forms/Input'
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
  display: ${(props) => (props.hidden == true && 'none') || 'block'};
  background-color: #FFF9F4;
  color: #D7722C;
  width: 100%;
  margin: 10px 0;
  border: 1px solid #D7722C;
  border-radius: 3px;
  padding: 5px;
  padding-bottom: 0;
  font-size: 0.75rem;
  margin-top: -20px;
  margin-left: auto;
  margin-right: auto;
  width: 99%;
`

const ToggledSection = styled.div`
  width: 100%;
  margin: 10px 0;
  display: ${(props) => (props.selected === true && 'block') || 'none'};
  margin-bottom: 1rem;
`

const Label = styled.label`
  padding: 15px 5px;
  padding-bottom: 3px;
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
  async function getProfileInformation (username) {
    try {
      const resp = await api.get(`users/${username}`)
      setProfile(resp.data)
      setPublicProfile(resp.data.public)
      setUnverifiedAccount(resp.data.email_verified_at == null && resp.data.email !== resp.data.unverified_email)
      setVerificationHidden(resp.data.email_verified_at && !resp.data.unverified_email)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  function holdProfileChanges (e,key,value=e.target.value) {
    e && e.preventDefault()
    console.log(value)
    if (key === 'public') {
      profile['public'] = value === 'true'
      setPublicProfile(profile['public'])
    } else {
      profile[key] = value
    }
    console.log('publicProfile',publicProfile)
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
    if (unverified) {
      let revertOption = (unverified !== verified)
      return <VerificationContainer hidden={hidden}>
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
      if (profile.unverified_email && profile.email !== profile.unverified_email) {
        profile.emailChange = true
      }
      const resp = await api.post('profile/$edit',{...profile})
      if (resp.data.errors?.length) {
        setFormError(resp.data.errors[0].text)
        if (resp.data.revertEmail) {
          // the email address wasn't changed
          profile.unverified_email = resp.data.revertEmail
        }
      } else {
        if (resp.data.sendLogout === true) {
          await api.post('auth/logout')
          navigate('/login', {state: {notices: [{type: 'success', text: 'Your password has been updated. Login to continue.'}]}})
        } else {
          setNotice('Profile updated successfully!')
        }
      }
    } catch (err) {
      console.error(err)
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
        setNotice('Sent new verification email to ' + profile.unverified_email + '.')
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
  const [profile, setProfile] = useState()
  const [section, setSection] = useState('profile')
  const [unverifiedAccount, setUnverifiedAccount] = useState(true);
  const [publicProfile,setPublicProfile] = useState(false)
  const [password1,setPassword1] = useState(null)
  const [password2,setPassword2] = useState(null)
  const [passwordMatch,setPasswordMatch] = useState()
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [formError,setFormError] = useState(null)
  const [notice,setNotice] = useState(null)
  const [verificationHidden, setVerificationHidden] = useState(true)
  const user = useContext(LoggedInUserContext)
  const navigate = useNavigate();
  const formProps = {disabled: loading}
  useEffect(() => {
    getProfileInformation(user.username)
  },[user])
  if(loading || profile.length == 0) {
    return <Page>
      <Notices />
      <Loading />
    </Page>
  } else if (error !== null) {
    let msg = 'An unknown error occured.'
    if (error.status === 404) { 
      msg = `No profile found for username: ${user.username}.`
    }
    return <Page>
      <ErrorContainer><strong>Error:</strong> {msg}</ErrorContainer>
    </Page>
  } else {
    return <Page>
      <ContentContainer>
        <ContentBlock>
          <h1>Settings</h1>
          {formError !== null && <ErrorContainer>{formError}</ErrorContainer>}
          {notice && <SuccessContainer>{notice}</SuccessContainer>}
          <SectionOptions>
            <OptionButton selected={section === 'profile'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Profile</OptionButton>
            <OptionButton selected={section === 'account'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Account</OptionButton>
          </SectionOptions>
          <form style={{position: 'relative'}} onSubmit={updateProfileInformation}>
            <ToggledSection selected={(section === 'profile')}>
              <InputGroup>
                <Input label='Link' type='text' placeholder='https://www.writingquests.org/' defaultValue={profile.link} onChange={(e)=>{holdProfileChanges(e,'link')}} {...formProps} />
                <Input type='textarea' rows='7' label='Description' defaultValue={profile.description} onChange={(e)=>{holdProfileChanges(e,'description')}} {...formProps} />
              </InputGroup>
              <p style={{fontSize: '0.9rem'}}><strong>Change your avatar</strong> on <a href='https://gravatar.com/profile/' target='_blank' rel='noopener notarget'>Gravatar.com</a> with your email address {profile.email}.</p>
              <Label>Privacy</Label>
              {unverifiedAccount && <VerificationContainer>Your account and projects are private. You can choose to make them public after you verifiy your email address.</VerificationContainer>}
              <SectionOptions size='small' hidden={unverifiedAccount}>
                  <OptionButton size='small' selected={(publicProfile === true)} value={true} onClick={(e) => {holdProfileChanges(e,'public')}}>Public</OptionButton>
                  <OptionButton size='small' selected={(publicProfile === false)} value={false} onClick={(e) => {holdProfileChanges(e, 'public')}}>Private</OptionButton>
              </SectionOptions>
              {publicProfile && <WarningContainer><b>Your profile page and projects will be visible to the public.</b> This includes your username, bio, link, goals, progress, and other project information.</WarningContainer>}
            </ToggledSection>
            <ToggledSection selected={(section === 'account')}>
              <InputGroup>
                <Input label='Username' disabled={true} type='text' value={profile.username} />
                <Input label='Email Address' type='email' defaultValue={profile.unverified_email ? profile.unverified_email : profile.email} onChange={(e) => {holdProfileChanges(e,'unverified_email')}}{...formProps} style={{zIndex: '1', position: 'relative'}} />
              </InputGroup>
              <VerificationNotice unverified={profile.unverified_email} verified={profile.email} hidden={verificationHidden}/>
              <InputGroup>
                <Input label='New Password' type='password' onChange={(e) => {setPassword1(e.target.value)}} {...formProps} />
                <Input label='Confirm Password' type='password' onChange={(e) => {setPassword2(e.target.value)}} onBlur={checkPassword} {...formProps} />
              </InputGroup>
            </ToggledSection>

            <Input type='submit' value='Save Changes' />
          </form>
        </ContentBlock>
      </ContentContainer>
    </Page>
  }
}
