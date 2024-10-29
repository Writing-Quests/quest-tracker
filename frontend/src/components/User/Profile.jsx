/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Modal from 'react-modal';
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'
import Input, { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'
import EditProgress from '../EditProgress'
import { ErrorContainer } from '../Containers'

const { LoggedInUserContext } = context

const UserAvatar = styled.img`
  margin: 0 10px 10px 0;
  border: 2px solid #313435;
  border-radius: 0 0 15px 0;
  padding: 0;
  width: 100px;
`

const ProfileDataContainer = styled.div`
  display: grid;
  padding: 10px;
  grid-template-columns: 120px auto
`

const ReportLink = styled.div`
  font-size: 0.8rem;
  color: #838686;
  line-height: 0.8rem;
  cursor: pointer;
  user-select: none;
  &:hover {
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

const ModalCloseButton = styled.div`
  float: right;
  font-size: 2rem;
  cursor: pointer;
  &:hover {
    color: #E77425;
  }
`

const reportModal = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    maxHeight: '90%',
    maxWidth: '90%',
    padding: '15px',
    marginTop: '6px',
    border: '2px solid rgba(0,0,0,0.5)',
    borderRadius: '3px',
    fontSize: '1rem',
    transition: 'all 0.15s'
  }
}

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

function ReportUserContent ({username, reporting_user}) {
  const [submitWait,setSubmitWait] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [characterCountLabel, setCharacterCountLabel] = useState("Additional Context (0/500 characters)")
  const [reportReason,setReportReason] = useState('')
  const [reportContext,setReportContext] = useState(null)
  function setWordcount (e) {
    setReportContext(e.target.value);
    if (reportContext !== null) {
      setCharacterCountLabel(`Additional Context (${reportContext.length}/500 characters)`)
      if (reportContext.length > 500) {
        setReportError('Additional context field limited to 500 characters.')
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
      console.log({
        'path': `/profile/${username}`,
        'from_user': reporting_user,
        'reason': reportReason,
        'reportContext': reportContext
      })
    } catch (err) {
      console.log(err);
      setReportError(JSON.stringify(err))
    } finally {
      setSubmitWait(false)
    }
  }
  const formProps = {disabled: submitWait}
  return (
    <>
    <h2>Report User Account</h2>
    <p>This form submits a review request to the Writing Quests team. Please do not submit multiple reports for the same profile/issue. If you have any questions, please reach out to <a href="mailto:reports@writingquests.org">reports@writingquests.org</a>.</p>
    {reportError && <ErrorContainer>{reportError}</ErrorContainer>}
    <form onSubmit={handleSubmit}>
      <Input type="text" label="Type of Report" value="User Profile" disabled={true} />
      <Input type="select" label="Reason for Report" options={reportReasons} onChange={(e) => { setReportReason(e.target.value)}}{...formProps} />
      <Input type="textarea" label={characterCountLabel} onChange={setWordcount} {...formProps} />
      <Input type="submit" value="Submit Report" disabled={reportError != null || submitWait}/>
    </form>
    </>
  )
}

function ProjectsList({username}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState()
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
  if(loading || !data) { return <span>Loading&hellip;</span> }
  if(error) { return <ErrorContainer>Error loading projects.</ErrorContainer> }
  return <>
    <ul>
      {data.map(p =>
        <li key={p.id}>
          <Link to={`/project/${p.id}`}>{p.title ? p.title : <em>untitled</em>}</Link>
          {Boolean(p.project_goals?.length) && <EditProgress project={p} />}
        </li>
      )}
    </ul>
  </>
}
ProjectsList.propTypes = {
  username: PropTypes.string.isRequired,
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportableItem, setReportableItem] = useState(false)
  const [profileNotAvailable, setProfileNotAvailable] = useState(false)
  const [modalOpen,setModalOpen] = useState(false)
  const user = useContext(LoggedInUserContext)
  const { username } = useParams()
  Modal.setAppElement('#root');
  function openModal () { setModalOpen(true) }
  function closeModal () { setModalOpen(false) }
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
  useEffect(() => {
    if (profile !== null) {
      setReportableItem(user.username !== profile.username)
    }
  },[profile])
  if(loading) {
    return <Page>
      <Notices />
      <h1>Loading&hellip;</h1>
      <Loading />
    </Page>
  } else if (profileNotAvailable) {
    return <Page>
      <ErrorContainer>Profile not found.</ErrorContainer>
    </Page>
  }
  return <Page>
    <Notices />
    <ProfileDataContainer>
      {profile.gravatar_url && <UserAvatar src={profile.gravatar_url} alt="User avatar for user, via Gravatar" /> }
      <div>
        <h1 style={{margin: '0'}}>{profile.username}</h1>
        {profile.link && <a href={(profile.link).toString()} target="_blank">{profile.link}</a>}
      </div>
      {profile.description && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', padding: '0'}}>{profile.description}</div>}
      {reportableItem && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', textAlign: 'right', padding: '10px'}}><ReportLink onClick={openModal}>&#9873; Report</ReportLink></div>}
      {reportableItem && 
        <Modal isOpen={modalOpen} onRequestClose={closeModal} style={reportModal} contentLabel="Report User Account">
          <ModalCloseButton onClick={closeModal}>&#215;</ModalCloseButton>
          <ReportUserContent username={username} reporting_user={user.username} />
        </Modal>
      }
    </ProfileDataContainer>
    <h2>Projects</h2>
    {Boolean(profile.username) && <ProjectsList username={profile.username} />}
    <Button type='normal' onClick={() => navigate('/project/new')}>+ New Project</Button>
  </Page>
}