/* eslint-disable react/prop-types */
import { useContext,useState,useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'

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
  useEffect(() => {
    getProfileInformation(username)
  },[])
  if(loading) {
    return <Page>Loading&hellip;</Page>
  }
  if (error !== null) {
    let msg = 'An unknown error occured.'
    if (error.status === 404) {
      msg = `No profile found for username: ${username}.`
    }
    return <Page>
      <ErrorContainer>{msg}</ErrorContainer>
      <p>See <Link to="/profiles/public">all public users</Link>.</p>
    </Page>
  } else {
    return <Page>
      <ProfileDataContainer>
        <ProfileLeadInfo profile={profile} username={username} />
      </ProfileDataContainer>
    </Page>
  }
}

export function AllPublicProfiles () {
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
      Loading&hellip;
    </Page>
  } else {
    return <Page>
      {cards}
    </Page>
  }
}