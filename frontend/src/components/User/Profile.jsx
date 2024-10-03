import { useContext,useState,useEffect } from 'react'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'

const { LoggedInUserContext } = context

export default function Profile () {
  async function getProfileInformation ({username}) {
    const resp = await api.get('profile/get', { params: { 'username': username }})
    setProfile(resp.data)
  }
  const user = useContext(LoggedInUserContext)
  const [profile,setProfile] = useState('')
  useEffect(() => {
    getProfileInformation(user)
  },[user])
  return <Page>
    <h1>{user.username}</h1>
    {profile.link && <div><a href={profile.link} target="_blank">{profile.link}</a></div>}
    {profile.description && <div>${profile.description}</div>}
    {profile.profileOwner === false && <div>Report</div>}
  </Page>
}
