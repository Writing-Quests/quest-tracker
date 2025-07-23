/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useMemo, createContext } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import { useParams, useNavigate, Link } from 'react-router-dom'
import styled from 'styled-components'
import context from '../../services/context'
import Page from '../Page'
import api from '../../services/api'
import Input, { Button } from '../Forms/Input'
import Notices from '../Notices'
import Loading from '../Loading'
import Progress from '../Progress'
import { ErrorContainer, ContentContainer, ContentBlock, AnimatedContainer, SuccessContainer, NeutralContainer } from '../Containers'
import { ModalStyle, ModalCloseButton } from '../Modal'
import Modal from 'react-modal'
import {CountdownBar} from '../Forms/Countdown'

const { LoggedInUserContext } = context

const ProfileContext = createContext()

const TitleHeader = styled.h2`
  font-family: "Playfair Display", serif;
  font-size: 2.5rem;
  position: relative;
  margin-bottom: 0;
  .titleText {
    color: #fff;
    text-decoration: none;
    &:hover {
      color: #ccc;
      text-decoration: underline;
    }
  }
  .editLink {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 1rem;
    font-weight: bold;
    font-family: "Poppins", sans-serif;
    display: inline-block;
  }
}
`

function ProjectsList({username}) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState()
  const [refetchProjects, setRefetchProjects] = useState(0)
  useEffect(() => {
    if(!username) {
      setError("Need username to load projects")
      return
    }
    (async () => {
      if(!data) { setLoading(true) }
      try {
        const resp = await api.get(`users/${username}/projects`)
        setData(resp.data['hydra:member'])
      } catch(e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [username, refetchProjects])
  const { activeProjects, pastProjects, futureProjects } = useMemo(() => {
    if(!data) { return {} }
    // TODO: incorporate goals
    return { activeProjects: data, pastProjects: [], futureProjects: [] }
    const activeProjects = []
    const pastProjects = []
    const futureProjects = []
    for (const d of data) {
      const hasActiveGoal = (d.goals || []).some(goal => {
        //if(d.id === 11) { debugger }
        if(!goal.end_date || !goal.start_date) { return false }
        if(
          dayjs(goal.end_date).isAfter(dayjs().subtract(7, 'day'))
          &&
          dayjs(goal.start_date).isBefore(dayjs().add(2, 'day'))
        ) {
          return true
        }
      })
      if(hasActiveGoal) {
        activeProjects.push(d)
        continue
      }
      const hasPastGoal = (d.goals || []).some(goal => {
        if(!goal.end_date) { return false }
        if(dayjs(goal.end_date).isBefore(dayjs())) { return true }
      })
      if(hasPastGoal) {
        pastProjects.push(d)
      } else {
        futureProjects.push(d)
      }
    }
    return { activeProjects, pastProjects, futureProjects }
  }, [data])
  if(loading || !data) { return <Loading /> }
  if(error) { return <ErrorContainer>Error loading projects.</ErrorContainer> }
  return <>
    {Boolean(activeProjects.length) && <AnimatedContainer>
      <ContentBlock>
      {activeProjects.map((p, i) => <div key={p.code}>
        <div>
          <TitleHeader><Link className="titleText" to={`/project/view/${p.code}`}>{p.title ? p.title : <em>untitled project</em>}</Link>
            <span className="editLink">&nbsp;<Link to={`/project/edit/${p.code}`}>Edit</Link></span>
          </TitleHeader>
          {Boolean(p.goals?.length) && <Progress project={p} allowEditing={true} refetch={() => setRefetchProjects(refetchProjects+1)} />}
        </div>
        {(activeProjects.length - 1) !== i && <hr />}
      </div>)}
      </ContentBlock>
    </AnimatedContainer>}
    <ContentBlock>
      <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto'}}>+ Start a new project</Button>
    </ContentBlock>
    {Boolean(futureProjects.length) && <AnimatedContainer color='#5B504E'>
      <h2>Upcoming Projects</h2>
      <ul>
        {futureProjects.map((p, i) =>
          <li key={i}>
            <strong>{p.title ? p.title : <em>untitled project</em>}</strong>
            &nbsp;
            {p.goals?.[0] && <>
              {Number(p.goals[0].goal).toLocaleString()} {p.goals[0].units} from {dayjs(p.goals[0].start_date).format('MMM D, YYYY')} to {dayjs(p.goals[0].end_date).format('MMM D, YYYY')}
            </>}
            &nbsp;
            <Link to={`/project/${p.code}`}>Edit</Link>
          </li>
        )}
      </ul>
    </AnimatedContainer>}
    {Boolean(pastProjects.length) && <ContentBlock>
      <h2>Past Projects</h2>
      <p><em>Viewing details for upcoming and past projects is coming soon! Contact us in the meantime if you&rsquo;d like your data.</em></p>
      <ul>
        {pastProjects.map(p =>
          <li key={p.code}>
            <strong>{p.title ? p.title : <em>untitled project</em>}</strong> ({p.goals?.[0]?.goal_progress_percent >= 100 ? 'Completed! 🎉' : ((p.goals?.[0]?.goal_progress_percent || '0') + '%')})
            &nbsp;
            <Link to={`/project/${p.code}`}>Edit</Link>
          </li>
        )}
      </ul>
      <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'block', margin: 'auto'}}>+ Start a new project</Button>
    </ContentBlock>}
  </>
}
ProjectsList.propTypes = {
  username: PropTypes.string.isRequired,
  setUpModal: PropTypes.func
}

/*
* 2025-06-24 - moving projects to their own page (to make a feed/homepage more useable; mostly a copy/paste of Profile, removing the parts about whose profile it is knowing that this page only shows you your projects. - Ashley
*/
export function UserProjects() {
  const user = useContext(LoggedInUserContext)
  const navigate = useNavigate()
  return <ProfileContext.Provider value={true}> {/* this is intended to be a view-your-projects page, not a public page. */}
    <Page>
      <ContentContainer>
        <ContentBlock>
          <Notices />
        </ContentBlock>
        {(Boolean(user.username) && Boolean(user.projects?.length)) ?
          <ProjectsList username={user.username} />
          :
          (<>
              <p>No projects yet!</p>
              <Button type='normal' onClick={() => navigate('/project/new')} style={{display: 'blocked', margin: 'auto'}}>+ Start a new project</Button>
            </>
          )
        }
      </ContentContainer>
    </Page>
  </ProfileContext.Provider>
}

export function ViewProject() {
  const user = useContext(LoggedInUserContext)
  const navigate = useNavigate()
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)
  const { projectCode } = useParams()
  const [project,setProject] = useState()
  const [projectUpdates,setProjectUpdates] = useState([])
   useEffect(() => {
    if(!user) {
      setError("Need username to load projects")
      return
    }
    (async () => {
      if(!project) { setLoading(true) }
      try {
        const resp = await api.get(`project/${projectCode}`)
        setProject(resp.data)
       // TODO: getting feed entry updates is throwing an error. me vs apiplatform
      } catch(e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, projectCode])
  // TODO: confirm that "UPdate Progress" isn't available if this isn't my project
  // TODO: need to redirect if this is unallowed — if the project isn't public or isn't mine.
  if(loading || !project) { return <Loading /> }
  if(error) { return <ErrorContainer>Error loading projects.</ErrorContainer> }
  else {
    const isMyProject = (project.user == user['@id'])
    return <ProfileContext.Provider value={isMyProject}>
      <Page>
        <ContentContainer>
      <AnimatedContainer>
        <ContentBlock>
        <div>
          <div>
            <TitleHeader>{project.title ? project.title : <em>untitled project</em>}
              {isMyProject &&
                <span className="editLink">&nbsp;<Link style={{'color': '#fff'}} to={`/project/edit/${project.code}`}>Edit</Link></span>
              }
            </TitleHeader>
            {Boolean(project.goals?.length) && <Progress project={project} allowEditing={isMyProject} refetch={() => setRefetchProjects(refetchProjects+1)} />}
          </div>
        </div>
        </ContentBlock>
      </AnimatedContainer>
      </ContentContainer>
    </Page>
    </ProfileContext.Provider>
  }
}
