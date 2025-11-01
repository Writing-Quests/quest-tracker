import api from './api'

export default async function userConnection (username1, username2, details=false) {
  try {
    const resp = await api.get(`connection/status/${username1}/${username2}`)
    if (details) { // return all the connection status info, not _just_ the status
      return resp.data || null;
    } else { // only return the status
      return resp.data?.status || null;
    }
  } catch (err) {
    console.log(err);
    // err on the side of not connected
    return null;
  }
}