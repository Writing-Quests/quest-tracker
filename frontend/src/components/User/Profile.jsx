import { useContext,useState,useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import axios from 'axios'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'

const { LoggedInUserContext } = context

const UserAvatar = styled.img`
  float: right;
  margin: 0 0 0 10px;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 0;
`

export default function Profile () {
  async function getProfileInformation (username) {
    if (username !== '') {
      const resp = await api.get('profile/get', { params: { 'username': username }})
      const gravatar = await axios.get(resp.data.gravatar);
      console.log(gravatar)
      setProfile(resp.data)
      console.log(profile)
      setLoading(false)
    }
  }
  const [profile,setProfile] = useState('')
  const [loading,setLoading] = useState(true)
  const [lookupUser,setLookupUser] = useState('')
  const user = useContext(LoggedInUserContext)
  const {username} = useParams();
  useEffect(() => {
    if (!username && !user) { // user is not logged in and viewing their own profile via /profile
      window.location.href = '/'
    } else {
      setLookupUser(username || user.username)
    }
    console.log(lookupUser)
    getProfileInformation(lookupUser)
  },[user])
  return <Page>
    <UserAvatar src={profile.gravatar} alt="User avatar for user, via Gravatar" />
    <h1>{username}</h1>
    
    {profile.description && <div>${profile.description}</div>}
    {profile.profileOwner === false && <div>Report</div>}
  </Page>
}
