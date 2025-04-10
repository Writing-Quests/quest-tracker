/* eslint-disable react/prop-types */
import { useContext,useState,useEffect } from 'react'
//import { useSearchParams } from 'react-router-dom'
import { ContentContainer, ContentBlock, ErrorContainer, SuccessContainer, NeutralContainer } from '../Containers'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import Notices from '../Notices'
import Loading from '../Loading'
import api from '../../services/api'
import { SectionOptions, OptionButton, Button } from '../Forms/Input'

const { LoggedInUserContext } = context

const ConnectionUserList = styled.ul`
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
  list-style-type: none;
  li {
    display: flex;
    gap: 3px;
    justify-content: space-between;
    margin: 10px 0;
    border-bottom: 1px solid #EBEBEB;
    padding: 5px;
    align-items: center;
    a {
      flex-grow: 2;
    }
  }
`

const ToggledSection = styled.div`
  width: 100%;
  margin: 10px 0;
  display: ${(props) => (props.selected === true && 'block') || 'none'};
  margin-bottom: 1rem;
`

const ProfileLink = styled.a`
  font-size: 1.1rem;
  text-decoration: underline;
  color: #638FF0;
  font-weight: bold;
`

{/*
// TODO: right now (2025-03-26) this isn't active. The links have been commented out of the user email, route is commented out of App.jsx
export function ConnectionLink () {
  // accept/decline via email
  const [queryParameters] = useSearchParams()
  const connectionId = queryParameters.get('conn')
  const connectionStatus = queryParameters.get('status')
  const user = useContext(LoggedInUserContext)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
}
*/}

export function Connections () {
  const user = useContext(LoggedInUserContext)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [tempContainerContent, setTempContainerContent] = useState('')
  const [tempContainerType, setTempContainerType] = useState(null)
  const [connections,setConnections] = useState([])
  const [section, setSection] = useState('buddies')
  const [submitWait,setSubmitWait] = useState(false)
  const [waitingText,setWaitingText] = useState('')
  async function getUserConnections () {
    try {
      const resp = await api.get('connection/all')
      setConnections(resp.data)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    try {
      getUserConnections(user.username)
    } catch (err) {
      console.error(err)
      setError(err)
    }
  },[user])

  function makeConnectionMap (array) {
    return array.map(u => <li key={u.id}><ProfileLink href={"/profile/"+ ((u.initiating_user_id === user.id) ? u.connected_username : u.initiating_username)}>{((u.initiating_user_id === user.id) ? u.connected_username : u.initiating_username)}</ProfileLink><UserActions connection={u} /></li>)
  }

  function TemporaryNoticeContainer () {
    setTimeout(()=>{
      setTempContainerType(null)
    },5000) // 5 seconds
    switch (tempContainerType) {
      case 'success':
        return <SuccessContainer>{tempContainerContent}</SuccessContainer>
      
      case 'error':
        return <ErrorContainer>{tempContainerContent}</ErrorContainer>

      default:
        return <NeutralContainer>{tempContainerContent}</NeutralContainer>
    }
  }
  function UserActions ({connection}) {
    switch (connection.status) {
      case 'blocked':
        return <Button onClick={() => { manageConnection(connection, 'delete') }}>Unblock</Button>;
  
      case 'waiting':
        return <><Button onClick={() => { manageConnection(connection, 'ignored') }}>Ignore Request</Button><Button onClick={() => { manageConnection(connection, 'mutual') }}>Accept Request</Button></>;

      case 'ignored':
        return <Button onClick={() => { manageConnection(connection, 'mutual') }}>Accept Request</Button>;
      
      case 'following':
        return <Button onClick={() => { manageConnection(connection, 'delete') }}>Unfollow</Button>;
  
      case 'pending':
        return <Button onClick={() => { manageConnection(connection, 'delete') }}>Cancel Request</Button>;
  
      case 'mutual':
        return <Button onClick={() => { manageConnection(connection, 'delete') }}>Remove</Button>;
    }
  }

  function ListConnections ({title,ifnone=null,userlist}) {
    if (userlist.length > 0) {
      return (<>
          <h2>{title}</h2>
          <ConnectionUserList>
            {userlist}
          </ConnectionUserList>
      </>)
    } else if (ifnone) {
      return (
        <i>{ifnone}</i>
      )
    }
  }

  function removeConnectionEntry (status,id) {
    let entries = connections[status].filter(conn => { return conn.id !== id });
    connections[status] = entries;
    let keys = Object.keys(connections);
    let updatedConnections = {}
    keys.forEach((k) => {
      updatedConnections[k] = connections[k]
    })
    setConnections(updatedConnections);
  }

  async function manageConnection (connection,userAction) {
    setSubmitWait(true)
    setTempContainerContent(false)
    setTempContainerType(null)
    setWaitingText('Updating Connections')
    let otherUser = (connection.initiating_user_id === user.id) ? connection.connected_username : connection.initiating_username;
    let tempContainer = 'success';
    try {
      if (userAction == 'delete') {
        removeConnectionEntry(connection.status,connection.id);
        await api.delete(`/connection/${connection.id}`)
      } else {
        await api.patch(`/connection/${connection.id}`,{
          'status': userAction
        });
        const oldStatus = connection.status
        connection.status = userAction
        // moves the connection from the array it was in, to the new one it occupies
        removeConnectionEntry(oldStatus,connection.id)
        connections[userAction].push(connection)
        setConnections(connections)
      }
      setTempContainerContent(`Successfully updated your connection with ${otherUser}.`)
    } catch (err) {
      console.error(err)
      tempContainer = 'error'
      setTempContainerContent(`An error occurred while modifying your connection with ${otherUser}`)
    } finally {
      setSubmitWait(false)
      setWaitingText('')
      setTempContainerType(tempContainer)
    }
  }

  if(loading) {
    return <Page>
      <Notices />
      <Loading />
    </Page>
  } else if (error !== null) {
    let msg = 'An unknown error occured.'
    if (error.status === 404) { 
      msg = `Unable to find any connection information for ${user.username}.`
    }
    return <Page>
      <ErrorContainer><strong>Error:</strong> {msg}</ErrorContainer>
    </Page>
  } else {
    let waitingRequests = makeConnectionMap(connections.waiting)
    let pendingRequests = makeConnectionMap(connections.pending)
    let ignoredRequests = makeConnectionMap(connections.ignored)
    let following = makeConnectionMap(connections.following)
    let mutuals = makeConnectionMap(connections.mutual)
    let blocked = makeConnectionMap(connections.blocked)
    return <Page>
      <ContentContainer>
        <ContentBlock>
          {submitWait && 
            <Loading inline={true} text={waitingText} />
          }
          {(tempContainerType) && 
            <TemporaryNoticeContainer />
          }
        <SectionOptions>
            <OptionButton selected={section === 'buddies'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Buddies</OptionButton>
            <OptionButton selected={section === 'following'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Following</OptionButton>
            <OptionButton selected={section === 'pending'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Pending</OptionButton>
            <OptionButton selected={section === 'blocked'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Blocked</OptionButton>
          </SectionOptions>

            <ToggledSection selected={(section === 'buddies')}>
              <ListConnections title="Your Mutual Buddies" ifnone="No mutual buddies (yet)." userlist={mutuals} />
            </ToggledSection>

            <ToggledSection selected={(section === 'following')}>
              <ListConnections title="Users You Follow" ifnone="You&apos;re not following any users (yet)." manageConnection={manageConnection} userlist={following} />
            </ToggledSection>

            <ToggledSection selected={(section === 'pending')}>
              <ListConnections title="Your Incoming Requests" userlist={waitingRequests} />
              <ListConnections title="Your Outgoing Requests" userlist={pendingRequests} />
              <ListConnections title="Your Ignored Requests" userlist={ignoredRequests} />
            </ToggledSection>

            <ToggledSection selected={(section === 'blocked')}>
              <ListConnections title="Blocked Users" ifnone="You haven&apos;t blocked any users." userlist={blocked} />
            </ToggledSection>
        </ContentBlock>
      </ContentContainer>
    </Page>
  }
}