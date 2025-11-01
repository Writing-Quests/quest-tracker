import { useContext, useState, useEffect } from 'react'
import Page from './Page'
import { ContentContainer, ContentBlock } from './Containers'
import { NQ_2025, ProgressBar, formatNumber } from './NovelQuest'
import { Button } from './Forms/Input'
import context from '../services/context'
import api from '../services/api'
import { ErrorContainer } from './Containers'
import { ProgressChartSingle } from './ProgressChart'

const { LoggedInUserContext } = context

const DATE_LENGTH = '2025-01-01'.length

function JoinLeaveQuest() {
  const { user, setUser } = useContext(LoggedInUserContext)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
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
    setError(null)
    const questsSet = new Set(user.quests || [])
    questsSet.add('/api/quests/'+NQ_2025)
    await setQuests(Array.from(questsSet))
  }
  async function leaveQuest() {
    setError(null)
    const questsSet = new Set(user.quests || [])
    questsSet.delete('/api/quests/'+NQ_2025)
    await setQuests(Array.from(questsSet))
  }
  if(!joined) {
    return <div>
      <Button disabled={loading} type='cta' onClick={joinQuest}>Join Novel Quest</Button>
      {error && <ErrorContainer>Error joining</ErrorContainer>}
    </div>
  }
  else {
    return <div>
      <Button disabled={loading} type='link' onClick={leaveQuest} style={{display: 'inline', color: 'black', width: 'auto'}}>&times; Leave Novel Quest</Button>
      {error && <ErrorContainer>Error leaving</ErrorContainer>}
    </div>
  }
}

export function QuestProgress({questId}) {
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
  </div>
}

function Stats() {
  const { user } = useContext(LoggedInUserContext)
  const [data, setData] = useState()
  useEffect(() => {
    api.get(`/users/${user.username}/quests/${NQ_2025}`)
      .then(res => setData(res.data))
  }, [user])
  const formattedProgress = {}
  data?.progress_entries?.['hydra:member']?.forEach(el => {
    const date = el.entry_date.substring(0, DATE_LENGTH)
    if(!formattedProgress[date]) { formattedProgress[date] = 0 }
    formattedProgress[date] += parseFloat(el.value)
  })
  return <>
    {/* TODO: Winners block */}
    <ContentBlock>
      <h2>Your Stats</h2>
      <QuestProgress questId={NQ_2025} />
      <ProgressChartSingle progress={formattedProgress} type='writing' unit='words' settings={{startDate: '2025-09-01', endDate: '2025-09-30', goal: 50000}} />
      {/* TODO: List of projects that are included with links to them to update progress */}
      {/* TODO: By the numbers (avg # words per day, # words to meet par today, streak) */}
      {/* TODO: Badges */}
    </ContentBlock>
    <ContentBlock>
      {/*<h2>All Stats</h2>*/}
      {/* TODO: Note about privacy of your stats */}
      {/* TODO: Overall ranking w/ bar charts for each person */}
      {/* TODO: Aggregate line graph */}
      {/* TODO: button to hide the "weird stats" / easter eggs */}
      {/* TODO: By the numbers: # particiapnts, mean, stdev, min, max, median, % winners */}
    </ContentBlock>
  </>
}

export default function NovelQuestPage() {
  const { user } = useContext(LoggedInUserContext)
  const joined = user.quests?.includes('/api/quests/'+NQ_2025)
  return <Page>
    <ContentContainer>
      <ContentBlock>
        <h1>Novel Quest 2025</h1>
        <p><strong>Rules:</strong> To complete Novel Quest, write 50,000 words from November 1 - 30. Includes progress from <em>all</em> your projects.<br /><small><em>(Custom quest goals coming soon!)</em></small></p>
        <JoinLeaveQuest />
      </ContentBlock>
      {joined && <Stats />}
    </ContentContainer>
  </Page>
}
