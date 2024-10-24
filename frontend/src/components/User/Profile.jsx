/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'
import { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'
import EditProgress from '../EditProgress'
import { ErrorContainer } from '../Containers'

const { LoggedInUserContext } = context

const UserAvatar = styled.img`
  margin: 0 10px 10px 0;
  border: 2px solid #AF402D;
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
  line-height: 1rem;
  cursor: pointer;
`
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
  const [profile, setProfile] = useState()
  const [loading, setLoading] = useState(false)
  const [profileNotAvailable, setProfileNotAvailable] = useState(false)
  const user = useContext(LoggedInUserContext)
  const { username } = useParams()
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
  if(loading || (!profileNotAvailable && !profile)) {
    return <Page>
      <Notices />
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
        {Boolean(profile.link) && <a href={profile.link} target="_blank">{profile.link}</a>}
      </div>
      {profile.description && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', padding: '0'}}>{profile.description}</div>}
      {(profile.username !== user.username) && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', textAlign: 'right', padding: '10px'}}><ReportLink onClick={() => { console.log(username)}}><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256"><path fill="#838686" d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>}
    </ProfileDataContainer>
    <h2>Projects</h2>
    {Boolean(profile.username) && <ProjectsList username={profile.username} />}
    <Button type='normal' onClick={() => navigate('/project/new')}>+ New Project</Button>
  </Page>
}

// note: this returns a list of public profiles; not in use as of this comment
// eslint-disable-next-line no-unused-vars
function AllPublicProfiles () {
  const ProfileCard = styled.div`
    clear: both;
    width: 75%;
    margin: 10px auto;
    border: 1px solid #AF402D;
    border-radius: 3px;
    padding: 10px;
    cursor: pointer;
    position: relative;
  `

  const CardAvatar = styled.img`
    width: 75px;
    float: left;
    margin: 0 10px 10px 0;
  `

  const EstablishedAt = styled.span`
    position: abolute;
    font-size: 0.8rem;
    font-style: italic;
    bottom: 10px;
    right: 10px;
  `
  function ProfileInner(props) {
    const profile = props.profile
    return <>
      { profile.gravatar && <CardAvatar src={profile.gravatar} />}
      <h1 style={{margin: '0'}}>{profile.username}</h1>
      { profile.description && <p>{profile.description}</p> }
      <EstablishedAt>Since {profile.memberSince.substring(0,4)}</EstablishedAt>
    </>
  }
  async function getAllProfiles () {
    const resp = await api.get('profile/$public')
    setLoading(false)
    const cardsMap = resp.data.map((card) => <ProfileCard key={card.username} onClick={() => {window.location.href = `/profile/${card.username}`}}><ProfileInner profile={card} /></ProfileCard>)
    setCards(cardsMap)
  }
  const [loading,setLoading] = useState(true)
  const [cards,setCards] = useState('')
  useEffect(() => {
    getAllProfiles()
  },[])
  if (loading) {
    return <Page>
      <Notices />
      <h1>Loading&hellip;</h1>
      <Loading />
    </Page>
  } else {
    return <Page>
      {cards}
    </Page>
  }
}
