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
  float: right;
  margin: 0 0 0 10px;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 0;
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
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
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
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, username])
  if(loading) {
    return <Page>
      <Notices />
      <h1>Loading&hellip;</h1>
      <Loading />
    </Page>
  }
  return <Page>
    <Notices />
    <UserAvatar src={profile.gravatar_url} alt="User avatar for user, via Gravatar" />
    <h1>{profile.username}</h1>
    {profile.description && <div>{profile.description}</div>}
    {profile.username !== user.username && <div>Report</div>}
    <h2>Projects</h2>
    {Boolean(profile.username) && <ProjectsList username={profile.username} />}
    <Button type='normal' onClick={() => navigate('/project/new')}>+ New Project</Button>
  </Page>
}
