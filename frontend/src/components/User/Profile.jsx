/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useMemo, createContext } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'
import { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'
import Progress from '../Progress'
import { ErrorContainer, ContentContainer, ContentBlock, AnimatedContainer } from '../Containers'

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
  color: #838686;
  line-height: 1rem;
  cursor: pointer;
`
function ProjectsList({username}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState()
  const {isMyProfile} = useContext(ProfileContext)
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
          dayjs(goal.end_date).isAfter(dayjs().subtract(2, 'day'))
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
              {p.goals[0].goal} {p.goals[0].units} from {dayjs(p.goals[0].start_date).format('MMM D, YYYY')} to {dayjs(p.goals[0].end_date).format('MMM D, YYYY')}
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
}

export default function Profile() {
  const [profile, setProfile] = useState()
  const [loading, setLoading] = useState(false)
  const [profileNotAvailable, setProfileNotAvailable] = useState(false)
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
            {(!isMyProfile && user) && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', textAlign: 'right', padding: '10px'}}><ReportLink onClick={() => { console.log(username)}}><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256"><path fill="#838686" d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>}
          </ProfileDataContainer>
        </ContentBlock>
        {(Boolean(profile.username) && Boolean(profile.projects?.length)) ?
          <ProjectsList username={profile.username} />
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
    </Page>
  </ProfileContext.Provider>
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
