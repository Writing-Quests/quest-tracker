import { useState } from 'react'
import api from '../../services/api'

export default function Testing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  async function handleNewProject() {
    setLoading(true)
    try {
      setData(await api.post('projects', {
      }))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }
  return <div>
    <button onClick={handleNewProject}>New project</button>
    <div><strong>Loading: </strong>{JSON.stringify(loading)}</div>
    <div><strong>Error: </strong>{JSON.stringify(error)}</div>
    <div><strong>Data: </strong>{JSON.stringify(data)}</div>
  </div>
}
