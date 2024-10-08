import { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import api from '../../services/api'
import Notices from '../Notices'
import Loading from '../Loading'

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

export default function Profile () {
  async function getProfileInformation(username) {
    if (username !== '') {
      let resp
      try {
        resp = await api.get('profile/get', { params: { 'username': username }})
      } catch (e) {
        console.error('Error getting profile')
        console.error(e)
      } finally {
        setLoading(false)
      }
      setProfile(resp.data)
    }
  }
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [lookupUser, setLookupUser] = useState('')
  const user = useContext(LoggedInUserContext)
  const { username } = useParams()
  useEffect(() => {
    if (!username && !user) { // user is not logged in and viewing their own profile via /profile
      window.location.href = '/'
    } else {
      setLookupUser(username || user.username)
    }
    console.log(lookupUser)
    getProfileInformation(lookupUser)
  }, [user])
  if(loading) {
    return <Page>
      <Notices />
      <h1>Loading&hellip;</h1>
      <Loading />
    </Page>
  }
  return <Page>
    <Notices />
    <UserAvatar src={profile.gravatar} alt="User avatar for user, via Gravatar" />
    <h1>{profile.username}</h1>
    {profile.description && <div>{profile.description}</div>}
    {profile.profileOwner === false && <div>Report</div>}
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
  </Page>
}
