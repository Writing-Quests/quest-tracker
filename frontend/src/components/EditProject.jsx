import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import Page from './Page'
import Input, { Button } from './Forms/Input'
import { ErrorContainer } from './Containers'

function EditProjectInner({project, onSave}) {
  const [title, setTitle] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    if(!project) { return }
    setTitle(project.title || '')
  }, [project])
  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      await onSave({title})
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  return <Page>
    <h1>{project ? 'Edit' : 'New'} Project</h1>
    {error && <ErrorContainer>Error: {JSON.stringify(error)}</ErrorContainer>}
    <Input type='text' label='Title' placeholder='Your project title' disabled={loading} value={title} onChange={e => setTitle(e.target.value)} />
    <Button onClick={handleSubmit} disabled={loading}>Save</Button>
  </Page>
}
EditProjectInner.propTypes = {
  project: PropTypes.object,
  onSave: PropTypes.func.isRequired,
}

export default function EditProject() {
  const [project, setProject] = useState()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const { projectId } = useParams()
  useEffect(() => {
    (async () => {
      setLoading(true)
      setError(null)
      try {
        if(projectId) {
          const resp = await api.get(`/projects/${projectId}`)
          setProject(resp.data)
        }
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [projectId])
  async function handleSave(patch) {
    if(!project) {
      const resp = await api.post('projects', patch)
      setProject(resp.data)
      window.history.pushState('register', 'Edit Project', `/project/${resp.data.id}`)
    } else {
      await api.patch(`projects/${project.id}`, patch)
    }
  }
  if(loading) {
    return <div>Loading&hellip;</div>
  }
  if(error) {
    return <Page>
      <ErrorContainer>Error loading project: {JSON.stringify(error)}</ErrorContainer>
    </Page>
  }
  return <EditProjectInner project={project} onSave={handleSave} />
}
