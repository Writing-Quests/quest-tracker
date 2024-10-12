/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'
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

function ProfileLeadInfo (props) {
  const profile = props.profile
  const username = props.username
  return <>
    {profile.gravatar && <UserAvatar src={profile.gravatar} alt="User avatar for user, via Gravatar" /> }
    <div>
      <h1 style={{margin: '0'}}>{username}</h1>
      {profile.link && <a href={profile.link} target="_blank">{profile.link}</a>}
    </div>
    {profile.description && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', padding: '0 10px'}}>{profile.description}</div>}
    {!profile.profileOwner && <div style={{gridColumnStart: '1', gridColumnEnd: 'span 2', textAlign: 'right', padding: '10px'}}><ReportLink onClick={() => { console.log(username)}}><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 256 256"><path fill="#838686" d="M232 56v120a8 8 0 0 1-2.76 6c-15.28 13.23-29.89 18-43.82 18c-18.91 0-36.57-8.74-53-16.85C105.87 170 82.79 158.61 56 179.77V224a8 8 0 0 1-16 0V56a8 8 0 0 1 2.77-6c36-31.18 68.31-15.21 96.79-1.12C167 62.46 190.79 74.2 218.76 50A8 8 0 0 1 232 56"/></svg> Report</ReportLink></div>}
  </>
}

export function UserProfile () {
  async function getProfileInformation (username) {
    try {
      const resp = await api.get('profile/$get', { params: { 'username': username }})
      setProfile(resp.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  const [profile, setProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [lookupUser, setLookupUser] = useState('')
  const [profile,setProfile] = useState('')
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const user = useContext(LoggedInUserContext)
  useEffect(() => {
    getProfileInformation(user.username)
  },[user])
  if(loading) {
    return <Page>Loading&hellip;</Page>
  }
  if (error !== null) {
    let msg = 'An unknown error occured.'
    return <Page>
      <ErrorContainer>{msg}</ErrorContainer>
      <p>See <Link to="/profiles/public">all public users</Link>.</p>
    </Page>
  } else {
    return <Page>
      <ProfileDataContainer>
        <ProfileLeadInfo profile={profile} username={user.username} />
      </ProfileDataContainer>
    </Page>
  }
}

export function SpecificProfile () {
  async function getProfileInformation (username) {
    try {
      const resp = await api.get('profile/$get', { params: { 'username': username }})
      setProfile(resp.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  const [profile,setProfile] = useState('')
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const {username} = useParams();
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
