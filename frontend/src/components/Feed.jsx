/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import context from '../services/context'
import Page from './Page'
import api from '../services/api'
import Loading from './Loading'
import { ContentContainer, ContentBlock } from './Containers'

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
    color: #ffae9c;
  }
`

function DisplayUserInfo ({buddyInfo,user}) {
  const buddyUsername = (buddyInfo.initiating_user_id === user.id) ? buddyInfo.connected_username : buddyInfo.initiating_username;
  return (
    <>
    <strong><a href={`/profile/${buddyUsername}`} title={`${buddyUsername}'s profile`}>{buddyUsername}</a></strong>
    </>
  )
}

function UserMiniDisplay ({user}) {
  let describeConnection = null;
  switch (user.connection) {
    case 'following':
      describeConnection = `You follow ${user.username}.`;
    break;

    case 'mutual':
      describeConnection = `You & ${user.username} are buddies.`
    break;
  }
  return (
    <IndividualProfile onClick={()=> { window.location.href = `/profile/${user.username}`}}>
      {user.gravatar && <UserAvatar src={user.gravatar} />}
      <p className="username"><a href={`/profile/${user.username}`} title={`${user.username}'s profile`}>{user.username}</a></p>
      {user.description && <p className="description">{user.description}</p>}
      {describeConnection && <p className="connection">{describeConnection}</p>}
    </IndividualProfile>
  )
}

export function PublicFeed () {
  const user = useContext(LoggedInUserContext)
  const [publicUsers,setPublicUsers] = useState([]);
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function getConnections () {
      const resp = await api.get("user/$public");
      setPublicUsers(resp.data.users);
      setLoading(false)
    }
    getConnections()
  },[user])
  if (loading) {
    return <Page>
      <Loading />
    </Page>
  } else {
    const users = publicUsers.map((u) => { return <UserMiniDisplay key={u.username} user={u} />})
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
           <ProfileDataContainer>
            {users}
            </ProfileDataContainer>
          </ContentBlock>
        </ContentContainer>
      </Page>
    )
  }
}


export function HomeFeed() {
  const user = useContext(LoggedInUserContext)
  const [following,setFollowing] = useState([])
  const [buddies,setBuddies] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function getConnections () {
      const resp = await api.get("connection/feed");
      setFollowing(resp.data.following)
      setBuddies(resp.data.mutuals)
      setLoading(false)
    }
    getConnections()
  },[user])
  const buddy_blocks = buddies.map((buddy) => <div key={buddy.id} style={{padding: '5px'}}><DisplayUserInfo buddyInfo={buddy} user={user} /></div>)
  const follow_blocks = following.map((follow) => <div key={follow.id} style={{padding: '5px'}}><DisplayUserInfo buddyInfo={follow} user={user} /></div>)
  if (loading) {
    return <Page>
      <Loading />
    </Page>
  } else {
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
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
          </ContentBlock>
        </ContentContainer>
      </Page>
    )
  }
}