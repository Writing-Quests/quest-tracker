import { useContext, useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import PropTypes, { bool } from 'prop-types'
import { useNavigate, Link } from 'react-router-dom'
import { CenteredContainer } from './Containers'
import context from '../services/context'
import api from '../services/api'
import { usePolling, useVisibilityChange, useTimeout } from '../services/timing'
import { LoadingInline } from './Loading'
import { TextTimestamp } from './TextTransforms'

const { LoggedInUserContext } = context

const InvisibleLink = styled(Link)`
  display: block;
  &, &:hover {
    text-decoration: none;
  }
`

const SiteNavigation = styled.div`
  @media (orientation: portrait) {
    flex-direction: column;
    justify-content: middle;
    align-items: center;
    flex-wrap: wrap;
    .navLinks {
      width: 100%
    }
    .wgLogo {
      margin-bottom: -25px;
    }
  }
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
  @media (orientation: landscape) {
    margin-left: 10px;
  }
  @media (orientation: portrait) {
    margin-top: -10px;
  }
  &, &:hover {
    color: var(--color-primary);
  }
`

const NavigationHeader = styled.div`
  flex-grow: 2;
  text-align: center;
  @media (orientation: landscape) {
    text-align: left;
    a:first-child {
      margin-left: 30px;
    }
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
  @media (orientation: portrait) {
    width: 100%;
    text-align: center;
  }
`

const betaAnimation = keyframes`
  0% {transform: rotate(30deg)}
  30% {transform: rotate(21deg)}
  60% {transform: rotate(31deg)}
  100% {transform: rotate(30deg)}
`

const Beta = styled.a`
  @media (orientation: portrait) {
    top: -12px;
  }
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

const UserActionsHolder = styled.div` 
  user-select: none;
  position: relative;
  display: flex;
  justify-content: end;
  gap: 5px;
  align-items: center;
  margin: 0;
  padding: 0 5px;
  width: fit-content;
  @media (orientation: portrait) {
    width: 100%;
    justify-content: space-between;
  }
`

const UserMenuToggle = styled.div`
  cursor: pointer;
  font-family: 'Playfair Display', serif;
  font-weight: bold;
  font-size: 1.25em;
  display: inherit;
  align-items: end;
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

const newNotificationAnimation = keyframes`
  0% {transform: rotate(0deg)}
  10% {transform: rotate(10deg)}
  20%  {transform: rotate(0deg)}
  30% {transform: rotate(-10deg)}
  40% {transform: rotate(0deg)}
  50% {transform: rotate(10deg)}
  60% {transform: rotate(0deg)}
  70% {transform: rotate(-10deg)}
  80% {transform: rotate(0deg)}
  90% {transform: rotate(10deg)}
  100% {transform: rotate(0deg)}
`

const NotificationCount = styled.div`
  user-select: none;
  position: relative;
  font-weight: 400;
  font-family: 'Poppins', sans-serif;
  font-size: 0.65rem;
  padding: 0;
  display: inline-block;
  width: 45px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  color: #fff;
  text-align: center;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M14.235 19c.865 0 1.322 1.024.745 1.668A4 4 0 0 1 12 22a4 4 0 0 1-2.98-1.332c-.552-.616-.158-1.579.634-1.661l.11-.006zM12 2c1.358 0 2.506.903 2.875 2.141l.046.171l.008.043a8.01 8.01 0 0 1 4.024 6.069l.028.287L19 11v2.931l.021.136a3 3 0 0 0 1.143 1.847l.167.117l.162.099c.86.487.56 1.766-.377 1.864L20 18H4c-1.028 0-1.387-1.364-.493-1.87a3 3 0 0 0 1.472-2.063L5 13.924l.001-2.97A8 8 0 0 1 8.822 4.5l.248-.146l.01-.043a3 3 0 0 1 2.562-2.29l.182-.017z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 32px;
  &[data-new=true] {
    animation-name: ${newNotificationAnimation};
    animation-duration: 1.5s;
  }
  &:hover, &[data-dropdown-open=true]{
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f17422' d='M14.235 19c.865 0 1.322 1.024.745 1.668A4 4 0 0 1 12 22a4 4 0 0 1-2.98-1.332c-.552-.616-.158-1.579.634-1.661l.11-.006zM12 2c1.358 0 2.506.903 2.875 2.141l.046.171l.008.043a8.01 8.01 0 0 1 4.024 6.069l.028.287L19 11v2.931l.021.136a3 3 0 0 0 1.143 1.847l.167.117l.162.099c.86.487.56 1.766-.377 1.864L20 18H4c-1.028 0-1.387-1.364-.493-1.87a3 3 0 0 0 1.472-2.063L5 13.924l.001-2.97A8 8 0 0 1 8.822 4.5l.248-.146l.01-.043a3 3 0 0 1 2.562-2.29l.182-.017z'/%3E%3C/svg%3E");
    span {
      color: #000;
    }
  }
`

const dropdownAnimationIn = (top, right) => keyframes`
  0% {
    top: ${top};
    right: ${right};
    height: 0;
  }
  100% {
    top: ${top};
    right: ${right};
    height: auto;
  }  
`;

const dropdownAnimationOut = (top, right) => keyframes`
  0% {
    top: ${top};
    right: ${right};
    height: auto;
  }
  100% {
    top: ${top};
    right: ${right};
    height: 0;
  }  
`;

const DropdownMenu = styled.div`
  @media (orientation: portrait) {
    min-width: 90%;
    max-width: 90%;
    margin: 0 auto;
  }
  font-family: 'Poppins', sans-serif;
  z-index: 99;
  position: fixed;
  top: ${(props) => (props.$top)};
  right: ${(props) => (props.$right)};
  max-height: 80%;
  max-width: 45%;
  border: 2px solid #ccc;
  margin: 0;
  padding: 0;
  overflow-y: ${(props) => (props.$menutype == 'notifications' && 'scroll') || 'hidden'};
  text-align: ${(props) => (props.$menutype == 'notifications' && 'left') || 'center'};
  padding: 10px;
  background-color: #fff;
  &[data-visible=true] {
    animation: ${(props) => (dropdownAnimationIn(props.$top, props.$right))};
    animation-duration: 200ms;
    display: block;
  }
  &[data-visible=false] {
    animation: ${(props) => (dropdownAnimationOut(props.$top, props.$right))};
    animation-duration: 200ms;
  display: none;
  }
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
  position: relative;
  display: flex;
  justify-items: space-between;
  align-items: end;
  width: 100%;
  padding: 5px;
  margin: 5px 0;
  border-bottom: 1px solid #ccc;
  &[data-has-link=true] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='hsla(24, 89%, 63%, 1)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5'/%3E%3C/svg%3E");
    background-position: top right;
    background-repeat: no-repeat;
    background-size: 0.8rem;
    &:hover {
      background-color: hsla(24, 89%, 63%, 1)x
    }
  }
  &[data-notification-read=false] {
    font-weight: bold;
  }
  .notificationContent {
    flex-grow: 2;
  }
  .notificationTimestamp {
    opacity: 0.7;
    font-size: 0.7rem;
    opacity: 0.5;
    width: 30%;
    text-align: right;
    
  }
`


function UserControls() {
  const { user } = useContext(LoggedInUserContext)
  const defaultPollingInterval = (5 * 60) * 1000; // minutes * 60 = seconds * 1000 to get milliseconds. change first number, change minutes
  const isPageVisible = useVisibilityChange();
  const userToggle = useRef()
  const userDropdown = useRef()
  const notificationToggle = useRef()
  const notificationDropdown = useRef()
  const onNotificationPage = useRef()
  const lastNotificationPage = useRef()
  const [showingUserMenu, setShowingUserMenu] = useState(false)
  const [showingNotifications, setShowingNotifications] = useState(false)
  const [moreNotifications, setMoreNotifications] = useState(false)
  const [loadingMoreNotifications, setLoadingMoreNotifications] = useState(false)
  const [menuPosition, setMenuPosition] = useState([0, 0]) // top, right
  const [pollingInterval, setPollingInterval] = useState(defaultPollingInterval)
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0)
  const [newNotifications, setNewNotifications] = useState([])

  async function getCurrentNotifications() {
    const resp = await api.get(`/users/${user.username}/notifications`)
    onNotificationPage.current = 1; // start at page one

    if (notificationCount !== resp.data['hydra:totalItems']) {
      // this is basic, but it gives us an idea of what's up. if there's no new notifications, you'll have the same number
      let theseNewNotifications = [];
      if (resp.data.hasOwnProperty('hydra:view')) {
        setMoreNotifications(true)
        lastNotificationPage.current = resp.data['hydra:view']['hydra:last'].match(/.*\?page=(\d*)/)[1];
      }
      setNotifications(resp.data['hydra:member'])
      resp.data['hydra:member'].forEach((n) => { if (!n.user_read) { theseNewNotifications.push(n) } })
      if (theseNewNotifications.length > 0) {
        setNewNotifications(theseNewNotifications)
        setNotificationCount(theseNewNotifications.length)
        document.querySelector('#notificationBell').dataset.new = "true";
        setTimeout(() => {
          if (document.querySelector('#notificationBell')) { // sometimes it tries to do this but the page is refreshing, throws an error
            document.querySelector('#notificationBell').removeAttribute('data-new');
          }
        }, 2500); // back to a new new state 
      }
    }
  }

  async function loadNextNotificationPage() {
    setLoadingMoreNotifications(true)
    onNotificationPage.current++;
    const resp = await api.get(`/users/${user.username}/notifications?page=${onNotificationPage.current}`)
    const moreNewNotifications = [];
    setNotifications(notifications.concat(resp.data['hydra:member']))
    resp.data['hydra:member'].forEach((n) => { if (!n.user_read) { moreNewNotifications.push(n) } })
    if (moreNewNotifications.length > 0) {
      setNewNotifications(newNotifications.concat(moreNewNotifications))
    }
    if (onNotificationPage.current == lastNotificationPage.current) {
      setMoreNotifications(false)
    }
    setLoadingMoreNotifications(false)
  }

  useEffect(() => {
    (async () => {
      if (isPageVisible) {
        if (pollingInterval == null) { // polling had been stopped or hasn't started; kick off a check for notifications
          await getCurrentNotifications();
        }
        setPollingInterval(defaultPollingInterval);
      } else {
        setPollingInterval(null);
      }
    })()
  }, [isPageVisible]);

  useEffect(() => {
    (async () => {
      await getCurrentNotifications();
      if (document.querySelector('#headerBar')) {
        const togglePosition = document.querySelector('#headerBar').getBoundingClientRect()
        setMenuPosition([
          parseInt(togglePosition.bottom),
          window.innerWidth - parseInt(togglePosition.right)
        ])
      }
    })()
  }, [user]); // get notifications when we first load up the user

  useEffect(() => {
    (async () => {
      if (!showingNotifications && newNotifications.length > 0) {
        // notifications are not showing and notifications exist (to prevent marking notifications as read on load)
        markNotificationsRead()
      }
    })()
  }, [showingNotifications])

  useEffect(() => {
    function repositionMenu() {
      const togglePosition = document.querySelector('#headerBar').getBoundingClientRect()
      setMenuPosition([
        parseInt(togglePosition.bottom),
        window.innerWidth - parseInt(togglePosition.right)
      ])
    }
    function closeOnEsc(e) {
      if (e.key === 'Escape') {
        setShowingNotifications(false)
        setShowingUserMenu(false)
      }
    }
    function isClickOutsideDropdown(e) {
      const userMenuVisible = document.querySelector('#userDropdown').dataset.visible == "true"
      const notificationMenuVisible = document.querySelector('#notificationDropdown').dataset.visible == "true"
      // i hate this but it works
      const closeUserMenu = userDropdown.current && !userDropdown.current.contains(e.target) && userMenuVisible && !userToggle.current.contains(e.target)
      const closeNotifications = notificationDropdown.current && !notificationDropdown.current.contains(e.target) && notificationMenuVisible && !notificationToggle.current.contains(e.target)
      if (closeUserMenu) {
        setShowingUserMenu(false)
      }
      if (closeNotifications) {
        setShowingNotifications(false)
      }

    }
    window.addEventListener('resize', repositionMenu, false);
    document.addEventListener('keydown', closeOnEsc, false);
    document.addEventListener('click', isClickOutsideDropdown, false);
    return () => {
      window.removeEventListener('resize', repositionMenu);
      document.removeEventListener('keydown', closeOnEsc, false);
      document.removeEventListener('click', isClickOutsideDropdown, false);
    };
  }, []);

  usePolling(getCurrentNotifications, pollingInterval);

  function Notification({ details }) {
    const navigate = useNavigate()
    return <NotificationItem key={details.id} data-has-link={details.hasOwnProperty('notification_link')} data-notification-read={details.user_read} onClick={(e) => {
      if (details.notification_link) {
        markNotificationsRead();
        navigate(details.notification_link)
      }
    }}>
      <span className="notificationContent">{details.content}</span>
      <span className="notificationTimestamp"><TextTimestamp type="short" datetime={details.created_at} /></span>
    </NotificationItem>
  }

  function MenuIcon({ show }) {
    if (show) { // menu is currently showing, this is an x icon
      return <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" /></svg></>
    } else { // menu is not showing, this is a down caret
      return <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m12 15l-5-5h10z" /></svg></>
    }
  }

  async function handleLogout(e) {
    e.preventDefault()
    await api.post('auth/logout')
    window.location = '/'
  }


  async function toggleDropdown(e) {
    if (userToggle.current.contains(e.target)) {
      setShowingNotifications(false)
      setShowingUserMenu(!showingUserMenu)
    }
    if (notificationToggle.current.contains(e.target)) {
      setShowingUserMenu(false)
      setShowingNotifications(!showingNotifications)
    }

  }

  async function markNotificationsRead() {
    let resp = await api.patch(`/notifications/bulk`, newNotifications)
    if (resp.statusCode == 200) {
      let currentNotifications = [...notifications];
      currentNotifications.forEach((n) => {
        if (n.user_read) { n.user_read = true; }
      })
      setNotifications([...currentNotifications])
      setNewNotifications([])
    }
  }

  return <>
    <UserMenuToggle ref={userToggle} onClick={toggleDropdown}><span>{user.username}</span> <MenuIcon show={(showingUserMenu)} /></UserMenuToggle>
    <NotificationCount ref={notificationToggle} id="notificationBell" data-dropdown-open={(showingNotifications === 1)} onClick={toggleDropdown}>{notificationCount === 0 ? "" : notificationCount}</NotificationCount>
    <DropdownMenu ref={userDropdown} id="userDropdown" className="dropdownParent" $menutype="user" $top={`${menuPosition[0] + 8}px`} $right={`${menuPosition[1]}px`} data-visible={(showingUserMenu)}>
      <Link to={`/profile/${user.username}`}>Your Profile</Link>
      <hr />
      <Link to='/messages'>Messages</Link>
      <Link to='/connections'>Connections</Link>
      <Link to='/settings'>Settings</Link>
      <hr />
      <a href='#' onClick={handleLogout}>Logout</a>
    </DropdownMenu>
    <DropdownMenu ref={notificationDropdown} id="notificationDropdown" className="dropdownParent" $menutype="notifications" $top={`${menuPosition[0] + 8}px`} $right={`${menuPosition[1]}px`} $scrollcontent="true" data-visible={(showingNotifications)}>
      {notifications &&
        notifications.map((n) => { return <Notification details={n} /> })
      }
      {moreNotifications &&
        <div style={{ 'padding': '5px', 'backgroundColor': 'hsla(24, 19%, 83%, 1)', 'cursor': 'pointer', 'textAlign': 'center' }} onClick={loadNextNotificationPage}>{loadingMoreNotifications ? <LoadingInline /> : "See More Notifications"}</div>
      }
    </DropdownMenu>
  </>
}

function StaticPages({ header = true }) {
  const { user } = useContext(LoggedInUserContext)
  function Spacer() {
    return <>&nbsp;&bull;&nbsp;</>
  }
  function ProfileLink({ username }) {
    const profileURL = `/profile/${username}`
    return (<Link to={profileURL}>Your Profile</Link>)
  }
  ProfileLink.propTypes = {
    username: PropTypes.string
  }
  return <>
    <Link to='/about'>{header ? 'About Questy' : 'About the Questy Tracker'}</Link><Spacer />
    <Link to='/privacy'>{header ? 'Privacy' : 'Privacy Policy'}</Link>
    {!header && <><Spacer /><Link to='/terms'>Terms of Use</Link></>}
    {!header && <><br /><Link to='/profiles/public'>View Public Users</Link></>}
    {user ? <><Spacer /><ProfileLink username={user.username} /></> : <><Spacer /><Link to='/login'>Login</Link></>}
  </>
}
StaticPages.propTypes = {
  header: PropTypes.bool
}

export default function Page({ children }) {
  // TODO: we should have some sort of "Hey, we use cookies" alert. 
  const { user } = useContext(LoggedInUserContext)
  //const loggedIn = Boolean(useContext(LoggedInUserContext))
  return <>
    <SiteNavigation id="headerBar" style={{ 'overflow': {} }}>
      <InvisibleLink className="wqLogo" to='/'><img src='/logo.svg' style={{ maxWidth: '50px' }} /></InvisibleLink>
      <div className="siteName" style={{ position: 'relative' }}>
        <SiteTitle to='/'>Questy</SiteTitle>
        <Beta href='/feedback' target='_blank' rel='noopener noreferrer'>Beta!</Beta>
      </div>
      <NavigationHeader className="navLinks" style={{ 'width': '100%' }}>
        <NavigationLink to="/buddies">Buddies</NavigationLink>
        <NavigationLink to="/projects">Projects</NavigationLink>
        <NavigationLink to="/quests">Quests</NavigationLink>
        {/*<NavigationLink to="/groups">Groups</NavigationLink>*/}
        <NavigationLink to="/profiles/public">Users</NavigationLink>
      </NavigationHeader>
      <UserActionsHolder>
        {user ? <UserControls /> : <NavigationLink to="/login" color="#000000">Login</NavigationLink>}
      </UserActionsHolder>
    </SiteNavigation>
    <div id="pageContent" style={{ width: '100vw' }}>
      {children}
    </div>
    <CenteredContainer style={{
      textAlign: 'center',
      marginTop: '40px',
      fontSize: '0.7rem',
      marginBottom: '30px'
    }}>
      <div style={{ marginBottom: 10, fontWeight: 'bold', fontSize: '0.9rem' }}>
        <StaticPages header={false} />
      </div>
      <div style={{ marginBottom: 10, fontWeight: 'bold', fontSize: '0.9rem' }}>
        Help us improve: <a href='/feedback' target='_blank' rel='noopener' style={{ fontWeight: 'inherit' }}>share your feedback!</a>
      </div>
      <div>Copyright © {new Date().getFullYear()}</div>
      <div>Learn more at <a href='https://writingquests.org'>writingquests.org</a></div>
    </CenteredContainer>
  </>
}
Page.propTypes = {
  children: PropTypes.node,
}
