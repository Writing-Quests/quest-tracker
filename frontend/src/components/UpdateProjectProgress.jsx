import { useState, createContext, useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Input, { Button, SectionOptions } from './Forms/Input'

const ProgressContext = createContext()

const ProgressForm = styled.form`
  background: #333;
  border-radius: 9px;
  padding: 5px 10px;
  margin-bottom: 10px;
  border-bottom: 5px solid black;
  & label {
    display: grid;
    grid-template-columns: 50px auto;
    border-radius: 0;
    border: none;
    background: transparent;
    color: white;
    align-items: center;
    font-weight: normal;
    margin: 5px 0;
    &:focus-within {
      outline: none;
      color: inherit;
    }
  }
  & span {
    top: 0 !important;
  }
  & select {
    background-color: white;
    color: $333;
    border-radius: 3px;
    padding: 5px;
  }
  & ${SectionOptions} button {
    background-color: #d8d8d8;
    color: #333;
    border-radius: 0;
    &[data-selected=true] {
      background-color: #757575;
      color: white;
      border-radius: inherit;
    }
  }
  & input:not([type='submit']) {
    background-color: #464646;
    color: white;
    font-family: "Playfair Display", serif;
    font-size: 2rem;
    font-weight: bold;
    padding: 10px 10px 15px 10px;
    border-radius: 10px;
  }
`

const ButtonGroup = styled.div`
  margin: 10px -10px -5px -10px;
  border-bottom-left-radius: 9px;
  border-bottom-right-radius: 9px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #999;
  border-top: 1px solid #999;
  grid-gap: 1px;
  & > button, & > input {
    margin: 0;
    border-radius: 0;
    background-color: #333;
    color: white;
    &:hover {
      background-color: #111;
    }
    &:active {
      background-color: black;
    }
  }
`

function capitalizeFirstLetter(str='') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function UpdateProjectProgress({project}) {
  const [show, setShow] = useState(false)
  if(show) {
    return <ProgressContext.Provider value={{project}}>
      <Form onFinish={() => setShow(false)} />
    </ProgressContext.Provider>
  } else {
    return <Button type='cta' onClick={() => setShow(true)}>✏️ Update progress</Button>
  }
}
UpdateProjectProgress.propTypes = {
  project: PropTypes.object.isRequired,
}

function Form({onFinish}) {
  const { project } = useContext(ProgressContext)
  const progress = project.progress
  const existingProgressTypes = []
  for(const type in progress) {
    for(const units in progress[type]) {
      existingProgressTypes.push({units, type})
    }
  }

  const inputProps = {}

  if(!existingProgressTypes.length) {
    existingProgressTypes.push({units: 'words', type: 'writing'})
  }
  const handleSave = () => alert('save')
  return <div>
    <ProgressForm onSubmit={handleSave}>
      <h3 style={{textAlign: 'center', marginTop: '8px', marginBottom: '9px', fontSize: '1.1rem'}}>Update Progress</h3>
      <Input type='select' label='Progress type'>
        {existingProgressTypes.map((val, id) => <option key={id} value={id}>
          {capitalizeFirstLetter(val.units)} ({val.type})
        </option>)}
        <option value={-1}>+ Track new type of progress</option>
      </Input>
      {/*
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
      */}
      <ButtonGroup>
        <Input type='submit' buttonType='normal' {...inputProps} value='Save' />
        <Button onClick={e => {e.preventDefault; onFinish()}} style={{color: '#f79274', fontWeight: 'normal'}}>Cancel</Button>
      </ButtonGroup>
    </ProgressForm>
    </div>
}
Form.propTypes = {
  onFinish: PropTypes.func.isRequired,
}

/*
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
  const [show, setShow] = useState(false)
  const [action, setAction] = useState('add')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [dateSelect, setDateSelect] = useState(defaultDateSelect)
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [success, setSuccess] = useState()
  useEffect(() => {
    if(show === true) {
      setSuccess(false)
    }
  }, [show])
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
        const priorVal = cumulativeProgress[progressIndex - 1] || 0
        const newVal = progressIndex ? (value - priorVal) : value
        await api.patch(`goals/${goal.code}/progress`, [ { date, action: 'replace', value: newVal } ], {
          headers: { 'Content-Type': 'application/json', }
        })
      } else {
        await api.patch(`goals/${goal.code}/progress`, [ { date, action, value } ], {
          headers: { 'Content-Type': 'application/json', }
        })
      }
      refetchGoal()
      setSuccess(true)
      setShow(false)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  return <>
    {error && <ErrorContainer error={error} />}
    {success && <SuccessContainer>Saved!</SuccessContainer>}
    {show ?
    <ProgressForm onSubmit={handleSave}>
      <h3 style={{textAlign: 'center', marginTop: '8px', marginBottom: '9px', fontSize: '1.1rem'}}>Update Progress</h3>
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
      <ButtonGroup>
        <Input type='submit' buttonType='normal' {...inputProps} value='Save' />
        <Button onClick={e => {e.preventDefault; setShow(false)}} style={{color: '#f79274', fontWeight: 'normal'}}>Cancel</Button>
      </ButtonGroup>
    </ProgressForm>
    :
    <Button type='cta' onClick={() => setShow(true)}>✏️ Update progress</Button>}
    {newSuccess && <Confetti />}
  </>
}
UpdateProgress.propTypes = {
  refetchGoal: PropTypes.func.isRequired,
  goal: PropTypes.object.isRequired,
}
*/
