/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link, json } from 'react-router-dom'
import styled from 'styled-components'
import dayjs from 'dayjs'
import context from '../services/context'
import Page from './Page'
import api from '../services/api'
import Loading, {SectionLoading} from './Loading'
import Input, { Button } from './Forms/Input'
import { ContentContainer, ContentBlock, PaginationContainer, ProjectUpdateContainer } from './Containers'

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

function UserMiniDisplay ({user}) {
  let describeConnection = null
  switch (user.connection) {
    case 'following':
      describeConnection = `You follow ${user.username}.`
    break

    case 'mutual':
      describeConnection = `You & ${user.username} are buddyUpdates.`
    break
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
  const [currentPageUsers,setCurrentPageUsers] = useState([])
  const [totalUsers,setTotalUsers] = useState([])
  const [pages,setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [queryParameters] = useSearchParams()
  const pg = queryParameters.get('page') || 1
  async function getPageConnections (pageUrl=`profiles/public?page=${pg}`) {
    setLoading(true)
    const resp = await api.get(pageUrl)
    setCurrentPageUsers(resp.data['hydra:member'])
    setTotalUsers(resp?.data['hydra:totalItems'])
    setPages(resp.data['hydra:view'] || null) // if there are fewer than 30 results, no page information returned
    setLoading(false)
  }
  useEffect(() => {
    if (currentPageUsers.length == 0) { getPageConnections() };
  },[user])
  if (loading) {
    return <Page>
      <ContentContainer>
        <ContentBlock>
        <Loading />
        </ContentBlock>
      </ContentContainer>
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
          <PaginationContainer hydraPageInfo={pages} getNextPage={getPageConnections}>
            <p style={{'textAlign': 'center'}}>{totalUsers} public users</p>
          </PaginationContainer>
        }
      </Page>
    )
  }
}

export function BuddyFeed() {
  const user = useContext(LoggedInUserContext)
  const [queryParameters] = useSearchParams()
  const pg = queryParameters.get('page') || 1
  const [pageBuddyUpdates,setPageBuddyUpdates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [totalUpdates,setTotalUpdates] = useState([])
  const [pages,setPages] = useState([])
  async function getFeedPageContent (pageUrl=`/feed?page=1`) {
    setLoading(true)
    const resp = await api.get(pageUrl)
    setPageBuddyUpdates(resp.data['hydra:member'])
    setTotalUpdates(resp?.data['hydra:totalItems'])
    setPages(resp.data['hydra:view'] || null) // if there are fewer than 30 results, no page information returned
    setLoading(false)
  }
  useEffect(() => {
    try {
      getFeedPageContent(`/feed?page=${pg}`)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  },[user])
  if (loading || pageBuddyUpdates == null) {
    return <Page>
      <ContentContainer>
        <ContentBlock>
        <Loading />
        </ContentBlock>
      </ContentContainer>
    </Page>
  } else {
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
            {
            pageBuddyUpdates !== null ?
              (pageBuddyUpdates.length > 0) &&
                <>
                <h1>Your Writing Network</h1>
                {pageBuddyUpdates.map((update) => <div key={update.update_code}><ProjectUpdateContainer update={update} isMyProject={false} /></div>)}
                </>
              :
              <SectionLoading text="Loading your writing network..." />
            }
          </ContentBlock>
        </ContentContainer>
        {pages && 
          <PaginationContainer hydraPageInfo={pages} getNextPage={getFeedPageContent}>
            <p style={{'textAlign': 'center'}}>{totalUpdates} total updates</p>
          </PaginationContainer>
        }
      </Page>
    )
  }
}

function QuestItem({quest}) {
  const user = useContext(LoggedInUserContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  function dateInterval(date1, date2) {
    const d1 = dayjs(date1)
    const d2 = dayjs(date2)
    return d2.diff(d1, 'days') + 1 // we go through the full last day
  }
  function formatNumber(num) {
    return parseFloat(num).toLocaleString()
  }
  function dateFormat(d) {
    return dayjs(d.split('T')[0]).format('MMMM D, YYYY')
  }
  async function joinQuest() {
    setLoading(true)
    const questsSet = new Set(user.quests || [])
    questsSet.add(quest['@id'])
    try{
      const res = await api.patch(`/users/${user.username}`, {
        'quests': Array.from(questsSet)
      })
      console.log(res)
    } catch(e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  async function leaveQuest() {
    return //stub
  }
  return <li key={quest.id}>
    <strong>{quest.title}</strong> <em>{dateInterval(quest.start_date, quest.end_date)} days<br /></em>
    {dateFormat(quest.start_date)} through {dateFormat(quest.end_date)}<br />
    Goal: {quest.goal_type} {formatNumber(quest.goal_amount)} {quest.goal_units}
    <br />
    {JSON.stringify(error)}
    {user.quests.includes(quest['@id']) ?
      <span>Already part of this quest <button onClick={leaveQuest} disabled={loading}>Leave this quest</button></span>
      :
      <button onClick={joinQuest} disabled={loading}>+ Embark on this quest!</button>
    }
  </li>
}

export function QuestsFeed() {
  const [loading, setLoading] = useState(true)
  const [quests, setQuests] = useState(null)
  useEffect(() => {
    (async () => {
      const resp = await api.get('/quests')
      setQuests(resp?.data?.['hydra:member'] || [])
      setLoading(false)
    })()
  }, [])
  if (loading) {
    return <Page>
      <ContentContainer>
        <ContentBlock>
        <Loading />
        </ContentBlock>
      </ContentContainer>
    </Page>
  } else {
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
            <h1>Quests</h1>
            {!quests.length && <strong>No quests available</strong>}
            <ul>
              {quests.map(q => <QuestItem key={q.id} quest={q} />)}
            </ul>
          </ContentBlock>
        </ContentContainer>
      </Page>
    )
  }
}

export function HomeFeed() {
  const user = useContext(LoggedInUserContext)
  const navigate = useNavigate()
  const [buddyUpdates,setBuddyUpdates] = useState([])
  const [multipleFeedPages,setMultipleFeedPages] = useState(false)
  const [projects,setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    async function getConnectionUpdates () {
      const resp = await api.get("/feed?page=1")
      if (resp.data) {
        setBuddyUpdates(resp.data['hydra:member'])
        if (resp.data['hydra:view']) {
          setMultipleFeedPages(true)
        }
      }
    }
    async function getProjects () {
        const resp = await api.get(`users/${user.username}/projects`)
        setProjects(resp.data['hydra:member'])
    }
    try {
      getProjects()
      getConnectionUpdates()
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  },[user])
   if (loading) {
    return <Page>
      <ContentContainer>
        <ContentBlock>
        <Loading />
        </ContentBlock>
      </ContentContainer>
    </Page>
  } else {
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
            <div style={{'position': 'relative'}}>
              <h1>Your Projects</h1>
              <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto', 'position': 'absolute', 'top': '1rem', 'right': '1rem'}}>+ New Project</Button>
              {projects.length > 0 && projects.map((pr) => <><p onClick={() => window.location.href = `/project/view/${pr.code}`}style={{'marginBottom': 0, 'fontSize': '1.2rem', 'fontWeight': 'bold'}}>{pr.title}</p><div key={pr.code}><ProjectUpdateContainer update={pr.most_recent_update} isMyProject={true} /></div></>)}
            </div>
            {(buddyUpdates.length > 0) &&
            <div style={{'borderTop': '1px solid #ccc', 'marginTop': '1rem'}}>
                <h1>Your Writing Network</h1>
                {buddyUpdates.map((update) => <div key={update.update_code}><ProjectUpdateContainer update={update} isMyProject={false} /></div>)}
                {multipleFeedPages ?
                  <p style={{'textAlign': 'right', 'fontStyle': 'italic'}}><Link to="/buddies?page=2">See more updates &rarr;</Link></p> 
                  :
                  <p style={{'textAlign': 'right', 'fontStyle': 'italic'}}>You're all caught up!</p>
                }
            </div>
            }
          </ContentBlock>
        </ContentContainer>
      </Page>
    )
  }
}
