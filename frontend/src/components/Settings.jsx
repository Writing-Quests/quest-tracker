import { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { WarningContainer, ContentContainer, ContentBlock, SuccessContainer } from './Containers'
import styled from 'styled-components'
import context from '../services/context'
import Page from './Page'
import Notices from './Notices'
import Loading from './Loading'
import api from '../services/api'
import Input, { SectionOptions, OptionButton, StandaloneLabel } from './Forms/Input'
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

const ConditionalContent = styled.div`
  display: ${(props) => (props.hidden == true && 'none') || 'block'};
  width: 100%;
`

const ToggledSection = styled.div`
  width: 100%;
  margin: 10px 0;
  display: ${(props) => (props.selected === true && 'block') || 'none'};
  margin-bottom: 1rem;
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

export default function Settings() {
  function setProfileChanges(e, key, value = e.target.value) {
    e && e.preventDefault()
    const profile_updates = { ...profile };
    const booleanValues = ['public', 'allow_dms', 'send_email_notifications']; // to prevent the true/false bring a string
    profile_updates[key] = (booleanValues.includes(key) ? value === 'true' : value);
    setProfile(profile_updates);
    setProfileChanged(true);
  }

  function checkPassword() {
    passwordMatch.current = (password1 === password2)
    if (passwordMatch.current === false) {
      setFormError('Passwords do not match')
    } else {
      setFormError(null)
      setProfileChanged(true)
    }
  }

  // eslint-disable-next-line react/prop-types
  function VerificationNotice({ unverified, verified, hidden }) {
    if (unverified) {
      return <VerificationContainer hidden={hidden}>
        <p>Email address pending verification.<br /><NotALink onClick={() => resendVerification() }>Resend Verification to {unverified}</NotALink></p>
      </VerificationContainer>
    }
  }

  async function updateProfileInformation(e) {
    e && e.preventDefault()
    try {
      let updatedProfileValues = {}
      let updatableItems = ['link', 'public', 'description', 'allow_dms', 'send_email_notifications', 'unverified_email']
      for (const [key, value] of Object.entries(profile)) {
        if (user[key] !== profile[key] && updatableItems.includes(key)) {
          updatedProfileValues[key] = value;
          if (key == 'unverified_email') {
            updatedProfileValues.userChangedEmail = true;
          }
        }
      }
      checkPassword()
      if (password1 !== null && passwordMatch.current == true) {
        updatedProfileValues.plainPassword = password1
      }
      if (profileChanged && !formError) {
        clearAll()
        setLoading(true)
        const resp = await api.patch(`users/${profile.username}`, { 'id': profile.id, 'username': profile.username, ...updatedProfileValues })
        if (resp.status != 200) {
          setFormError('Error when saving profile changes. Please refresh and try again.')
        } else {
          setProfile({ ...resp.data })
          setUser({ ...resp.data })
          setProfileChanged(false)
          setNotice('Profile updated successfully!')
          setTimeout(() => {
            setNotice(null)
          }, 5000)
        }
      }
    } catch (err) {
      console.error(err)
      setFormError('Unable to update profile.')
    } finally {
      setLoading(false)
    }
  }

  async function resendVerification() {
    clearAll()
    try {
      setLoading(true)
        let resp = await api.post('/verify/create', {
          'email': profile.unverified_email,
          'type': 'verify-email'
        })
        if (resp.data?.created) {
          setNotice('Sent new verification email to ' + profile.unverified_email + '.')
          setTimeout(() => {
            setNotice(null)
          }, 5000)
        } else {
          setFormError(resp.data?.message)
        }
      } catch (err) {
        console.error(err)
        setFormError('An error has occurred; unable to send email')
      } finally {
        setLoading(false)
      }
    }

  const clearAll = () => {
      setError(null)
      setFormError(null)
      setNotice(null)
    }

    const [profile, setProfile] = useState(null)
    const [section, setSection] = useState('profile')
    const [unverifiedAccount, setUnverifiedAccount] = useState(true)
    const [password1, setPassword1] = useState(null)
    const [password2, setPassword2] = useState(null)
    const passwordMatch = useRef()
    const [profileChanged, setProfileChanged] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [formError, setFormError] = useState(null)
    const [notice, setNotice] = useState(null)
    const { user, setUser } = useContext(LoggedInUserContext)
    const navigate = useNavigate();
    const formProps = { disabled: loading }
    useEffect(() => {
      try {
        setProfile(user)
        setUnverifiedAccount(user.hasOwnProperty('unverified_email')) // if a user's email is verified, 'unverified_email' is null and thus, not present
      } catch (err) {
        console.error(err)
        setError(err)
      } finally {
        setProfileChanged(false)
        setLoading(false)
      }
    }, [user])
    if (loading || profile == null) {
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
            {formError &&
              <ErrorContainer>{formError}</ErrorContainer>
            }
            {notice &&
              <SuccessContainer>{notice}</SuccessContainer>
            }
            <SectionOptions>
              <OptionButton selected={section === 'profile'} onClick={(e) => { setSection(e.target.textContent.toLowerCase()) }}>Profile</OptionButton>
              <OptionButton selected={section === 'communications'} onClick={(e) => { setSection(e.target.textContent.toLowerCase()) }}>Communications</OptionButton>
              <OptionButton selected={section === 'account'} onClick={(e) => { setSection(e.target.textContent.toLowerCase()) }}>Account</OptionButton>
            </SectionOptions>
            <form style={{ position: 'relative' }} onSubmit={updateProfileInformation}>

              <ToggledSection selected={(section === 'profile')}>
                <InputGroup>
                  <Input label='Link' type='text' placeholder='https://www.writingquests.org/' defaultValue={profile && profile.link} onChange={(e) => { setProfileChanges(e, 'link') }} {...formProps} />
                  <Input type='textarea' rows='7' label='Description' defaultValue={profile && profile.description} onChange={(e) => { setProfileChanges(e, 'description') }} {...formProps} />
                </InputGroup>
                <p style={{ fontSize: '0.9rem' }}><strong>Change your avatar</strong> on <a href='https://gravatar.com/profile/' target='_blank' rel='noopener notarget'>Gravatar.com</a> with your email address {profile.email}.</p>
                <StandaloneLabel style={{ 'marginBottom': '1rem' }}>Privacy</StandaloneLabel>
                {unverifiedAccount && <VerificationContainer>Your account and projects are private. You can choose to make them public after you verifiy your email address.</VerificationContainer>}
                <SectionOptions size='small' hidden={unverifiedAccount}>
                  <OptionButton size='small' selected={(profile.public === true)} value={true} onClick={(e) => { setProfileChanges(e, 'public') }}>Public</OptionButton>
                  <OptionButton size='small' selected={(profile.public === false)} value={false} onClick={(e) => { setProfileChanges(e, 'public') }}>Private</OptionButton>
                </SectionOptions>

                {(profile.public && !unverifiedAccount) && <WarningContainer><b>Your profile page and projects will be visible to the public.</b> This includes your username, bio, link, goals, progress, and other project information.</WarningContainer>
                }
                {(profile.private && !unverifiedAccount) && <WarningContainer>Your profile is private. Any buddies you have already approved will still be able to see your bio, projects, and other user information.</WarningContainer>
                }

              </ToggledSection>

              <ToggledSection selected={(section === 'communications')}>
                <Link to='/connections'>View your buddies and accounts you follow</ Link>
                <ConditionalContent hidden={unverifiedAccount}>
                  {(profile.private && profile.allow_dms) && <VerificationContainer>Your account and projects are private. You can only receive direct messages from users you've mutually befriended. <Link to="/about-dms">More information about direct messaging in Questy.</Link></VerificationContainer>}
                  <StandaloneLabel >Allow Direct Messages</StandaloneLabel>
                  <SectionOptions size='small'>
                    <OptionButton size='small' selected={(profile.allow_dms == true)} value={true} onClick={(e) => { setProfileChanges(e, 'allow_dms') }}>Yes</OptionButton>
                    <OptionButton size='small' selected={(profile.allow_dms == false)} value={false} onClick={(e) => { setProfileChanges(e, 'allow_dms') }}>No</OptionButton>
                  </SectionOptions>
                  <WarningContainer>
                    {profile.allow_dms ?
                      <>Your mutual connections <u>will</u> be able to send you direct messages.</>
                      :
                      <>Your mutual connections <u>will not</u> be able to send you direct messages.</>
                    }
                  </WarningContainer>
                </ConditionalContent>
                <StandaloneLabel>Notifications via Email</StandaloneLabel>
                <SectionOptions size='small'>
                  <OptionButton size='small' selected={(profile.send_email_notifications === true)} value={true} onClick={(e) => { setProfileChanges(e, 'send_email_notifications') }}>Yes</OptionButton>
                  <OptionButton size='small' selected={(profile.send_email_notifications === false)} value={false} onClick={(e) => { setProfileChanges(e, 'send_email_notifications') }}>No</OptionButton>
                </SectionOptions>
                <WarningContainer>
                  {profile.send_email_notifications ?
                    <>You will recieve social notifications (e.g. friend requests and direct messages) via email, as well as on the Questy website.</>
                    :
                    <>You will only see social notifications (e.g. friend requests and direct messages) on the Questy website. System notifications, such as password resets, will still be sent via email.</>
                  }
                </WarningContainer>
              </ToggledSection>

              <ToggledSection selected={(section === 'account')}>
                <InputGroup>
                  <Input label='Username' disabled={true} type='text' value={profile && profile.username} />
                  <Input label='Email Address' type='email' defaultValue={(profile.unverified_email ? profile.unverified_email : profile.email)} onChange={(e) => { setProfileChanges(e, 'unverified_email') }}{...formProps} style={{ zIndex: '1', position: 'relative' }} />
                </InputGroup>
                <VerificationNotice unverified={profile && profile.unverified_email} verified={profile && profile.email} hidden={!unverifiedAccount} />
                <InputGroup>
                  <Input label='New Password' type='password'  minLength='4' onKeyDown={(e) => { setPassword1(e.target.value) }} {...formProps} />
                  <Input label='Confirm Password' type='password'  minLength='4' onKeyDown={(e) => { setPassword2(e.target.value) }} onBlur={checkPassword} {...formProps} />
                </InputGroup>
              </ToggledSection>

              <Input type='submit' value='Save Changes' disabled={!profileChanged} />
            </form>
          </ContentBlock>
        </ContentContainer>
      </Page>
    }
  }
