import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import api from '../services/api'
import Page from './Page'
import Input from './Forms/Input'
import InputGroup from './Forms/InputGroup'
import Loading from './Loading'
import { ErrorContainer, ContentContainer, ContentBlock, AnimatedContainer, SuccessContainer } from './Containers'

const FormContainer = styled.form`
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
`

const GoalsComingSoon = styled.div`
  text-align: center;
  display: block;
  margin-top: -16px;
  font-size: 0.85rem;
  font-style: italic;
  margin-bottom: 17px;
`

const DurationInfo = styled.div`
  text-align: center;
  display: block;
`

function EditProjectInner({project, goals=[], onSave, justSaved, saving}) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('writing')
  const [units, setUnits] = useState('words')
  const [goal, setGoal] = useState(50000)
  const [startDate, setStartDate] = useState('2024-11-01')
  const [endDate, setEndDate] = useState('2024-11-30')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if(!project) { return }
    setTitle(project.title || '')
  }, [project])
  useEffect(() => {
    if(!goals.length) { return }
    setType(goals[0].type)
    setUnits(goals[0].units)
    setGoal(goals[0].goal)
    setStartDate(goals[0].start_date.split('T')[0])
    setEndDate(goals[0].end_date.split('T')[0])
  }, [goals])
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave({title}, {type, units, goal: String(goal), start_date: startDate, end_date: endDate})
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  let duration
  let startDateObj
  let endDateObj
  if(startDate && endDate) {
    startDateObj = dayjs(startDate)
    endDateObj = dayjs(endDate)
    duration = endDateObj.diff(startDateObj, 'd') + 1
  }
  const inputProps = { disabled: loading }
  return <Page>
    <ContentContainer>
      <FormContainer onSubmit={handleSubmit}>
        <ContentBlock>
          <h1>{project ? 'Edit' : 'New'} Project</h1>
          {justSaved && <SuccessContainer>Saved project!</SuccessContainer>}
          {error && <ErrorContainer>Error: {JSON.stringify(error)}</ErrorContainer>}
          {saving && <Loading inline={true} text='Saving' />}
          <Input type='text' label='Title' placeholder='Your project title' value={title} onChange={e => setTitle(e.target.value)} {...inputProps} />
        </ContentBlock>
        <AnimatedContainer color='#c46415'>
          <ContentBlock>
            <h2 style={{textAlign: 'center'}}>Goal</h2>
            <GoalsComingSoon>Multiple goals on one project are coming soon!</GoalsComingSoon>
            <InputGroup>
              <Input type='select' label='Type' value={type} onChange={e => setType(e.target.value)} {...inputProps}>
                <option value="writing">Writing</option>
                <option value="editing">Editing</option>
              </Input>
              <Input type='select' label='Units' value={units} onChange={e => setUnits(e.target.value)} {...inputProps}>
                <option value="words">Words</option>
                <option value="hours">Hours</option>
              </Input>
              {/* TODO: Add thousands separators. But this will have to change to type text with some crazy logic */}
              <Input
                type='number'
                min='0'
                max='1000000'
                required
                value={goal}
                label='Goal'
                step={units === 'words' ? '1' : '0.01'}
                onChange={e => setGoal(e.target.value)}
                {...inputProps}
              />
            </InputGroup>
            <InputGroup>
              <Input type='date' label='Start date' value={startDate} onChange={e => setStartDate(e.target.value)} {...inputProps} required min='2024-01-01' max={endDateObj?.format('YYYY-MM-DD')} />
              <Input type='date' label='End date' value={endDate} onChange={e => setEndDate(e.target.value)} {...inputProps} required min={startDateObj ? startDateObj.format('YYYY-MM-DD') : '2024-01-01'} />
            </InputGroup>
            {(duration > 0) && <DurationInfo>That&rsquo;s <strong>{duration} day{duration > 1 && 's'}</strong>
              <br />
              ({(goal/duration).toLocaleString(undefined, {maximumFractionDigits: 2})} {units} per day)
            </DurationInfo>}
          </ContentBlock>
        </AnimatedContainer>
        <ContentBlock>
          <Input type='submit' value='Save' {...inputProps} />
        </ContentBlock>
      </FormContainer>
    </ContentContainer>
  </Page>
}
EditProjectInner.propTypes = {
  project: PropTypes.object,
  goals: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  justSaved: PropTypes.bool,
  saving: PropTypes.bool,
}

export default function EditProject() {
  const [project, setProject] = useState()
  const [goals, setGoals] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [justSaved, setJustSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { projectId } = useParams()
  useEffect(() => {
    (async () => {
      setLoading(true)
      setError(null)
      try {
        if(projectId) {
          const resp = await api.get(`/projects/${projectId}`)
          setProject(resp.data)
          const resp2 = await api.get(`/projects/${projectId}/goals`)
          setGoals(resp2.data?.['hydra:member'] || [])
        }
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [projectId])
  async function handleSave(projectPatch, goalPatch) {
    // Save project
    setJustSaved(false)
    setSaving(true)
    let newProject = project
    if(!project) {
      const resp = await api.post('projects', projectPatch)
      setProject(resp.data)
      newProject = resp.data
      window.history.pushState('register', 'Edit Project', `/project/${resp.data.id}`)
    } else {
      await api.patch(`projects/${project.id}`, projectPatch)
    }
    // Save goal (assume only one goal per project right now)
    if(goals?.length) {
      const resp = await api.patch(`goals/${goals[0].id}`, goalPatch)
      setGoals([resp.data])
    } else {
      const resp = await api.post(`goals`, {
        ...goalPatch,
        project: newProject['@id'],
      })
      setGoals([resp.data])
    }
    setSaving(false)
    setJustSaved(true)
  }
  if(loading) {
    return <Loading fullPage={true} />
  }
  if(error) {
    return <Page>
      <ErrorContainer>Error loading project: {JSON.stringify(error)}</ErrorContainer>
    </Page>
  }
  return <EditProjectInner project={project} goals={goals} onSave={handleSave} justSaved={justSaved} saving={saving} />
}
