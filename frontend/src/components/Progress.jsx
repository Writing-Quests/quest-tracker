import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import api from '../services/api'
import usePrev from '../services/usePrev'
import ProgressChart from './ProgressChart'
import { fireworks, Confetti } from '../services/confetti'
import Modal from 'react-modal'
import Certificate from './Certificate'
import UpdateProjectProgress from './UpdateProjectProgress'

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
    default:
      return type
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

function EditProgressInner({project, goals, allowEditing}) {
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
    {allowEditing && <UpdateProjectProgress project={project} />}
    {/*
    <p style={{fontSize: '1.2em'}}>
      <strong>{Number(goal.current_value).toLocaleString() || 0}</strong> out of {Number(goal.goal).toLocaleString()} {goal.units}
      &nbsp;<small>({Number(goal.goal_progress_percent).toLocaleString()}% done{goal.goal_progress_percent >= 100 && <strong onClick={handleFireworks}><em>&nbsp;Completed! 🎉</em></strong>})</small>
      {goal.goal_progress_percent >= 100 && <Button onClick={triggerCelebration}>Download your certificate</Button>}
    </p>
    {goal.goal_progress_percent >= 100 && <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      contentLabel="Example Modal"
      style={{content: {
        width: '700px',
        maxWidth: '90vw',
        height: '500px',
        left: '50%',
        top: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
      }, overlay: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(2px)',
      }}}
    >
      <button onClick={() => setModalIsOpen(false)} style={{
        backgroundColor: '#eee',
        border: 'none',
        borderRadius: '3px',
        fontWeight: 'bold',
        position: 'absolute',
        padding: '10px',
        cursor: 'pointer',
      }}>x</button>
      <div style={{fontSize: '2rem', fontWeight: 'bold', textAlign: 'center'}}>🥳 Congratulations! 🥳</div>
      <Certificate project={project} />
    </Modal>}
    */}
    {(parseFloat(goal.current_value) > 0) && false && <ProgressChart goal={goal} />}
  </div>
}
EditProgressInner.propTypes = {
  goals: PropTypes.array.isRequired,
  refetchGoal: PropTypes.func.isRequired,
  allowEditing: PropTypes.bool,
  project: PropTypes.object.isRequired,
}

export default function Progress({project, allowEditing}) {
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
    {loading && <div>Loading&hellip;</div>}
    {(error && !data) && <div>ERROR: {JSON.stringify(error)}</div>}
    {(data?.[0].start_date && data?.[0].end_date) &&
      <EditProgressInner project={project} goals={data} refetchGoal={fetchGoals} allowEditing={allowEditing} />
    }
  </>
}
Progress.propTypes = {
  project: PropTypes.object.isRequired,
  allowEditing: PropTypes.bool,
}
