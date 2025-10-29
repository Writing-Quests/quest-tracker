import { createContext } from 'react'

const context = {
  LoggedInUserContext: createContext({
    user: null,
    setUser: () => {}
  }),
  GetLoggedInUserContext: createContext(null),
}

export default context
