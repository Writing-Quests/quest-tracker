import { useContext, useState } from 'react'
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

const SiteNavigation = styled.div`
  width: calc(100% - 40px);
  display: flex;
  margin: 20px auto;
  justify-content: start;
  align-items: end;
  font-family: 'Playfair Display', serif;
`

const SiteTitle = styled(InvisibleLink)`
  font-family: 'Playfair Display', serif;
  font-size: 40px;
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
  align-items: bottom;
`

const UserControlsLinks = styled.div`
  font-size: 1.1rem;
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

const NavigationHeader = styled.div`
  flex-grow: 2;
  a:first-child {
    margin-left: 30px;
  }
`

const NavigationLink = styled(Link)`
  color: ${(props) => (props.color && props.color) || '#6e230c'};
  margin: 0 10px;
  text-decoration: none;
  &:hover {
    color: #a63412;
  }
  font-size: 1.3rem;
`

const UserMenuToggle = styled.div`
  position: relative;
  display: flex;
  justify-content: end;
  gap: 5px;
  align-items: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.25em;
  font-weight: bold;
  margin: 0;
  padding: 0 5px;
  cursor: pointer;
  &:hover {
    svg path {
      fill: #f17422;
    }
  }
  svg {
    path {
      fill: #a3a3a3;
    }
  }
`

const NotificationCount = styled.div`
  position: relative;
  width: 24px;
  font-weight: 400;
  font-family: 'Poppins', sans-serif;
  font-size: 0.65rem;
  display: inline-block;
  width: 32px;
  height: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M14.235 19c.865 0 1.322 1.024.745 1.668A4 4 0 0 1 12 22a4 4 0 0 1-2.98-1.332c-.552-.616-.158-1.579.634-1.661l.11-.006zM12 2c1.358 0 2.506.903 2.875 2.141l.046.171l.008.043a8.01 8.01 0 0 1 4.024 6.069l.028.287L19 11v2.931l.021.136a3 3 0 0 0 1.143 1.847l.167.117l.162.099c.86.487.56 1.766-.377 1.864L20 18H4c-1.028 0-1.387-1.364-.493-1.87a3 3 0 0 0 1.472-2.063L5 13.924l.001-2.97A8 8 0 0 1 8.822 4.5l.248-.146l.01-.043a3 3 0 0 1 2.562-2.29l.182-.017z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 32px;
  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    color: #fff;
    text-align: center;
  }
  &:hover, &[data-dropdown-open=true]{
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f17422' d='M14.235 19c.865 0 1.322 1.024.745 1.668A4 4 0 0 1 12 22a4 4 0 0 1-2.98-1.332c-.552-.616-.158-1.579.634-1.661l.11-.006zM12 2c1.358 0 2.506.903 2.875 2.141l.046.171l.008.043a8.01 8.01 0 0 1 4.024 6.069l.028.287L19 11v2.931l.021.136a3 3 0 0 0 1.143 1.847l.167.117l.162.099c.86.487.56 1.766-.377 1.864L20 18H4c-1.028 0-1.387-1.364-.493-1.87a3 3 0 0 0 1.472-2.063L5 13.924l.001-2.97A8 8 0 0 1 8.822 4.5l.248-.146l.01-.043a3 3 0 0 1 2.562-2.29l.182-.017z'/%3E%3C/svg%3E");
    span {
      color: #000;
    }
  }
`

const DropdownMenu = styled.div`
  font-family: 'Poppins', sans-serif;
  z-index: 99;
  position: fixed;
  display: ${(props) => (props.visible == 'true' && 'block') || 'none'};
  top: ${(props) => (props.top)};
  right: ${(props) => (props.right)};
  max-height: 80%;
  max-width: 50%;
  border: 2px solid #ccc;
  margin: 0;
  padding: 0;
  overflow-y: ${(props) => (props.scrollContent == 'true' && 'scroll') || 'hidden'};
  text-align: ${(props) => (props.menutype == 'notifications' && 'right') || 'center'};
  padding: 10px;
  background-color: #fff;
  > * {
    display: block;
    margin: 10px 0;
  }
  > a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  > hr {
    width: 100%;
    height: 1px;
    content: '';
    outline: 0;
    border-bottom: 1px solid #ccc;
  }
`

const NotificationItem = styled.div`
  display: block;
  width: 100%;
  padding: 4px;
  margin: 5px 0;
  border-bottom: 1px solid #ccc;
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

function childInParentClassBranch (target,parentClass) {
  let foundParent = null
  let start = target;
  do {
    let currentParent = start;
    if (currentParent) {
      switch (true) {
        case currentParent.classList.contains(parentClass):
          foundParent = true;
        break;

        case currentParent.id === 'root': // hit the root element, clearly the branch is not here
          foundParent = false;
        break;

        default:
          start = start.parentElement
        break;
      }
    } else { // usually this is an error on closing the menu currentParent is null, but toss 'em out anyway
      foundParent = false
    }
  } while (foundParent === null)
  return foundParent
}

function Notification ({children}) {
  return <NotificationItem>{children}</NotificationItem>
}

function UserControls() {
  const [showingUserMenu,setShowingUserMenu] = useState('hide')
  const [showingNotifications,setShowingNotifications] = useState('hide')
  const [menuPosition,setMenuPosition] = useState([0,0]) // top, right
  const [notificationCount, setNotificationCount] = useState(5)
  const user = useContext(LoggedInUserContext)
  function MenuIcon ({show}) {
    if (show) { // menu is currently showing, this is an x icon
      return <><svg className="dropdownToggle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path className="dropdownToggle" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/></svg></>
    } else { // menu is not showing, this is a down caret
      return <><svg className="dropdownToggle" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path className="dropdownToggle" d="m12 15l-5-5h10z"/></svg></>
    }
  }
  async function handleLogout(e) {
    e.preventDefault()
    await api.post('auth/logout')
    window.location = '/'
  }
  function toggleDropdown ({which}) {
    let menuState,setMenuState;
    switch (which) {
      case 'user':
        closeNotifications();
        menuState = showingUserMenu;
        setMenuState = setShowingUserMenu;
      break;

      case 'notifications':
        closeUserMenu();
        menuState = showingNotifications;
        setMenuState = setShowingNotifications;
      break;
    }
    if (menuState === 'hide') { // menu is currently hidden; position it before showing
      const togglePosition = document.querySelector('#headerBar').getBoundingClientRect()
      setMenuPosition([
        parseInt(togglePosition.bottom),
        window.innerWidth - parseInt(togglePosition.right)
      ])
    }
    setMenuState(menuState === 'show' ? 'hide' : 'show')
  }
  function closeUserMenu () {
    if (showingUserMenu === 'show') { setShowingUserMenu('hide') }
  }
  
  function closeNotifications () {
    if (showingNotifications === 'show') { setShowingNotifications('hide') }
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeUserMenu();
      closeNotifications();
    }
  } , false)
  document.addEventListener('click', (e) => {
    if (showingNotifications === 'show' || showingUserMenu === 'show') {
      if (!e.target.classList.contains('dropdownToggle') && !e.target.classList.contains('dropdownParent')) {
        if (!childInParentClassBranch(e.target,'dropdownParent')) {
          closeUserMenu();
          closeNotifications();
        }
      }
    }
  }, false)
  const fakeNotifications = [
    {
      'id': 1,
      'notice': 'Bob added you as a friend',
      'href': '/profile/bob'
    },{
      'id': 2,
      'notice': 'Jane started following your updates',
      'href': '/profile/jane'
    },{
      'id': 56,
      'notice': 'You met a goal?',
      'href': null
    },{
      'id': 777,
      'notice': 'Quest Guide posted in "A Group You\'re In"',
      'href': '/group/notreal'
    }
  ]
  const notifications = fakeNotifications.map((n) => {return <Notification key={n.id} details={n}>{n.notice}</Notification>})
  return <>
    <UserMenuToggle className="dropdownToggle" onClick={() => {toggleDropdown({'which':'user'})}}><span className="dropdownToggle">{user.username}</span> <MenuIcon className="dropdownToggle" show={(showingUserMenu === 'show' ? "true" : undefined)} /></UserMenuToggle>
    {/*
    <NotificationCount className="dropdownToggle" count={notificationCount} data-dropdown-open={(showingNotifications === 'show')} onClick={() => {toggleDropdown({'which':'notifications'})}}>
      <span>{notificationCount}</span>
    </NotificationCount>
    */}
    <DropdownMenu className="dropdownParent" menutype="user" top={`${menuPosition[0] + 8}px`} right={`${menuPosition[1]}px`} visible={(showingUserMenu === 'show' ? "true" : undefined)}>
      <Link to={`/profile/${user.username}`}>Your Profile</Link>
      <hr />
      <Link to='/connections'>Connections</Link>
      <Link to='/settings'>Settings</Link>
      <hr />
      <a href='#' onClick={handleLogout}>Logout</a>
    </DropdownMenu>
    {/*
    <DropdownMenu className="dropdownParent" menutype="notifications" top={`${menuPosition[0] + 8}px`} right={`${menuPosition[1]}px`} scrollcontent="true" visible={(showingNotifications === 'show' ? "true" : undefined)}>
      {notifications}
    </DropdownMenu>
    */}
  </>
}

function StaticPages ({header=true}) {
  const user = useContext(LoggedInUserContext)
  function Spacer () {
    return <>&nbsp;&bull;&nbsp;</>
  }
  function ProfileLink ({username}) {
    const profileURL = `/profile/${username}`
    return (<Link to={profileURL}>Your Profile</Link>)
  }
  ProfileLink.propTypes = {
    username: PropTypes.string
  }
  return <>
    <Link to='/about'>{header ? 'About Questy' : 'About the Questy Tracker'}</Link><Spacer />
    <Link to='/privacy'>{ header ? 'Privacy' : 'Privacy Policy'}</Link>
    {!header && <><Spacer /><Link to='/terms'>Terms of Use</Link></>}
    {!header && <><br /><Link to='/profiles/public'>View Public Users</Link></>}
    {user ? <><Spacer /><ProfileLink username={user.username} /></> : <><Spacer /><Link to ='/login'>Login</Link></>}
  </>
}
StaticPages.propTypes = {
  header: PropTypes.bool
}

export default function Page({children}) {
  // TODO: we should have some sort of "Hey, we use cookies" alert. 
  const user = useContext(LoggedInUserContext)
  return <>
      <SiteNavigation id="headerBar">
        <InvisibleLink to='/'><img src='/logo.svg' style={{maxWidth: '50px'}} /></InvisibleLink>
        <div style={{position: 'relative'}}>
          <SiteTitle to='/'>Questy</SiteTitle>
          <Beta href='/feedback' target='_blank' rel='noopener noreferrer'>Beta!</Beta>
        </div>
        <NavigationHeader style={{'width': '100%'}}>
          <NavigationLink to="/buddies">Buddies</NavigationLink>
          <NavigationLink to="/projects">Projects</NavigationLink>
          {/*<NavigationLink to="/groups">Groups</NavigationLink>*/}
          {/*<NavigationLink to="/quests">Quests</NavigationLink>*/}
          <NavigationLink to="/profiles/public">Users</NavigationLink>
        </NavigationHeader>
        {user ? <UserControls /> : <NavigationLink to="/login" color="#000000">Login</NavigationLink>}
      </SiteNavigation>
      <div id="pageContent" style={{width: '100vw'}}>
        {children}
      </div>
      <CenteredContainer style={{
        textAlign: 'center',
        marginTop: '40px',
        fontSize: '0.7rem',
        marginBottom: '30px'
      }}>
        <div style={{marginBottom: 10, fontWeight: 'bold', fontSize: '0.9rem'}}>
          <StaticPages header={false} />
        </div>
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
