/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../../services/api'
import { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'

const { LoggedInUserContext } = context

const UserAvatar = styled.img`
  margin: 10px;
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

const ErrorContainer = styled.div`
  width: 100%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
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


export default function Profile () {
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
    {profile.gravatar && <UserAvatar src={profile.gravatar_url} alt="User avatar for user, via Gravatar" />}
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
    <ul>
      {profile?.project_data?.map(p =>
        <li key={p.id}><Link to={`/project/${p.id}`}>{p.title ? p.title : <em>untitled</em>}</Link></li>
      )}
    </ul>
    <Button type='normal' onClick={() => navigate('/project/new')}>+ New Project</Button>
  </Page>
}

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