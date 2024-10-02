import { createContext } from 'react'

const context = {
  LoggedInUserContext: createContext(null),
  GetLoggedInUserContext: createContext(null),
}

export default context
