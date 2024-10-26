import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import api from '../services/api'
import Input from './Forms/Input'
import { ErrorContainer, SuccessContainer } from './Containers'
import ProgressChart from './ProgressChart'
import { fireworks } from '../services/confetti'

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

  const inputProps = { isLoading: loading }

  async function handleSave(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      let d
      switch(dateSelect) {
        case 'today':
          d = dayjs().format('YYYY-MM-DD')
          break
        case 'yesterday':
          d = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
          break
        case 'other':
        default:
          d = date
      }
      await api.patch(`goals/${goal.id}/progress`, [ { date: d, action, value } ], {
        headers: {
          'Content-Type': 'application/json',
        }
      })
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
      <Input type='number' label={capitalizeFirstLetter(goal.units)} value={value} onChange={e => setValue(e.target.value)} min='0' step={goal.units === 'hours' ? 0.1 : 1} {...inputProps} />
      <Input type='button-select' label='Mode' value={action} onChange={setAction} {...inputProps} options={[
        { label: 'Add', value: 'add' },
        { label: 'Replace', value: 'replace'},
        { label: 'Set total', value: 'setTotal'},
      ]} />
      <Input type='button-select' label='As of' value={dateSelect} onChange={setDateSelect} {...inputProps} options={[
        { label: 'Today', value: 'today', disabled: !todayEnabled },
        { label: 'Yesterday', value: 'yesterday', disabled: !yesterdayEnabled},
        { label: 'Another date', value: 'other'},
      ]} />
      {dateSelect === 'other' && <Input type='date' label='Date' value={date} onChange={e => setDate(e.target.value)} {...inputProps} min={dayjs(goal.start_date).format('YYYY-MM-DD')} max={dayjs(goal.end_date).format('YYYY-MM-DD')} />}
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
