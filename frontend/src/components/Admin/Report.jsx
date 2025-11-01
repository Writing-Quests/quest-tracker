import { useContext, useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import useTitle from '../../services/useTitle'
import Page from '../Page'
import { ContentContainer, ContentBlock, ErrorContainer } from '../Containers'
import api from '../../services/api'
import Input, { Button, SectionOptions, OptionButton, StandaloneLabel } from '../Forms/Input'
import styled from 'styled-components'
import context from '../../services/context'
import Notices from '../Notices'
import Loading from '../Loading'
import PropTypes from 'prop-types'
import { ModalStyle, ModalCloseButton } from '../Modal'
import Modal from 'react-modal'

const { LoggedInUserContext } = context

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #E3E3E3;
  th,td {
    text-align: left;
    padding: 4px;
  }
  tr:nth-child(odd) {
    background-color: #E3E3E3;
  }
`

function getHumanDate (date) {
  return new Date(date).toLocaleString('en-US', {'timeZone': 'UTC', 'timeZoneName':'short', 'formatMatcher': 'basic'});
}

function ReportComplete ({report, user}) {
  const who = (user['@id'] == report.reviewed_by_user) ? 'you' : report.reviewed_by_user.replace('/api/users/','')
  return <>
    <StyledTable>
      <tbody>
        <tr>
          <th>Reviewed By</th>
          <td>{who}</td>
        </tr>
        <tr>
          <th>Reviewed At</th>
          <td>{getHumanDate(report.reviewed_at)}</td>
        </tr>
        <tr>
          <th>Action Taken</th>
          <td>{report.review_action}</td>
        </tr>
        {report.review_notes && 
          <>
          <tr>
            <th colSpan="2">Additional Notes</th>
          </tr>
          <tr>
            <td colSpan="2">{report.review_notes}</td>
          </tr>
          </>
        }
      </tbody>
    </StyledTable>
  </>
}
ReportComplete.propTypes = {
  report: PropTypes.object,
  user: PropTypes.object
}

function ReportInProgress ({report,admin}) {
  const [submitWait,setSubmitWait] = useState(false)
  const [reviewComplete,setReviewComplete] = useState(false)
  const [reviewAction,setReviewAction] = useState(report.review_action || null)
  const [reviewNotes,setReviewNotes] = useState(report.review_notes || null)
  const [characterCountLabel, setCharacterCountLabel] = useState(0)
  const [formError,setFormError] = useState(null)
  function setWordcount (e) {
    if (reviewNotes !== null) {
      let count = e.target.value.length;
      setCharacterCountLabel(count)
      if (count > 1000) {
        setFormError('Additional context field limited to 1000 characters.')
      } else if (reportError !== null) {
        setFormError(null)
      }
    }
  }
  function toggleReviewStatus (e) {
    e.preventDefault()
    setReviewComplete(e.target.value == 'true');
  }
  async function handleSubmit(e) {
    e && e.preventDefault()
    try {
      setSubmitWait(true)
      const update = await api.patch(`report/${report.code}`, {
        'reviewedByUser': admin['@id'], // this is the IRI APIPlatform is looking for, it turns out
        'reviewAction': reviewAction,
        'reviewedAt': (reviewComplete ? new Date() : null),
        'reviewNotes': reviewNotes
      })
      if (update.status == 200) {
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      setFormError('An error occurred; your updates have not been saved.')
    } finally {
      setSubmitWait(false);
    }
  }
  const formProps = {disabled: submitWait}
  return <>
  {formError !== null && <ErrorContainer>{formError}</ErrorContainer>}
    <form style={{position: 'relative'}} onSubmit={handleSubmit}>
      <Input type="text" label="Action Taken" defaultValue={reviewAction} onChange={(e) => setReviewAction(e.target.value)} {...formProps}/>
      <Input type="textarea" label={`Additional Information (${characterCountLabel}/1000 characters)`}  defaultValue={reviewNotes} onKeyDown={setWordcount} onChange={(e) => {setReviewNotes(e.target.value)}} {...formProps} />
      <StandaloneLabel>Admin Review Status</StandaloneLabel>
      <SectionOptions size='small' {...formProps}>
        <OptionButton size='small' selected={(reviewComplete == false)} value={false} onClick={(e) => {toggleReviewStatus(e)}}>Still In Progress</OptionButton>
        <OptionButton size='small' selected={(reviewComplete == true)} value={true} onClick={(e) => {toggleReviewStatus(e)}}>Complete</OptionButton>
      </SectionOptions>
      <Input type="submit" value={reviewComplete ? 'Finish Review' : 'Save Changes'} disabled={submitWait == true || (reviewNotes && reviewNotes.length > 1000)} />
    </form>
  </>
}
ReportInProgress.propTypes = {
  report: PropTypes.object,
  admin: PropTypes.object
}

function ProfileSnapshot ({snapshot}) {
  return (
    <>
      <StyledTable>
        <tbody>
          <tr>
            <th>Username</th>
            <td><Link to={`/profile/${snapshot.username}`}>{snapshot.username}</Link></td>
          </tr>
          <tr>
            <th>Email Address</th>
            <td>{snapshot.email} ({snapshot.emailVerifiedAt ? "verified" : "unverified"})</td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{getHumanDate(snapshot.createdAt.date)}</td>
          </tr>
          <tr>
            <th>Last Edit</th>
            <td>{getHumanDate(snapshot.editedAt.date)}</td>
          </tr>
          {snapshot.profile_link && 
            <tr>
              <th>Link</th>
              <td>{snapshot.profile_link}</td>
            </tr>
          }
          {snapshot.description && 
            <tr>
              <th>Profile Blurb</th>
              <td>{snapshot.description}</td>
            </tr>
          }
          {snapshot.gravatar && 
            <tr>
              <th>Gravatar Image</th>
              <td>{snapshot.gravatar}</td>
            </tr>
          }
        </tbody>
      </StyledTable>
    </>
  )
}
ProfileSnapshot.propTypes = {
  snapshot: PropTypes.object.isRequired
}

function ProjectSnapshot ({snapshot}) {
  return (
    <>
      <StyledTable>
        <tbody>
          <tr>
            <th>Username</th>
            <td><Link to={`/profile/${snapshot.username}`}>{snapshot.username}</Link></td>
          </tr>
          <tr>
            <th>Email Address</th>
            <td>{snapshot.email} ({snapshot.emailVerifiedAt ? "verified" : "unverified"})</td>
          </tr>
          <tr>
            <th>Project Title</th>
            <td>{snapshot.title}</td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{getHumanDate(snapshot.createdAt.date)}</td>
          </tr>
          <tr>
            <th>Last Edit</th>
            <td>{getHumanDate(snapshot.lastUpdate.date)}</td>
          </tr>
          {snapshot.details && 
            <tr>
              <th>Link</th>
              <td>{snapshot.details}</td>
            </tr>
          }
        </tbody>
      </StyledTable>
    </>
  )
}
ProjectSnapshot.propTypes = {
  snapshot: PropTypes.object.isRequired
}

export function ReviewReport () {
  useTitle('Admin - Review Safety report')
  const {user} = useContext(LoggedInUserContext)
  const navigate = useNavigate()
  const { code } = useParams()
  const [ isModalOpen, setIsModalOpen ] = useState(false)
  const [ report,setReport] = useState({})
  const [ reportingUser, setReportingUser ] = useState({})
  const [ loading,setLoading ] = useState(false)
  const [ error,setError ] = useState(null)
  function openModal () {
    setIsModalOpen(true)
  }
  function closeModal () {
    setIsModalOpen(false)
  }
  function reportedContentType(reportType, snapshot) {
    // i assume this content type will grow over time
    switch (reportType) {
      case 'Profile':
        return <ProfileSnapshot snapshot={snapshot} />;

      case 'Project':
        return <ProjectSnapshot snapshot={snapshot} />;
    }
  }
  useEffect(() => {
      (async () => {
        try {
          setLoading(true)
          const respReport = await api.get(`report/${code}`)
          setReport(respReport.data)
          const respReportingUser = await api.get(respReport.data.reported_by_user.replace('api/',''));
          setReportingUser(respReportingUser.data)
        } catch (e) {
          if (e.status == '403') { // ope not authorized
            navigate('/')
          } else if (e.status == '404') { // report code is bad
            setError(`Error while fetching information.`)
          }
          console.error(e)
        } finally {
          setLoading(false)
        }
      })()
  }, [code,navigate])
  if(loading) {
    return <Page>
      <Notices />
      <Loading />
    </Page>
  } else if (error) {
    return (
      <Page>
        <ErrorContainer>{error}</ErrorContainer>
      </Page>
    )
  } else {
    return (
      <Page>
        <ContentContainer>
          <ContentBlock>
            <h1>Review Report</h1>
            <p>Hello, {user.username}! The following report { report.reviewed_at ? 'has been reviewed' : 'is waiting for review'}.</p>
            <h2>Report Information</h2>
            <StyledTable>
              <tbody>
                <tr>
                  <th>Reported Content</th>
                  <td>{report.type}</td>
                </tr>
                <tr>
                  <th>Report Time</th>
                  <td>{getHumanDate(report.created_at)}</td>
                </tr>
                <tr>
                  <th>Reporting User</th>
                  <td><Link to={`/profile/${reportingUser.username}`}>{reportingUser.username}</Link></td>
                </tr>
                <tr>
                  <th>Report Reason</th>
                  <td>{report.reason}</td>
                </tr>
                <tr>
                  <th>Additional Details</th>
                  <td>{report.details}</td>
                </tr>
              </tbody>
            </StyledTable>
            <Button onClick={openModal}>View Reported Content</Button>
            <h2>Admin Action</h2>
            {report.reviewed_at  ? <ReportComplete report={report} user={user} /> : <ReportInProgress report={report} admin={user} />}
          </ContentBlock>
        </ContentContainer>
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={ModalStyle} contentLabel="Details of Report Content">
          <ModalCloseButton onClick={closeModal}>&#215;</ModalCloseButton>
          <p>This snapshot was taken when the report was created. It may not reflect the user&apos;s current {report.type && report.type.toLowerCase()} information.</p>
          {reportedContentType(report.type,report.snapshot)}
        </Modal>
      </Page>
    )
  }
}

/*

A User Report: 

http://frontend.quest-tracker.lndo.site/admin/report/01JCXWWGEJ13RKZRNJVPJP1AHT

A Project Report: 

http://frontend.quest-tracker.lndo.site/admin/report/01JCXXHGCAK1JWNRHZZZ9SQRQX

*/