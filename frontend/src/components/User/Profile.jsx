import { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../../services/api'
import { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'
import { ErrorContainer } from '../Containers'

const { LoggedInUserContext } = context

const UserAvatar = styled.img`
  float: right;
  margin: 0 0 0 10px;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 0;
`
//const EXAMPLE_DATA = {
  //progress: [1667, 3002, 3002, 5032, 5038, 7000],
  //goal: 50000,
  //days: 30,
//}

const EXAMPLE_DATA = [
  {day: 1, words: 1667},
  {day: 2, words: 3002},
  {day: 3, words: 3002},
  {day: 4, words: 5032},
  {day: 5, words: 5038},
  {day: 6, words: 7000},
]
const GOAL = 50000
const LENGTH = 30

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
        <li key={p.id}><Link to={`/project/${p.id}`}>{p.title ? p.title : <em>untitled</em>}</Link></li>
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
    <ResponsiveContainer width={1000} height={500}>
      <AreaChart data={EXAMPLE_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" stroke="#8884d8" dataKey="words" fillOpacity={1} fill="url(#colorUv)" />
        <CartesianGrid stroke="#ccc" strokeDasharray="3 10" />
        <XAxis type='number' allowDecimals={false} dataKey='day' tickCount={LENGTH} domain={[1, LENGTH]} label='Day' />
        <YAxis domain={[0, GOAL]} tickCount={GOAL/10000+1} allowDecimals={false} label='Words' />
        <Tooltip />
        <ReferenceLine label="Par" stroke="green" strokeDasharray="3 3" segment={[{ x: 1, y: 0 }, { x: LENGTH, y: GOAL}]} />
      </AreaChart>
    </ResponsiveContainer>
    <h2>Projects</h2>
    <ProjectsList username={profile.username} />
    <Button type='normal' onClick={() => navigate('/project/new')}>+ New Project</Button>
  </Page>
}
