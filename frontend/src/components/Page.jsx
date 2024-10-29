import { useContext } from 'react'
import styled, { keyframes } from 'styled-components'
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

const betaAnimation = keyframes`
  0% {transform: rotate(30deg)}
  30% {transform: rotate(25deg)}
  60% {transform: rotate(35deg)}
  100% {transform: rotate(30deg)}
`

const Beta = styled.a`
  position: absolute;
  top: -2px;
  right: -26px;
  background-color: #2f8e19;
  color: white;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 3px 7px;
  border-radius: 5px;
  transform: rotate(30deg);
  opacity: 0.5;
  display: block;
  text-decoration: none;
  &:hover {
    opacity: 1;
    color: white;
    cursor: pointer;
    text-decoration: none;
    animation-name: ${betaAnimation};
    animation-duration: 1s;
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
    <Link to='/profile'><strong>{user.username}</strong></Link>&nbsp;•&nbsp;
    <Link to='/settings'>Settings</Link>&nbsp;•&nbsp;
    <a href='#' onClick={handleLogout}>Logout</a>
  </UserControlsLinks>
}

export default function Page({children}) {
  const user = useContext(LoggedInUserContext)
  return <>
      <LogoContainer>
        <InvisibleLink to='/'><img src='/logo.svg' style={{maxWidth: '75px'}} /></InvisibleLink>
        <div style={{position: 'relative'}}>
          <SiteTitle to='/'>Writing Quests</SiteTitle>
          <Beta href='/feedback' target='_blank' rel='noopener noreferrer'>Beta!</Beta>
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
        <div style={{marginBottom: 10, fontWeight: 'bold', fontSize: '0.9rem'}}>
          Help us improve: <a href='/feedback' target='_blank' rel='noopener' style={{fontWeight: 'inherit'}}>share your feedback!</a>
        </div>
        <div>Copyright © {new Date().getFullYear()}</div>
        <div>Learn more at <a href='https://writingquests.org'>writingquests.org</a></div>
      </CenteredContainer>
  </>
}
Page.propTypes = {
  children: PropTypes.node,
}
