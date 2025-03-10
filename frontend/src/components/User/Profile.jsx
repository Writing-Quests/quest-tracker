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
  grid-template-columns: 120px auto
`

const ReportLink = styled.div`
  font-size: 0.8rem;
  color: ${(props) => (props.color || '#838686')};
  line-height: 0.8rem;
  cursor: pointer;
  user-select: none;
  opacity: 0.8;
  svg path {
    fill: ${(props) => (props.color || '#838686')};
  }
  &:hover {
    opacity: 1;
    color: #E77425;
    svg {
      line-height: 1rem;
      height: 1rem;
      path {
        fill: #E77425;
      }
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

function ProjectsList({username,setUpModal}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState()
  const {isMyProfile} = useContext(ProfileContext)
  const loggedIn = (useContext(LoggedInUserContext) !== null)
  const [refetchProjects, setRefetchProjects] = useState(0)
  useEffect(() => {
    if(!username) {
      setError("Need username to load projects")
      return
    }
    (async () => {
      if(!data) { setLoading(true) }
      try {
        const resp = await api.get(`users/${username}/projects`)
        setData(resp.data['hydra:member'])
      } catch(e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [username, refetchProjects])
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
      {activeProjects.map((p, i) => <div key={p.code}>
        <div>
          <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', marginBottom: 0}}>{p.title ? p.title : <em>untitled project</em>}
          </h2>
          {isMyProfile && <>&nbsp;<small><Link to={`/project/${p.code}`}>Edit</Link></small></>}
          {Boolean(p.goals?.length) && <Progress project={p} allowEditing={isMyProfile} refetch={() => setRefetchProjects(refetchProjects+1)} />}
          {(!isMyProfile && loggedIn) && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', textAlign: 'right', padding: '10px'}}><ReportLink onClick={() => { setUpModal('project',p.code)}} color="#ffffff"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256"><path d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>}
        </div>
        {(activeProjects.length - 1) !== i && <hr />}
      </div>)}
      </ContentBlock>
    </AnimatedContainer>}
    {isMyProfile && <ContentBlock>
      <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto'}}>+ Start a new project</Button>
    </ContentBlock>}
    {Boolean(futureProjects.length) && <AnimatedContainer color='#5B504E'>
      <h2>Upcoming Projects</h2>
      <ul>
        {futureProjects.map((p, i) =>
          <li key={i}>
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

export default function Profile() {
  const [profile, setProfile] = useState()
  const [loading, setLoading] = useState(true)
  const [profileNotAvailable, setProfileNotAvailable] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('Report User Profile Content')
  const [modalForm, setModalForm] = useState('user')
  const [reportedIdentifier, setReportedIdentifier] = useState('')
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
            {(!isMyProfile && user) && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', textAlign: 'right', padding: '10px'}}><ReportLink onClick={() => {setUpModal('user')}}><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256"><path d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>}
          </ProfileDataContainer>
        </ContentBlock>
        {(Boolean(profile.username) && Boolean(profile.projects?.length)) ?
          <ProjectsList username={profile.username} setUpModal={setUpModal} />
          :
          (isMyProfile ?
            <>
              <p>No projects yet!</p>
              <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto'}}>+ Start a new project</Button>
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
