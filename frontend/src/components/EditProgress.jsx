import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api'
import Input, { Button } from './Forms/Input'
import { ErrorContainer, SuccessContainer } from './Containers'
import ProgressChart from './ProgressChart'

function EditProgressInner({goal, refetchGoal}) {
  const [action, setAction] = useState('add')
  const [date, setDate] = useState(goal.start_date)
  const [value, setValue] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [success, setSuccess] = useState()

  async function handleSave() {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      await api.patch(`goals/${goal.id}/progress`, [ { date, action, value } ], {
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

  const inputProps = { disabled: loading }
  return <div>
    {error && <ErrorContainer>{JSON.stringify(error)}</ErrorContainer>}
    {success && <SuccessContainer>Saved!</SuccessContainer>}
    <select value={action} onChange={e => setAction(e.target.value)} {...inputProps}>
      <option value='add'>Add</option>
      <option value='replace'>Replace</option>
    </select>
    <Input type='date' label='Date' value={date} onChange={e => setDate(e.target.value)} {...inputProps} />
    <Input type='number' label={goal.units} value={value} onChange={e => setValue(e.target.value)} min='0' {...inputProps} />
    <Button onClick={handleSave} {...inputProps}>Save</Button>
    {(parseFloat(goal.current_value) > 0) && <ProgressChart goal={goal} />}
  </div>
}
EditProgressInner.propTypes = {
  goal: PropTypes.object.isRequired,
  refetchGoal: PropTypes.func.isRequired,
}

export default function EditProgress({project}) {
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
      <EditProgressInner goal={data[0]} refetchGoal={fetchGoals} />
    }
  </>
}
EditProgress.propTypes = {
  project: PropTypes.object.isRequired,
}
