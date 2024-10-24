import { useContext } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { CenteredContainer } from './Containers'
import context from '../services/context'
import api from '../services/api'

const { LoggedInUserContext } = context

const InvisibleLink = styled(Link)`
  display: block;
  &, &:hover {
    text-decoration: none;
  }
`

const SiteTitle = styled(InvisibleLink)`
  font-family: 'Playfair Display', serif;
  font-size: 35px;
  font-weight: bold;
  margin-left: 10px;
  &, &:hover {
    color: var(--color-primary);
  }
`

const LogoContainer = styled.div`
  max-width: 500px;
  display: flex;
  margin: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
`

const UserControlsLinks = styled.div`
  font-size: 0.8rem;
  margin-left: 8px;
  margin-top: 4px;
  & > a {
    text-decoration: none;
    padding: 0 5px;
    &, &:visited {
      color: #333;
    }
    &:hover {
      text-decoration: underline;
    }
  }
`

function UserControls() {
  async function handleLogout(e) {
    e.preventDefault()
    await api.post('auth/logout')
    window.location = '/'
  }
  const user = useContext(LoggedInUserContext)
  return <UserControlsLinks>
    <a href='/profile'><strong>{user.username}</strong></a>&nbsp;•&nbsp;
    <a href='/settings'>Settings</a>&nbsp;•&nbsp;
    <a href='#' onClick={handleLogout}>Logout</a>
  </UserControlsLinks>
}

export default function Page({children}) {
  const user = useContext(LoggedInUserContext)
  return <>
      <LogoContainer>
        <InvisibleLink to='/'><img src='/logo.svg' style={{maxWidth: '75px'}} /></InvisibleLink>
        <div>
          <SiteTitle to='/'>Writing Quests</SiteTitle>
          {user && <UserControls />}
        </div>
      </LogoContainer>
      {children}
      <CenteredContainer style={{
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '0.7rem',
        marginBottom: '30px'
      }}>
        <span>Copyright © {new Date().getFullYear()}</span>
        <br />
        <span>Learn more at <a href='https://writingquests.org'>writingquests.org</a></span>
      </CenteredContainer>
  </>
}
Page.propTypes = {
  children: PropTypes.node,
}
