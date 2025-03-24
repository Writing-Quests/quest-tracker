import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api'
import usePrev from '../services/usePrev'
import ProgressChart from './ProgressChart'
import { fireworks, Confetti } from '../services/confetti'
import Modal from 'react-modal'
import Certificate from './Certificate'
import UpdateProjectProgress from './UpdateProjectProgress'
import { ErrorContainer } from './Containers'
import Loading from './Loading'

function getUnitText(unit, val) {
  switch(unit) {
    case 'words':
      if(val == 1) { return 'word' }
      return 'words'
    case 'hours':
      if(val == 1) { return 'hour' }
      return 'hours'
    default:
      return unit
  }
}

function getPastParticiple(type) {
  switch(type) {
    case 'writing':
      return 'written'
    case 'editing':
      return 'edited'
    case 'drawing':
      return 'drawn'
    default:
      return `(${type})`
  }
}

function ProgressNumericDisplay({progress}) {
  const values = []
  for(const type in progress) {
    for(const unit in progress[type]) {
      const val = parseFloat(progress[type][unit])
      values.push({val: val, unit: getUnitText(unit, val), type: getPastParticiple(type)})
    }
  }

  if(progress.length === 0) {
    return <div>Time to get started: add your first progress entry!</div>
  }

  return <ul>
    {values.map((val, i) =>
      <li key={i}><strong>{val.val}</strong> {val.unit} {val.type}</li>
    )}
  </ul>
}
ProgressNumericDisplay.propTypes = {
  progress: PropTypes.object.isRequired,
}

function EditProgressInner({project, goals, allowEditing, refetch}) {
  const goal = goals[0]
  //const [fireworksRunning, setFireworksRunning] = useState(false)
  //const [modalIsOpen, setModalIsOpen] = useState(false)
  //const prevProgressPercent = usePrev(goal.goal_progress_percent)
  //useEffect(() => {
    //if(prevProgressPercent?.length && prevProgressPercent < 100 && goal.goal_progress_percent >= 100) {
      //triggerCelebration()
    //}
  //}, [goal.goal_progress_percent, prevProgressPercent])

  //function handleFireworks() {
    //if(fireworksRunning) { return }
    //setFireworksRunning(true)
    //fireworks(() => setFireworksRunning(false))
  //}

  //function triggerCelebration() {
    //handleFireworks()
    //setModalIsOpen(true)
  //}

  return <div>
    <ProgressNumericDisplay progress={project.progress} />
    {allowEditing && <UpdateProjectProgress project={project} refetch={refetch} />}
    {Object.keys(project.progress).length && <ProgressChart project={project} />}
  </div>
}
EditProgressInner.propTypes = {
  goals: PropTypes.array.isRequired,
  refetchGoal: PropTypes.func.isRequired,
  allowEditing: PropTypes.bool,
  project: PropTypes.object.isRequired,
  refetch: PropTypes.func,
}

export default function Progress({project, allowEditing, refetch}) {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const fetchGoals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.get(`/projects/${project.code}/goals`)
      setData(resp.data?.['hydra:member'] || [])
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [project.code])
  useEffect(() => {
    fetchGoals()
  }, [project, fetchGoals])
  return <>
    {loading && <Loading />}
    {(error && !data) && <ErrorContainer>ERROR: {JSON.stringify(error)}</ErrorContainer>}
    {(data?.[0].start_date && data?.[0].end_date) &&
      <EditProgressInner project={project} goals={data} refetchGoal={fetchGoals} allowEditing={allowEditing} refetch={refetch} />
    }
  </>
}
Progress.propTypes = {
  project: PropTypes.object.isRequired,
  allowEditing: PropTypes.bool,
  refetch: PropTypes.func,
}
