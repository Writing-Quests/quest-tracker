/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useMemo, createContext } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'
import Input, { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'
import Progress from '../Progress'
import { ErrorContainer, ContentContainer, ContentBlock, AnimatedContainer, SuccessContainer } from '../Containers'
import { ModalStyle, ModalCloseButton } from '../Modal'
import Modal from 'react-modal'
import {CountdownBar} from '../Forms/Countdown'

const { LoggedInUserContext } = context

const ProfileContext = createContext()

const UserAvatar = styled.img`
  margin: 0 10px 10px 0;
  padding: 0;
  width: 100px;
  border-radius: 10px;
  border: none;
`

const ProfileDataContainer = styled.div`
  display: grid;
  padding: 10px;
  grid-template-columns: 120px auto;
`

const InteractionHolder = styled.div`
  padding: 5px 0;
  grid-column-start: 1;
  grid-column-end: span 2;
  user-select: none;
  display: flex;
  justify-items: space-between;
  align-items: bottom;
  div:first-child {
    margin-right: 0;
  }
  margin-top: 3px;
  border-top: 1px solid #EBEBEB;
`

const ConnectionButton = styled.div`
  position: relative;
  font-size: 1rem;
  height: 1rem;
  margin: 0 2px;
  padding: 3px;
  color: ${(props) => (props.color || '#838686')};
  cursor: pointer;
  svg {
    height: 1.2rem;
    width: auto;
    line-height: 1.2rem; 
    path {
      fill: ${(props) => (props.color || '#838686')};
    }
  }
  &:hover {
    opacity: 1;
    color: #E77425;
    svg path {
        fill: #E77425;
    }
    &:before {
      display: block;
    }
  }
  &:before {
    content: attr(data-tooltip);
    top: calc(100% + 1.2rem);
    left: 0;
    min-width: 25ch;
    max-width: 50px;
    background-color: #FAFAFA;
    border: 1px solid #EBEBEB;
    border-radius: 3px;
    padding: 10px;
    color: #333;
    position: absolute;
    display: none;
  }
}
`

const ReportLink = styled.div`
  font-size: 0.8rem;
  color: ${(props) => (props.color || '#838686')};
  cursor: pointer;
  opacity: 0.8;
  user-select: none;
  &:hover {
    opacity: 1;
    color: #E77425;
    svg path {
      fill: #E77425;
    }
  }
  svg {
    line-height: 1rem;
    height: 1rem;
    path {
      fill: ${(props) => (props.color || '#838686')};
    }
  }
`

const reportReasons = [{
  'value': 'abuse',
  'text': 'Abusive Material'
},{
  'value':'spam',
  'text': 'Spam Content'
},{
  'value':'other',
  'text': 'Other'
}]

function ReportProfileContent ({reportType, reportedIdentifier, closeModal, modalTitle}) {
  const [submitWait,setSubmitWait] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [characterCountLabel, setCharacterCountLabel] = useState(0)
  const [reportReason,setReportReason] = useState('')
  const [reportContext,setReportContext] = useState(null)
  const [reportSubmitted,setReportSubmitted] = useState(false)
  function setWordcount (e) {
    let count = e.target.value.length;
    if (count > 0) {
      setCharacterCountLabel(count)
      if (count > 1000) {
        setReportError('Additional context field limited to 1000 characters.')
      } else if (reportError !== null) {
        setReportError(null)
      }
    }
  }
  async function handleSubmit (e) {
    setSubmitWait(true)
    setReportError(null)
    e && e.preventDefault()
    try {
      const reportInfo = {
        'reported_identifier': reportedIdentifier,
        'type': reportType,
        'reason': reportReason,
        'details': reportContext
      }
      let resp = await api.post('report/new',reportInfo)
      if (resp.statusText == 'Created') {
        setReportSubmitted(true)
      }
    } catch (err) {
      console.error(err);
      setReportError(JSON.stringify(err))
      
    } finally {
      setSubmitWait(false)
    }
  }
  const formProps = {disabled: submitWait || reportSubmitted}
  return (
    <>
    <h2>{modalTitle}</h2>
    <p>This form submits a review request to the Writing Quests team. Please do not submit multiple reports for the same profile/issue. If you have any questions, please reach out to <a href="mailto:reports@writingquests.org">reports@writingquests.org</a>.</p>
    {reportError && <ErrorContainer>An error occurred while submitting this report. Please try again, or email our team directly.</ErrorContainer>}
    {submitWait && <div>Please wait...</div>}
    {reportSubmitted && <SuccessContainer><p>Your report has been submitted and the administrators have been alerted. You should receive a copy in your email for your records. We&apos;ll review the report at our earliest convenience. Thank you for letting us know.</p><p>You can close this window; it will close automatically in five seconds.</p><CountdownBar totalTime={5} closeModal={closeModal} colorScheme="success" /></SuccessContainer>}
    <form onSubmit={handleSubmit}>
      <Input type="text" label="Type of Report" value={reportType} disabled={true} />
      <Input type="select" label="Reason for Report" onChange={(e) => { setReportReason(e.target.value)}}{...formProps}>
        <option value="null"></option>
        {reportReasons.map(({value,text}) => { return <option key={value} value={value}>{text}</option>})}
      </Input>
      <Input type="textarea" label={`Additional Context (${characterCountLabel}/1000 characters)`} onKeyDown={setWordcount} onChange={(e) => {setReportContext(e.target.value)}} {...formProps} />
      <Input type="submit" value={submitWait ? "Submitting..." : (reportError !== null ? 'Resubmit Report': 'Submit Report')} disabled={submitWait || reportSubmitted} />
    </form>
    </>
  )
}

async function manageConnection ({status,connected_user_id,initiating_user_id,connection_info,updateSubmitWait}) {
  // TODO: we need to reset the page after changes on the interaction take place
  console.log(connection_info)
  let resp = null;
  updateSubmitWait(true,'Please Wait');
  switch (status) {
    case 'delete':
      resp = await api.delete(`/connection/${connection_info.id}`)
    break;

    default:
      if (connection_info) { // these is an existing connection between these two users
        resp = await api.patch(`/connection/${connection_info.id}`,{
          'status': status
        })
      } else { // this is a brand new connection
        resp = await api.post('/connection/new', {
          'status': status,
          'connected_user_id': connected_user_id,
          'initiating_user_id': initiating_user_id
        })
      }
    break;
  }
  if (resp) {
    updateSubmitWait(false,'');
    if (status == 'blocked') {
      window.location.href = '/'
    }
  }
}

function FriendButtons ({connection,profile,user,updateSubmitWait}) {
  switch (connection.status) {
    case 'pending':
      if (connection.initiating_user_id == user.id) { // the person who initiated the request is viewing it
        return (
          <ConnectionButton data-tooltip={"Cancel your friend request with " + profile.username} onClick={() => {manageConnection({status:'delete',connected_user_id:profile.id,initiating_user_id:user.id,connection_info:connection,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="currentColor" d="M15 14c2.67 0 8 1.33 8 4v2H7v-2c0-2.67 5.33-4 8-4m0-2a4 4 0 0 1-4-4a4 4 0 0 1 4-4a4 4 0 0 1 4 4a4 4 0 0 1-4 4M5 9.59l2.12-2.13l1.42 1.42L6.41 11l2.13 2.12l-1.42 1.42L5 12.41l-2.12 2.13l-1.42-1.42L3.59 11L1.46 8.88l1.42-1.42z"/></svg></ConnectionButton>
        )
      } else { // user is viewing the account of a user who has sent a friend request
        return (
          <ConnectionButton data-tooltip={'Accept ' + profile.username + '\'s friend request'} onClick={() => {manageConnection({status:'mutual',connected_user_id:profile.id,initiating_user_id:user.id,connection_info:connection,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13 8a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4a4 4 0 0 1 4 4m4 10v2H1v-2c0-2.21 3.58-4 8-4s8 1.79 8 4m3.5-3.5V16H19v-1.5zm-2-5H17V9a3 3 0 0 1 3-3a3 3 0 0 1 3 3c0 .97-.5 1.88-1.29 2.41l-.3.19c-.57.4-.91 1.01-.91 1.7v.2H19v-.2c0-1.19.6-2.3 1.59-2.95l.29-.19c.39-.26.62-.69.62-1.16A1.5 1.5 0 0 0 20 7.5A1.5 1.5 0 0 0 18.5 9z"/></svg></ConnectionButton>
        )
      }

    case 'mutual':
    return (
      <ConnectionButton data-tooltip={"Remove " + profile.username + " as a buddy"} onClick={() => {manageConnection({status:'delete',connected_user_id:profile.id,initiating_user_id:user.id, connection_info:connection,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><path fill="currentColor" d="M15 14c2.67 0 8 1.33 8 4v2H7v-2c0-2.67 5.33-4 8-4m0-2a4 4 0 0 1-4-4a4 4 0 0 1 4-4a4 4 0 0 1 4 4a4 4 0 0 1-4 4M5 9.59l2.12-2.13l1.42 1.42L6.41 11l2.13 2.12l-1.42 1.42L5 12.41l-2.12 2.13l-1.42-1.42L3.59 11L1.46 8.88l1.42-1.42z"/></svg></ConnectionButton>
    )

    default: // it's probably null, meaning there is no existing connection. could be following.
      return (
        <>
        <ConnectionButton data-tooltip={"Send " + profile.username + " a friend request"}  onClick={() => {manageConnection({status:'pending',connected_user_id:profile.id,initiating_user_id:user.id,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><path fill="currentColor" d="M15 14c-2.67 0-8 1.33-8 4v2h16v-2c0-2.67-5.33-4-8-4m-9-4V7H4v3H1v2h3v3h2v-3h3v-2m6 2a4 4 0 0 0 4-4a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4"/></svg></ConnectionButton>
        {connection.status != 'following' &&
          <ConnectionButton type="follow" data-tooltip={"Follow " + profile.username} onClick={() => {manageConnection({status:'following',connected_user_id:profile.id,initiating_user_id:user.id, connection_info:connection,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27zm0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93z"/></svg></ConnectionButton>
        }
        {connection.status == 'following' && 
          <ConnectionButton type="unfollow" data-tooltip={"Stop following " + profile.username} onClick={() => {manageConnection({status:'delete',connected_user_id:profile.id,initiating_user_id:user.id, connection_info:connection,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2.5 3.77L3.78 2.5L21.5 20.22l-1.27 1.28l-1.5-1.5h-2c0-.75-.06-1.5-.19-2.19L6.19 7.46C5.5 7.33 4.75 7.27 4 7.27v-2zm3.68 11.87a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 10.1a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93zm5.13-4.79c4.46 1.56 8 5.1 9.56 9.56z"/></svg></ConnectionButton>
        }
        </>
      )
  }
}


function MessageButton ({connection,profile,user}) {
  // TODO: DMing isn't implemented, but the button is here for when it is
  if (connection && connection.status === 'mutual') { // if you're mutual friends, show the DM button
    return (
      <ConnectionButton data-tooltip={"Send " + profile.username + " a direct message"} type="message"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 12H6v-2h12zm0-3H6V9h12zm0-3H6V6h12z"/></svg></ConnectionButton>
    )
  }
}

function ProjectsList({username,setUpModal}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState()
  const {isMyProfile} = useContext(ProfileContext)
  const loggedIn = (useContext(LoggedInUserContext) !== null)
  useEffect(() => {
    if(!username) {
      setError("Need username to load projects")
      return
    }
    (async () => {
      setLoading(true)
      try {
        const resp = await api.get(`users/${username}/projects`)
        setData(resp.data['hydra:member'])
      } catch(e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [username])
  const { activeProjects, pastProjects, futureProjects } = useMemo(() => {
    if(!data) { return {} }
    const activeProjects = []
    const pastProjects = []
    const futureProjects = []
    for (const d of data) {
      const hasActiveGoal = (d.goals || []).some(goal => {
        //if(d.id === 11) { debugger }
        if(!goal.end_date || !goal.start_date) { return false }
        if(
          dayjs(goal.end_date).isAfter(dayjs().subtract(7, 'day'))
          &&
          dayjs(goal.start_date).isBefore(dayjs().add(2, 'day'))
        ) {
          return true
        }
      })
      if(hasActiveGoal) {
        activeProjects.push(d)
        continue
      }
      const hasPastGoal = (d.goals || []).some(goal => {
        if(!goal.end_date) { return false }
        if(dayjs(goal.end_date).isBefore(dayjs())) { return true }
      })
      if(hasPastGoal) {
        pastProjects.push(d)
      } else {
        futureProjects.push(d)
      }
    }
    return { activeProjects, pastProjects, futureProjects }
  }, [data])
  if(loading || !data) { return <Loading /> }
  if(error) { return <ErrorContainer>Error loading projects.</ErrorContainer> }
  return <>
    {Boolean(activeProjects.length) && <AnimatedContainer>
      <ContentBlock>
      {activeProjects.map((p, i) => <>
        <div key={p.code}>
          <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: 0}}>{p.title ? p.title : <em>untitled project</em>}
          </h2>
          {isMyProfile && <>&nbsp;<small><Link to={`/project/${p.code}`}>Edit</Link></small></>}
          {Boolean(p.goals?.length) && <Progress project={p} allowEditing={isMyProfile} />}
          {(!isMyProfile && loggedIn) && 
            <InteractionHolder>
              <div style={{'flexGrow': 2, 'textAlign': 'right', 'width': '100%'}}><ReportLink onClick={() => { setUpModal('project',p.code)}} color="#ffffff"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 
              256"><path d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>
            </InteractionHolder>
          }
        </div>
        {(activeProjects.length - 1) !== i && <hr />}
      </>)}
      </ContentBlock>
    </AnimatedContainer>}
    {isMyProfile && <ContentBlock>
      <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto'}}>+ Start a new project</Button>
    </ContentBlock>}
    {Boolean(futureProjects.length) && <AnimatedContainer color='#5B504E'>
      <h2>Upcoming Projects</h2>
      <ul>
        {futureProjects.map(p =>
          <li key={p.code}>
            <strong>{p.title ? p.title : <em>untitled project</em>}</strong>
            &nbsp;
            {p.goals?.[0] && <>
              {Number(p.goals[0].goal).toLocaleString()} {p.goals[0].units} from {dayjs(p.goals[0].start_date).format('MMM D, YYYY')} to {dayjs(p.goals[0].end_date).format('MMM D, YYYY')}
            </>}
            &nbsp;
            {isMyProfile && <Link to={`/project/${p.code}`}>Edit</Link>}
          </li>
        )}
      </ul>
    </AnimatedContainer>}
    {Boolean(pastProjects.length) && <ContentBlock>
      <h2>Past Projects</h2>
      {isMyProfile && <p><em>Viewing details for upcoming and past projects is coming soon! Contact us in the meantime if you&rsquo;d like your data.</em></p>}
      <ul>
        {pastProjects.map(p =>
          <li key={p.code}>
            <strong>{p.title ? p.title : <em>untitled project</em>}</strong> ({p.goals?.[0]?.goal_progress_percent >= 100 ? 'Completed! 🎉' : ((p.goals?.[0]?.goal_progress_percent || '0') + '%')})
            &nbsp;
            {isMyProfile && <Link to={`/project/${p.code}`}>Edit</Link>}
          </li>
        )}
      </ul>
      {isMyProfile && <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto'}}>+ Start a new project</Button>}
    </ContentBlock>}
  </>
}
ProjectsList.propTypes = {
  username: PropTypes.string.isRequired,
  setUpModal: PropTypes.func
}

  /*
  TODO:
   - some sort of following incidicator (color it green?)
   -  no, wait, need to be able to unfollow
   - should there be a confirmation? 
  */

export default function Profile() {
  const [profile, setProfile] = useState()
  const [loading, setLoading] = useState(true)
  const [connection, setConnection] = useState(null)
  const [profileNotAvailable, setProfileNotAvailable] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('Report User Profile Content')
  const [modalForm, setModalForm] = useState('user')
  const [reportedIdentifier, setReportedIdentifier] = useState('')
  const [submitWait,setSubmitWait] = useState(false);
  const [waitingText,setWaitingText] = useState('');
  const user = useContext(LoggedInUserContext)
  const { username } = useParams()
  const navigate = useNavigate()
  const url = useMemo(() => {
    if(!profile?.link?.length) { return }
    let l = profile.link
    if(l.slice(0,4) !== 'http') {
      l = 'https://' + l
    }
    try {
      const u = new URL(l)
      if(!(u.protocol === 'http:' || u.protocol === 'https:')) {
        throw new Error('Invalid URL')
      }
      return u
    } catch(e) {
      console.error(e)
      return
    }
  }, [profile])
  function updateSubmitWait (waitStatus,text) {
    setSubmitWait(waitStatus)
    setWaitingText(text)
  }
  function closeModal () { 
    setIsModalOpen(false)
  }
  function setUpModal (form,projectCode=null) {
    switch (form) {
      case 'user':
        setModalTitle('Report User Profile Content')
        setModalForm('Profile')
        setReportedIdentifier(profile?.username)
      break;

      case 'project':
        setModalTitle('Report User Project Content')
        setModalForm('Project')
        setReportedIdentifier(projectCode)
      break;
    }
    setIsModalOpen(true)
  }
  useEffect(() => {
    let lookupUser
    if(username?.length) { lookupUser = username }
    else { lookupUser = user.username }
    if(!lookupUser?.length) { return }
    (async () => {
      setLoading(true)
      try {
        const resp = await api.get(`users/${lookupUser}`)
        setProfile(resp.data)
        if (user && lookupUser !== user.username) {
          const respConnection = await api.get(`connection/status/${resp.data.id}/${user.id}`);
          if (respConnection.data.status == 'blocked') {
            setProfileNotAvailable(true);
            if (respConnection.data.initiating_user_id == user.id) { // you have blocked this user
              // some sort of alert/error container
              console.log('TOOD: how to handle "you have blocked this user, go to settings to unblock.')
            } 
          } else {
            setConnection(respConnection.data);
          }
        }
      } catch (e) {
        console.error('Error getting profile')
        setProfileNotAvailable(true)
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, username])
  if(loading) {
    return <Page>
      <Notices />
      <Loading />
    </Page>
  } else if (profileNotAvailable) {
    return <Page>
      <ErrorContainer>Profile not found.</ErrorContainer>
    </Page>
  }
  const isMyProfile = user && (profile?.username === user?.username)
  return <ProfileContext.Provider value={{isMyProfile}}>
    <Page>
      <ContentContainer>
        <ContentBlock>
          <Notices />
          <ProfileDataContainer>
            {profile.gravatar_url && <UserAvatar src={profile.gravatar_url} alt="User avatar for user, via Gravatar" /> }
            <div>
              <h1 style={{margin: 0, fontSize: '2.5rem'}}>{profile.username}</h1>
              {url && <a href={url.href} target="_blank" rel="noopener noreferrer nofollow">{url.hostname}</a>}
            </div>
            {profile.description && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', padding: '0'}}>{profile.description}</div>}
            {submitWait && 
              <Loading inline={true} text={waitingText} />
            }
            {(!isMyProfile && user && connection) &&
                <InteractionHolder>
                  <FriendButtons connection={connection}  profile={profile} user={user} updateSubmitWait={updateSubmitWait} />
                  <ConnectionButton type="block" data-tooltip={"Block " + profile.username} onClick={() => {manageConnection({status:'blocked',connected_user_id:profile.id,initiating_user_id:user.id,connection_info:connection,updateSubmitWait:updateSubmitWait})}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10 4a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4m7.5 9C15 13 13 15 13 17.5s2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5M10 14c-4.42 0-8 1.79-8 4v2h9.5a6.5 6.5 0 0 1-.5-2.5a6.5 6.5 0 0 1 .95-3.36c-.63-.08-1.27-.14-1.95-.14m7.5.5c1.66 0 3 1.34 3 3c0 .56-.15 1.08-.42 1.5L16 14.92c.42-.27.94-.42 1.5-.42M14.92 16L19 20.08c-.42.27-.94.42-1.5.42c-1.66 0-3-1.34-3-3c0-.56.15-1.08.42-1.5"/></svg></ConnectionButton>
                  <MessageButton connection={connection}  profile={profile} user={user} />
                  <div style={{'flexGrow': 2, 'textAlign': 'right', 'width': '100%'}}><ReportLink style={{'display': 'inline-block'}} onClick={() => {setUpModal('user')}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>
                </InteractionHolder>
            }
          </ProfileDataContainer>
        </ContentBlock>
        {(Boolean(profile.username) && Boolean(profile.projects?.length)) ?
          <ProjectsList username={profile.username} setUpModal={setUpModal} />
          :
          (isMyProfile ?
            <>
              <p>No projects yet!</p>
              <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'blocked', margin: 'auto'}}>+ Start a new project</Button>
            </>
            :
            'No projects to display. Encourage them to start one!'
          )
        }
      </ContentContainer>
      {(!isMyProfile && user) && 
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={ModalStyle} contentLabel={modalTitle}>
          <ModalCloseButton onClick={closeModal}>&#215;</ModalCloseButton>
          <ReportProfileContent reportedIdentifier={reportedIdentifier} reportType={modalForm} closeModal={closeModal} title={modalTitle}/>
        </Modal>
      }
    </Page>
  </ProfileContext.Provider>
}