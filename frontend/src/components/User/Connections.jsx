import { useContext,useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { WarningContainer, ContentContainer, ContentBlock, SuccessContainer,ErrorContainer, NeutralContainer } from '../Containers'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import Notices from '../Notices'
import Loading from '../Loading'
import api from '../../services/api'
import Input, { SectionOptions, OptionButton, Button } from '../Forms/Input'
import InputGroup from '../Forms/InputGroup'

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

function UserActions ({type, connection,manageConnection}) {
  switch (type) {
    case 'blocked':
      return <Button onClick={() => {manageConnection('delete',connection,type)}}>Unblock</Button>;

    case 'waiting':
      return <><Button onClick={(e) => {e.preventDefault(); console.log('ignore friend request') }}>Ignore Request</Button><Button onClick={(e) => {e.preventDefault(); console.log('accept friend request') }}>Accept Request</Button></>;

    case 'following':
      return <Button onClick={(e) => {e.preventDefault(); console.log('unfollow this user') }}>Unfollow</Button>;

    case 'pending':
      return <Button onClick={(e) => {e.preventDefault(); console.log('cancel friend request') }}>Cancel Request</Button>;

    case 'mutual':
      return <Button onClick={(e) => {e.preventDefault(); console.log('remove buddy') }}>Remove</Button>;
  }
}

function ListConnections ({connections,type,title,manageConnection, ifnone=null}) {
  let username_field = 'connected_username';
  if (type == 'waiting') {
    username_field = 'initiating_username';
  }
  const users = connections[type].map(u => <li key={u.id}><ProfileLink href={"/profile/"+ u[username_field]}>{u[username_field]}</ProfileLink><UserActions type={type} connection={u} manageConnection={manageConnection} /></li>)
  if (users.length > 0) {
    return (<>
        <h2>{title}</h2>
        <ConnectionUserList>
          {users}
        </ConnectionUserList>
    </>)
  } else if (ifnone) {
    return (
      <i>{ifnone}</i>
    )
  }
}

export default function Connections () {
  async function getUserConnections () {
    try {
      const resp = await api.get('connection/all')
      console.log(resp.data)
      setConnections(resp.data)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  async function manageConnection ({connections,setSubmitWait,setWaitingText}) {
    setSubmitWait(true)
    setWaitingText('Doing the thing');
    //console.log(connections[currentList])
    //console.log(connection);
    //console.log(connections[currentList].indexOf(connection))
    setTimeout(() => { setSubmitWait(false); setWaitingText('')},4000)
    {/*
    // TODO: we need to reset the page after changes on the interaction take place
    let resp = null;
    console.log('plz wait, how to present?????')
    if (status == 'delete') {
      resp = await api.delete(`/connection/${connectionId}`)
  
    } else {
      resp = await api.patch(`/connection/${connectionId}`,{
        'status': status
      })
    }
    if (resp) {
      console.log('done!')
      console.log(resp);
    }
      */}
  }
  const user = useContext(LoggedInUserContext)
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const [connections,setConnections] = useState(null)
  const [section, setSection] = useState('pending')
  const [submitWait,setSubmitWait] = useState(false)
  const [waitingText,setWaitingText] = useState('')
  useEffect(() => {
    try {
      getUserConnections(user.username)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  },[user])
  if(loading || connections == null) {
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
    return <Page>
      <ContentContainer>
        <ContentBlock>
          {submitWait && 
            <Loading inline={true} text={waitingText} />
          }
        <SectionOptions>
            <OptionButton selected={section === 'pending'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Pending</OptionButton>
            <OptionButton selected={section === 'buddies'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Buddies</OptionButton>
            <OptionButton selected={section === 'following'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Following</OptionButton>
            <OptionButton selected={section === 'blocked'} onClick={(e) => {setSection(e.target.textContent.toLowerCase())}}>Blocked</OptionButton>
          </SectionOptions>

            <ToggledSection selected={(section === 'pending')}>
              <ListConnections connections={connections} type="waiting" title="Your Incoming Requests" ifnone="You don't have any connections waiting for approval." manageConnection={manageConnection} />
              <ListConnections connections={connections} type="pending" title="Your Outgoing Requests" manageConnection={manageConnection} />
            </ToggledSection>

            <ToggledSection selected={(section === 'buddies')}>
              <ListConnections connections={connections} type="mutual" title="Your Mutual Buddies" ifnone="No mutual buddies (yet)." manageConnection={manageConnection} />
            </ToggledSection>

            <ToggledSection selected={(section === 'following')}>
              <ListConnections connections={connections} type="following" title="Users You Follow" ifnone="You&apos;re not following any users (yet)." manageConnection={manageConnection()} />
            </ToggledSection>

            <ToggledSection selected={(section === 'blocked')}>
              <ListConnections connections={connections} type="blocked" title="Blocked Users" ifnone="You haven&apos;t blocked any users." manageConnection={manageConnection} />
            </ToggledSection>
        </ContentBlock>
      </ContentContainer>
    </Page>
  }
}