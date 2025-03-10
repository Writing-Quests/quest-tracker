import { useState, useEffect, createContext, useContext } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { ErrorContainer, SuccessContainer } from './Containers'
import api from '../services/api'
import Input, { Button, SectionOptions } from './Forms/Input'

dayjs.extend(utc)

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
  const [success, setSuccess] = useState()
  if(show) {
    return <ProgressContext.Provider value={{project}}>
      <Form onFinish={({success=null}={}) => {
        setSuccess(success)
        setShow(false)
      }}/>
    </ProgressContext.Provider>
  } else {
    return <>
      {success && <SuccessContainer>Saved!</SuccessContainer>}
      <Button type='cta' onClick={() => { setShow(true); setSuccess(null)}}>✏️ Update progress</Button>
    </>
  }
}
UpdateProjectProgress.propTypes = {
  project: PropTypes.object.isRequired,
}

function Form({onFinish}) {
  const { project } = useContext(ProgressContext)
  const [progressTypeId, setProgressTypeId] = useState(0)
  const [progressType, setProgressType] = useState(null)
  const [value, setValue] = useState(0)
  const [action, setAction] = useState('add')
  const [dateSelect, setDateSelect] = useState('today')
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  useEffect(() => {
    if(progressTypeId >= 0) {
      setProgressType(existingProgressTypes[progressTypeId])
    }
  }, [progressTypeId])
  const existingProgressTypes = []
  const progress = project.progress
  for(const type in progress) {
    for(const units in progress[type]) {
      existingProgressTypes.push({units, type})
    }
  }

  if(!existingProgressTypes.length) {
    existingProgressTypes.push({units: 'words', type: 'writing'})
  }
  const defaultMinProgress = progressType?.units === 'hours' ? 0.1 : 1
  const getCurProgress = () => progress?.[progressType?.type]?.[progressType?.units]
  const [minProgress, setMinProgress] = useState(defaultMinProgress)
  useEffect(() => {
    if(action === 'setTotal') {
      const curProgress = getCurProgress()
      if(curProgress) {
        setMinProgress(curProgress)
        if(Number(value) < Number(curProgress)) {
          setValue(String(Number(curProgress)))
        }
      }
    } else {
      setMinProgress(defaultMinProgress)
    }
  }, [action, progress, progressType])
  function handleCancel(e) {
    e.preventDefault()
    onFinish()
  }
  async function handleSave(e) {
    e.preventDefault()
    if(loading) { return }
    // TODO: loading, error, and success states
    setLoading(true)
    setError(null)
    try {
      const update = {
        type: progressType.type,
        units: progressType.units,
        project: '/api/project/'+project.code,
        entry_date: dayjs().format()
      }
      if(action === 'setTotal') {
        const curProgress = getCurProgress()
        update.value = String(Number(value) - (Number(curProgress || 0)))
      } else {
        update.value = String(value)
        if(dateSelect === 'yesterday') {
          update.entry_date = dayjs().subtract(1, 'day').format()
        } else if (dateSelect === 'other') {
          update.entry_date = dayjs(date).format()
        }
      }
      await api.post('progress_entries', update)
      // TODO: refetch
      onFinish({success: true})
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  const inputProps = { isLoading: loading }


  return <div>
    {error && <ErrorContainer error={error} />}
    <ProgressForm onSubmit={handleSave}>
      <h3 style={{textAlign: 'center', marginTop: '8px', marginBottom: '9px', fontSize: '1.1rem'}}>Update Progress</h3>
      <Input type='select' label='Progress type' value={progressTypeId} onChange={e => setProgressTypeId(e.target.value)} {...inputProps}>
        {existingProgressTypes.map((val, id) => <option key={id} value={id}>
          {capitalizeFirstLetter(val.units)} ({val.type})
        </option>)}
        <option value={-1}>+ Track new type of progress</option>
      </Input>
      {progressType && <>
        <Input type='number' label={capitalizeFirstLetter(progressType.units)} value={value}
          onChange={e => setValue(e.target.value)}
          min={minProgress}
          step={progressType.units === 'hours' ? 0.1 : 1}
        {...inputProps} />
        <Input type='button-select' label='Mode' value={action} onChange={setAction} {...inputProps} options={[
          { label: `Add ${progressType.units}`, value: 'add' },
          { label: `Set total ${progressType.units}`, value: 'setTotal'},
        ]} />
        {action !== 'setTotal' && <>
          <Input type='button-select' label='As of' value={dateSelect} onChange={setDateSelect} {...inputProps} options={[
            { label: 'Today', value: 'today'},
            { label: 'Yesterday', value: 'yesterday'},
            { label: 'Another date', value: 'other'},
          ]} />
          {dateSelect === 'other' && <Input type='date' label='Date' value={date} onChange={e => setDate(e.target.value)} {...inputProps} max={dayjs().format('YYYY-MM-DD')} />}
        </>}
      </>}
      <ButtonGroup>
        <Input type='submit' buttonType='normal' {...inputProps} value='Save' />
        <Button onClick={handleCancel} style={{color: '#f79274', fontWeight: 'normal'}}>Cancel</Button>
      </ButtonGroup>
    </ProgressForm>
    </div>
}
Form.propTypes = {
  onFinish: PropTypes.func.isRequired,
}
