import { useState, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import api from '../services/api'
import usePrev from '../services/usePrev'
import Input from './Forms/Input'
import { ErrorContainer, SuccessContainer } from './Containers'
import ProgressChart from './ProgressChart'
import { fireworks, Confetti } from '../services/confetti'

function capitalizeFirstLetter(str='') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function UpdateProgress({goal, refetchGoal}) {
  const yesterdayStr = dayjs().subtract(1, 'd').format('YYYYMMDD')
  const todayStr = dayjs().format('YYYYMMDD')
  const startStr = dayjs(goal.start_date).format('YYYYMMDD')
  const endStr = dayjs(goal.end_date).format('YYYYMMDD')
  const todayEnabled = todayStr >= startStr && todayStr <= endStr
  const yesterdayEnabled = yesterdayStr >= startStr && yesterdayStr <= endStr
  let defaultDateSelect = 'today'
  if(!todayEnabled) {
    defaultDateSelect = 'yesterday'
    if(!yesterdayEnabled) {
      defaultDateSelect = 'other'
    }
  }
  const [action, setAction] = useState('add')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [dateSelect, setDateSelect] = useState(defaultDateSelect)
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [success, setSuccess] = useState()
  const prevSuccess = usePrev(success)
  const cumulativeProgress = useMemo(() => {
    const ret = []
    goal.progress.forEach((p, i) => {
      if(i === 0) {
        ret[i] = Number(p)
      } else {
        ret[i] = ret[i-1] + Number(p)
      }
    })
    return ret
  }, [goal.progress])
  useEffect(() => {
    if(dateSelect === 'today') {
      setDate(dayjs().format('YYYY-MM-DD'))
    } else if (dateSelect === 'yesterday') {
      setDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'))
    }
  }, [dateSelect])

  const newSuccess = !prevSuccess && success

  const inputProps = { isLoading: loading }

  const progressIndex = dayjs(date).diff(goal.start_date, 'd')
  let lastEntryIndex = 0
  // eslint-disable-next-line for-direction
  for(let i = goal.progress.length - 1; i >= 0; i--) {
    if(Number(goal.progress[i]) > 0) {
      lastEntryIndex = i
      break
    }
  }
  const minOnDate = progressIndex ? cumulativeProgress[progressIndex-1] : 0
  // TODO: We can implement a smart "set cumulative hours" mode later on that will have to rewrite later entries. Not worth it right now.
  //let maxOnDate = null
  //for(let i = progressIndex; i < cumulativeProgress.length; i++) {
    //if(cumulativeProgress[i] !== cumulativeProgress[progressIndex]) {
      //maxOnDate = cumulativeProgress[i]
      //break
    //}
  //}

  async function handleSave(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      if(action === 'setTotal') {
        if(lastEntryIndex > progressIndex) {
          if(!window.confirm(`WARNING: This will also change your progress after ${dayjs(date).format('MMM D, YYYY')}. Are you sure?`)) {
            return
          }
        }
        const newVal = progressIndex ? (value - cumulativeProgress[progressIndex - 1]) : value
        await api.patch(`goals/${goal.id}/progress`, [ { date, action: 'replace', value: newVal } ], {
          headers: { 'Content-Type': 'application/json', }
        })
      } else {
        await api.patch(`goals/${goal.id}/progress`, [ { date, action, value } ], {
          headers: { 'Content-Type': 'application/json', }
        })
      }
      refetchGoal()
      setSuccess(true)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <form onSubmit={handleSave}>
      <h3>Update Progress</h3>
      {error && <ErrorContainer error={error} />}
      {success && <SuccessContainer>Saved!</SuccessContainer>}
      <Input type='number' label={capitalizeFirstLetter(goal.units)} value={value}
        onChange={e => setValue(e.target.value)}
        min={(action === 'setTotal') ? (minOnDate || 0) : 0}
        //max={(action === 'setTotal') && maxOnDate}
        step={goal.units === 'hours' ? 0.1 : 1}
      {...inputProps} />
      <Input type='button-select' label='Mode' value={action} onChange={setAction} {...inputProps} options={[
        { label: `Add ${goal.units}`, value: 'add' },
        { label: `Set total ${goal.units} for day`, value: 'replace'},
        { label: `Set cumulative ${goal.units}`, value: 'setTotal'},
      ]} />
      <Input type='button-select' label='As of' value={dateSelect} onChange={setDateSelect} {...inputProps} options={[
        { label: 'Today', value: 'today', disabled: !todayEnabled },
        { label: 'Yesterday', value: 'yesterday', disabled: !yesterdayEnabled},
        { label: 'Another date', value: 'other'},
      ]} />
      {dateSelect === 'other' && <Input type='date' label='Date' value={date} onChange={e => setDate(e.target.value)} {...inputProps} min={dayjs(goal.start_date).format('YYYY-MM-DD')} max={dayjs(goal.end_date).format('YYYY-MM-DD')} />}
      {newSuccess && <Confetti />}
      <Input type='submit' {...inputProps} value='Save' />
    </form>
  </>
}
UpdateProgress.propTypes = {
  refetchGoal: PropTypes.func.isRequired,
  goal: PropTypes.object.isRequired,
}

function EditProgressInner({goal, refetchGoal, allowEditing}) {
  const [fireworksRunning, setFireworksRunning] = useState(false)

  function handleFireworks() {
    if(fireworksRunning) { return }
    setFireworksRunning(true)
    fireworks(() => setFireworksRunning(false))
  }

  return <div>
    <p style={{fontSize: '1.2em'}}><strong>{Number(goal.current_value).toLocaleString() || 0}</strong> out of {Number(goal.goal).toLocaleString()} {goal.units}</p>
    <p>{Number(goal.goal_progress_percent).toLocaleString()}% done {goal.goal_progress_percent >= 100 && <strong onClick={handleFireworks}><em>Completed! 🎉</em></strong>}</p>
    {allowEditing && <UpdateProgress refetchGoal={refetchGoal} goal={goal} />}
    {(parseFloat(goal.current_value) > 0) && <ProgressChart goal={goal} />}
  </div>
}
EditProgressInner.propTypes = {
  goal: PropTypes.object.isRequired,
  refetchGoal: PropTypes.func.isRequired,
  allowEditing: PropTypes.bool,
}

export default function Progress({project, allowEditing}) {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.get(`/projects/${project.id}/goals`)
      setData(resp.data?.['hydra:member'] || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [project.id])
  useEffect(() => {
    fetchGoals()
  }, [project, fetchGoals])
  return <>
    {loading && <div>Loading&hellip;</div>}
    {(error && !data) && <div>ERROR: {JSON.stringify(error)}</div>}
    {(data?.[0].start_date && data?.[0].end_date) &&
      <EditProgressInner goal={data[0]} refetchGoal={fetchGoals} allowEditing={allowEditing} />
    }
  </>
}
Progress.propTypes = {
  project: PropTypes.object.isRequired,
  allowEditing: PropTypes.bool,
}
