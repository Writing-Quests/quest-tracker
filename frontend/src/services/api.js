import axios from 'axios'
import CONSTS from '../CONSTS'

const api = axios.create({
  baseURL: CONSTS.API_URL,
  withCredentials: true, // TODO: Turn this off in prod
  headers: {
    patch: {
      'content-type': 'application/merge-patch+json'
    }
  },
})

export default api
