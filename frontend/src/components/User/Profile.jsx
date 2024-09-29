import { useContext } from 'react'
import context from '../../services/context'
import Page from '../Page'

const { LoggedInUserContext } = context

export default function Profile () {
  const user = useContext(LoggedInUserContext)
  return <Page>
    <p>Welcome {user.username}! Your email address is {user.email}.</p>
  </Page>
}
