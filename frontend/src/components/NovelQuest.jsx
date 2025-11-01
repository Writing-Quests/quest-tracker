import { useState, useContext, useEffect, useMemo } from 'react'
import { AnimatedContainer, ErrorContainer, ContentBlock } from './Containers'
import { Link } from 'react-router-dom'
import { Button } from './Forms/Input'
import api from '../services/api'
import context from '../services/context'
import styled, { keyframes } from 'styled-components'

const { LoggedInUserContext } = context

export const NQ_2025 = 'b00cb00c-b00c-4b00-9b00-b00cb00cb00c'

export function formatNumber(num) {
  return parseFloat(num).toLocaleString()
}

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background-color: rgba(0,0,0,0.25);
  border-radius: 25px;
  overflow: hidden;
  padding: 10px;
  box-sizing: content-box;
`

const loadProgressBar = (percent) => keyframes`
  0% {
    width: 0px;
  }
  100% {
    width: ${percent};
  }
`
const progressBarAnimation = keyframes`
  0% {
    background-position-x: 0;
  }
  100% {
    background-position-x: 40px;
  }
`

const ProgressBarProgress = styled.div`
  height: 100%;
  width: ${props => props.percent}%;
  border-radius: 25px;
  background-color: #158f12;
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231eab1a' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
  animation: ${props => loadProgressBar(props.percent)} 1s ease-in-out, ${progressBarAnimation} 4s linear infinite;
`

export function ProgressBar({percent}) {
  return <ProgressBarContainer>
    <ProgressBarProgress percent={Math.min(percent*100, 100)} />
  </ProgressBarContainer>
}

function QuestProgress({questId}) {
  const { user } = useContext(LoggedInUserContext)
  const [data, setData] = useState()
  useEffect(() => {
    api.get(`/users/${user.username}/quests/${questId}`)
      .then(res => setData(res.data))
  }, [questId, user])
  if(!data) { return null }
  return <div>
    {data.completed && <h3><em>You won</em>! 🎉</h3>}
    {data.percent === 0 ? <p>Write some words on a project to get started!</p> : <ProgressBar percent={data.percent} />}
    <p><strong>{formatNumber(data.total)}</strong> words written of {formatNumber(50000)}.</p>
    <Button as={Link} to='/novelquest'>See more stats &rarr;</Button>
  </div>
}

export default function NovelQuest() {
  const { user, setUser } = useContext(LoggedInUserContext)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshHiddenCount, setRefreshHiddenCount] = useState(0)
  const hidden = useMemo(() =>
    JSON.parse(localStorage.getItem('nq25_hidden'))
  , [refreshHiddenCount])
  const joined = user.quests.includes('/api/quests/'+NQ_2025)
  async function setQuests(newQuests) {
    setLoading(true)
    setError(null)
    try{
      const res = await api.patch(`/users/${user.username}`, {
        'quests': Array.from(newQuests)
      })
      if(!res.status === 200) { throw new Error(res.status) }
      setUser(res.data)
    } catch(e) {
      console.log(e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  async function joinQuest() {
    const questsSet = new Set(user.quests || [])
    questsSet.add('/api/quests/'+NQ_2025)
    await setQuests(Array.from(questsSet))
  }
  function handleHide() {
    localStorage.setItem('nq25_hidden', true)
    setRefreshHiddenCount(refreshHiddenCount+1)
  }
  if(!joined) {
    if(hidden) { return null }
    return <AnimatedContainer>
      <ContentBlock>
        <h2>Novel Quest</h2>
        {!joined && <>
          <p><strong>Write your novel with us!</strong> Write 50,000 words between November 1-30 to win!</p>
          <Button disabled={loading} onClick={joinQuest}>{loading ? 'Joining...' : 'Join Novel Quest!'}</Button>
          <Button type='outline' style={{width: 'auto', padding: '14px', marginLeft: '10px'}} onClick={handleHide}>&times; No thanks</Button>
          {error && <ErrorContainer>Error joining quest.</ErrorContainer>}
        </>}
      </ContentBlock>
    </AnimatedContainer>
  }
  return <AnimatedContainer>
    <ContentBlock>
      <h2>Novel Quest</h2>
      <QuestProgress questId={NQ_2025} />
    </ContentBlock>
  </AnimatedContainer>
}
