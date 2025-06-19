/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../services/context'
import Page from './Page'
import api from '../services/api'
import Loading from './Loading'
import Input, { Button } from './Forms/Input'
import { ContentContainer, ContentBlock,PaginationContainer } from './Containers'

const { LoggedInUserContext } = context

const UserAvatar = styled.img`
  margin: 0;
  padding: 0;
  width: 75px;
  border: none;
  float: right;
`

const ProfileDataContainer = styled.div`
  display: block;
  width: 100%;
`

const IndividualProfile = styled.div`
  position: relative;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 10px;
  padding: 0.5rem;
  margin: 1rem 0;
  width: 100%;
  overflow: hidden;
  &:hover {
    cursor: pointer;
  }
  p.username {
    margin: 0.5rem 0;
    font-weight: bold;
    font-size: 1.2rem;
  }
  p.description {
    margin: 0 0 1rem 0;
  }
  p.connection {
    text-align: right;
    width: 95%;
    display: block;
    position: absolute;
    bottom: -0.5rem;
    font-size: 0.8rem;
    font-style: italic;
    color:rgb(255, 155, 105);
  }
`

function DisplayUserInfo ({buddyInfo,user}) {
  /*
  {"id":6,"user":"/api/users/amanda","created_at":"2025-05-17T17:37:52+00:00","edited_at":"2025-05-17T17:37:52+00:00","interactions":[],"title":null,"details":{"unit":"pages","verb":"removed","value":"4","project_title":"This Crazy Building Life"},"update_type":"progress"}
  */
  const buddyUsername = (buddyInfo.initiating_user_id === user.id) ? buddyInfo.connected_username : buddyInfo.initiating_username
  const buddyUpdates = buddyInfo.updates.map((update) => <li key={update.details.id}>Updated <i>{update.details.project_title}</i>: {update.details.verb} {update.details.value} {update.details.unit}</li>)
  return (
    <>
    <strong><a href={`/profile/${buddyUsername}`} title={`${buddyUsername}'s profile`}>{buddyUsername}</a></strong>
    <ul>
      {buddyUpdates}
    </ul>
    </>
  )
}

function UserMiniDisplay ({user}) {
  let describeConnection = null
  switch (user.connection) {
    case 'following':
      describeConnection = `You follow ${user.username}.`
    break

    case 'mutual':
      describeConnection = `You & ${user.username} are buddies.`
    break
  }
  return (
    <IndividualProfile onClick={()=> { window.location.href = `/profile/${user.username}`}}>
      {user.gravatar && <UserAvatar src={user.gravatar} />}
      <p className="username"><a href={`/profile/${user.username}`} title={`${user.username}'s profile`}>{user.username}</a></p>
      {user.description && <p className="description">{user.description}</p>}
      {describeConnection && <p className="connection">{describeConnection}</p>}
      {user.last_activity_timestamp && <p>{user.last_activity_timestamp}</p>}
    </IndividualProfile>
  )
}

export function PublicFeed () {
  const user = useContext(LoggedInUserContext)
  const [currentPageUsers,setCurrentPageUsers] = useState([])
  const [totalUsers,setTotalUsers] = useState([])
  const [pages,setPages] = useState([])
  const [loading, setLoading] = useState(true)
  async function getPageConnections (pageUrl=`profiles/public?page=1`) {
    setLoading(true)
    const resp = await api.get(pageUrl)
    console.log(resp.data)
    setCurrentPageUsers(resp.data['hydra:member'])
    setTotalUsers(resp?.data['hydra:totalItems'])
    setPages(resp.data['hydra:view'] || null) // if there are fewer than 10 results, no page information returned
    setLoading(false)
  }
  useEffect(() => {
    if (currentPageUsers.length == 0) { getPageConnections() };
  },[user])
  if (loading) {
    return <Page>
      <Loading />
    </Page>
  } else {
    const users = currentPageUsers.map((u) => { return <UserMiniDisplay key={u.username} user={u} />})
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
           <ProfileDataContainer>
            {users}
            </ProfileDataContainer>
          </ContentBlock>
        </ContentContainer>
        {pages && 
          <PaginationContainer hydraPageInfo={pages} pageFlip={getPageConnections}>
            <p>{totalUsers} public users</p>
          </PaginationContainer>
        }
      </Page>
    )
  }
}

export function HomeFeed() {
  const user = useContext(LoggedInUserContext)
  const navigate = useNavigate()
  const [following,setFollowing] = useState([])
  const [buddies,setBuddies] = useState([])
  const [projects,setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function getConnections () {
      const resp = await api.get("connection/feed")
      setFollowing(resp.data.following)
      setBuddies(resp.data.mutual)
    }
    async function getProjects () {
        const resp = await api.get(`users/${user.username}/projects`)
        console.log(resp)
        setProjects(resp.data['hydra:member'])
    }
    try {
      getConnections()
      //getProjects()
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  },[user])
  const buddy_blocks = buddies.map((buddy) => <div key={buddy.id} style={{padding: '5px'}}><DisplayUserInfo buddyInfo={buddy} user={user} /></div>)
  const follow_blocks = following.map((follow) => <div key={follow.id} style={{padding: '5px'}}><DisplayUserInfo buddyInfo={follow} user={user} /></div>)
 // const project_blocks = projects.map((pr) => <div key={pr.id} style={{padding: '5px'}}><p>{pr.title}</p></div>)
  if (loading) {
    return <Page>
      <Loading />
    </Page>
  } else {
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
            <div style={{'border': '1px solid red', 'position': 'relative'}}>
              <h1>Projects</h1>
              <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto', 'position': 'absolute', 'top': '1rem', 'right': '1rem'}}>+ New Project</Button>
              {/*project_blocks*/}
            </div>
            <div style={{'float': 'right','width': '50%', 'border': '1px dotted rebeccapurple'}}>
              {buddies.length > 0 && 
              <>
                <h1>Friends</h1>
                {buddy_blocks}
              </>
              }
              {following.length > 0 &&
              <>
                <h1>Following</h1>
                {follow_blocks}
              </>
              }
              {(buddies.length === 0 && following.length === 0) &&
              <>
                <h1>Welcome to Questy!</h1>
                <p>Once you&apos;ve connected to other writers, you&apos;ll see your friends lists here!</p>
                <p>Looking to connect with other writers? Invite your friends, or check out <a href="/profiles/public" title="Public Questy Profiles">public users</a>.</p>
              </>
              }
            </div>
          </ContentBlock>
        </ContentContainer>
      </Page>
    )
  }
}