/*
* TODO OVERALL:
*  - pagination of messages is not tested; modded from notification reloads. 
*  - in the future I would like to set up polling for both new messages on the inbox page and new messages on the thread page
*/
/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ContentContainer, ContentBlock, ErrorContainer, NeutralContainer, WarningContainer } from "../Containers"
import { MarkdownBlock, TextTimestamp } from "../TextTransforms"
import styled from "styled-components"
import context from "../../services/context"
import Page from "../Page"
import Loading, { LoadingInline } from "../Loading"
import api from "../../services/api"
import Input, { Button } from "../Forms/Input"
import { DirectMessageModal } from "../Modal"

const { LoggedInUserContext } = context

const MessageList = styled.div`
  width: 100%;
  border: 1px solid #ccc;
  padding: 0;
  cursor: pointer;
  ul.info, ul.actions {
    list-style-type: none;
    padding: 5px 10px;
    margin: 0;
    display: flex;
    align-items: end;
    gap: 5px;
    font-size: 0.9rem;
  }
  ul.actions {
    justify-content: flex-end;
    li {
      position: relative;
      display: inline-block;
      width: 35px;
      height: 35px;
      margin-top: 0.5rem;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 25px;
      cursor: pointer;
      &:hover {
        opacity: 1;
        svg path {
            fill: #E77425;
        }
        &:before {
          display: block;
        }
      }
      &:before {
        z-index: 88; /* over everything else, under the dropdowns (if it comes up) */
        content: attr(data-tooltip);
        top: calc(100%);
        right: 0;
        min-width: 20ch;
        text-align: center;
        background-color: #FAFAFA;
        border: 1px solid #EBEBEB;
        border-radius: 3px;
        padding: 10px;
        color: #333;
        position: absolute;
        display: none;
        opacity: 1;
        filter: drop-shadow(2px 2px 1px #ccc);
      }
    }
  }
  ul.info {
    justify-content: flex-start;
    .most_recent_timestamp {
      font-size: 0.8rem;
      font-style: italic;
      opacity: 0.8;
      display: block;
      text-align: left;
      flex-grow: 2;
    }
    .most_recent_direction {
      font-style: italic;
    }
  }
  .single_message:not(:last-child) {
    border-bottom: 1px solid #ccc;
  }
  .unread_message {
    background-color: #2f8e19;
    color: #fff;
    font-weight: bold;
  }
  .read_message {
    .most_recent_message_preview, ul.info, .subject {
      opacity: 0.7;
    }
  }
  .archived {
    .most_recent_message_preview, ul.info, .subject {
      opacity: 0.4;
    }
  }
  .most_recent_message_preview {
    display: block;
    margin: 0;
    padding: 0 10px;
    font-size: 0.9rem;
    height: 4rem;
    line-height: 1.1rem;
    overflow: hidden;
  }
  .subject {
    display: block;
    width: 100%;
    padding: 0 10px;
    margin: 0;
    font-size: 1.05rem;
  }
`

const MessageThread = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  gap: 5px;
  .msg {
    display: block;
    width: 85%;
    padding: 0;
    margin: 5px 0;
    word-wrap: break-word;
    .msgdata {
      margin: 0;
      margin-top: 10px;
      font-size: 0.8rem;
      text-align: left;
      opacity: 0.7;
    }
    &.mine {
      align-self: flex-end;
      .msgdata {
        text-align: right;
      }
    }
  }
`

/* STILL TODO: 
- visual tweaks
- put some sort of "change pending" when moving a message
*/

export function SingleMessageThread() {
  const { messageCode } = useParams()
  const { user } = useContext(LoggedInUserContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [threadDetails, setThreadDetails] = useState()
  const [messages, setMessages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  useEffect(() => {
    (async () => {
      try {
        if (user) {
          await loadAllThreadMessages({ 'messageCode': messageCode, 'setMessages': setMessages, 'setThreadDetails': setThreadDetails })
        }
      } catch (err) {
        console.log(err)
        setError(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  async function loadAllThreadMessages() {
    setLoadingMessages(true)
    const resp = await api.get(`/messages/read/${messageCode}`)
    if (!threadDetails) {
      setThreadDetails(resp.data?.thread)
    }
    setMessages(resp.data?.messages["hydra:member"])
    setLoadingMessages(false)
  }

  function SingleMessageView({ message }) {
    const otherUsername = (threadDetails.hasOwnProperty('other_user_details') ? threadDetails.other_user_details.username : "[unknown user]")
    const sideClass = (message.from_user_id == user.id ? "mine" : "")
    const username = (message.from_user_id == user.id ? "you" : otherUsername)
    const style = {
      "backgroundColor": "#ffc3b2",
      "padding": "0.25rem 0.75rem",
      "borderRadius": "0 10px 10px 0"
    }
    if (sideClass == "mine") {
      style.borderRadius = "10px 0 0 10px"
      style.backgroundColor = "#c0c0c0"
    }
    return <>
      <div className={`msg ${sideClass}`}>
        <div className="msgdata">[<TextTimestamp datetime={message.sent_at} />] {username}</div>
        <MarkdownBlock key={message.id}  style={style}>{message.message_content}</MarkdownBlock>
      </div>
    </>
  }
  if (loading || !user) { return <Loading /> }
  if (error) {
    return <Page>
      <ContentContainer>
        <ErrorContainer><p>Error loading messages.</p></ErrorContainer>
      </ContentContainer>
    </Page>
  }
  else {
    return <Page>
      <ContentContainer>
        <ContentBlock>
          <Link to="/messages">&larr; back to messages</Link>
        </ContentBlock>
        <ContentBlock style={{ 'fontSize': '1.2rem', 'fontWeight': 'bold', "position": "relative", "marginBottom": "10px" }}>
          <b>{threadDetails.hasOwnProperty('other_user_details') ? threadDetails.other_user_details.username : "Unknown User"}</b>: {threadDetails.subject}
          {threadDetails.reply_available &&
            <Button type="small" onClick={() => { setIsModalOpen(true) }} style={{ 'display': "block", "position": "absolute", "top": "0", "right": "10px" }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 19v-4q0-1.25-.875-2.125T16 12H6.825l3.6 3.6L9 17l-6-6l6-6l1.425 1.4l-3.6 3.6H16q2.075 0 3.538 1.463T21 15v4z" /></svg> Reply</Button>
          }
        </ContentBlock>
        <ContentBlock>
          <MessageThread>
            {messages &&
              messages.map((msg) => {
                if (!msg.seen_at && msg.to_user_id == user.id) { // it's a message to me that i have not seen yet
                  api.patch(`/messages/update/${msg.id}`, { 'seen_at': (new Date) })
                }
                return <SingleMessageView message={msg} thread={threadDetails} />
              })
            }
          </MessageThread>
        </ContentBlock>
      </ContentContainer>
      {threadDetails.reply_available &&
        <DirectMessageModal isDmModalOpen={isModalOpen} setIsDmModalOpen={setIsModalOpen} isReply={true} fromUserId={user.id} toUserId={threadDetails.other_user_details.id} thread={threadDetails} doAfterMessageSent={loadAllThreadMessages} />
      }
    </Page >
  }
}

export function UserMessageBox() {
  const { user } = useContext(LoggedInUserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messageThreads, setMessageThreads] = useState([])
  const [availableToDm, setAvailableToDm] = useState([])
  const [showArchived, setShowArchived] = useState(false)
  const [hasArchived, setHasArchived] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false)
  const lastInboxPage = useRef()
  const onInboxPage = useRef()
  const [isModalOpen, setIsModalOpen] = useState(false)

  function MessageThreadPreview({ thread, user }) {
    const otherUsername = (thread.hasOwnProperty('other_user_details') ? thread.other_user_details.username : "[unknown user]")
    const from_user = (thread.most_recent_message.from_user_id == user.id ? "you" : otherUsername)
    const to_user = (from_user == "you" ? otherUsername : "you")
    const preview = thread.most_recent_message.message_content.substring(0, 250)
    const read_status = (thread.unread_for_me ? "unread_message" : "read_message")
    const archive_status = (thread.in_my_inbox ? "inbox" : "archived")

    return (
      <div key={thread.code} className={`single_message ${read_status} ${archive_status}`}>
        <ul className="info">
          <li className="most_recent_timestamp"><TextTimestamp datetime={thread.last_message_sent_at} /></li>
          <li className="most_recent_direction">{from_user} &gt; {to_user}</li>
        </ul>
        <span className="subject" onClick={() => { navigate(`/message/${thread.code}`) }}>{thread.subject}</span>
        <div className="most_recent_message_preview" onClick={() => { navigate(`/message/${thread.code}`) }}><MarkdownBlock>{preview}</MarkdownBlock></div>
        <ul className="actions">
          {archive_status == "inbox" ?
            <li onClick={() => moveMessage({ 'thread': thread, 'toLocation': 'archive' })} data-tooltip="Move to Archive" className={archive_status}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h16l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004zm9 11v-4h-2v4H8l4 4l4-4zm6.764-7l-1-2H5.237l-1 2z" /></svg></li>
            :
            <li onClick={() => moveMessage({ 'thread': thread, 'toLocation': 'inbox' })} data-tooltip="Move to Inbox" className={archive_status}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m20 3l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004L4 3zm-8 7l-4 4h3v4h2v-4h3zm6.764-5H5.236l-.999 2h15.527z" /></svg></li>
          }
          <li onClick={() => { navigate(`/message/${thread.code}`) }} data-tooltip="View This Message" className="open"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2.243 6.854L11.49 1.31a1 1 0 0 1 1.028 0l9.24 5.545a.5.5 0 0 1 .242.429V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.283a.5.5 0 0 1 .243-.429M4 8.133V19h16V8.132l-7.996-4.8zm8.06 5.565l5.296-4.463l1.288 1.53l-6.57 5.537l-6.71-5.53l1.272-1.544z" /></svg></li>
        </ul>
      </div>
    )
  }

  async function moveMessage({ thread, toLocation }) {
    try {
      const inboxStatus = (toLocation == "inbox" ? true : false)
      const field = (thread.am_i_original_sender ? 'in_sender_inbox' : 'in_recipient_inbox')
      const data = {}
      data[field] = inboxStatus;
      let resp = await api.patch(`/inbox/update/${thread.code}`, data)
      if (resp.status == 200) {
        let currentThreads = [...messageThreads]
        const thisThread = currentThreads.find(
          a => a.code === thread.code
        )
        thisThread.in_my_inbox = inboxStatus
        setMessageThreads(currentThreads)
      } else {
        setError('Unable to move your message. Please refresh and try again, or reach out to support for assistance.')
      }
    } catch (err) {
      setError(err)
    }
  }

  async function loadMoreMessages() {
    setLoadingMoreMessages(true)
    onInboxPage.current++;
    const resp = await api.get(`/messages/mine?page=${onInboxPage.current}`)
    setNotifications(messageThreads.concat(resp.data['hydra:member']))
    if (onInboxPage.current == lastInboxPage.current) {
      setHasMoreMessages(false)
    }
    setLoadingMoreMessages(false)
  }

  async function loadMessageThreads() {
    setLoadingMoreMessages(true)
    const resp = await api.get("/messages/mine");
    if (resp.data.hasOwnProperty('hydra:view')) {
      setHasMoreMessages(true)
      onInboxPage.current = 1;
      lastInboxPage.current = resp.data['hydra:view']['hydra:last'].match(/.*\?page=(\d*)/)[1];
    }
    setMessageThreads(resp.data["hydra:member"].map((t) => { return t[0]; })) // see note in UserInboxProvider ¯\_(ツ)_/¯ 
    setLoadingMoreMessages(false)
  }

  useEffect(() => {
    (async () => {
      try {
        if (user) {
          const resp_dms = await api.get("/connection/mutual/dm");
          setAvailableToDm(resp_dms.data?.['hydra:member'].map((u) => <option key={u.id} value={u.id}>{u.username}</option>))
          loadMessageThreads();
        }
      } catch (err) {
        console.log(err)
        setError(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  useEffect(() => {
    const hasArchivedThreads = messageThreads.find(
          a => a.in_my_inbox === false
        )
        setHasArchived((hasArchivedThreads ? true : false))
  }, [messageThreads])

  if (loading || !user) { return <Loading /> }
  if (error && messageThreads.length == 0) { // there's an error and we have no threads
    return <Page>
      <ContentContainer>
        <ErrorContainer><p>Error loading your inbox.</p><p>{error}</p></ErrorContainer>
      </ContentContainer>
    </Page>
  }
  else {
    return <Page>
      <ContentContainer>
        {error &&
          <ErrorContainer>{error}</ErrorContainer>
        }
        <ContentBlock>
          <div style={{ "width": "100%", "position": "relative", "marginBottom": "1.5rem" }}>
            <h1>Messages</h1>
            {user.allow_dms ? // if a user doesn't have open DMs, they can't send 'em either
              <Button style={{ display: "block", margin: "auto", "position": "absolute", "top": "0", "right": "0" }} onClick={() => { setIsModalOpen(true) }}>+ New Message</Button>
              :
              <WarningContainer>You have disabled direct messages. You cannot send or receive messages from buddies unless you enable this setting.</WarningContainer>
            }
          </div>
          {messageThreads &&
            <MessageList>

              {loadingMoreMessages && <LoadingInline text="Loading your messages..." />}
              {messageThreads.map((thread) => {
                if (thread.in_my_inbox || showArchived) {
                  return <MessageThreadPreview thread={thread} user={user} messageThreads={messageThreads} />
                }
              })}
            </MessageList>
          }
          <div style={{ "width": "text", "display": "flex", "justifyContent": "space-between", "alignContent": "center", "marginTop": "1rem" }}>
            {hasMoreMessages ?
              <Button onClick={() => { loadMoreMessages() }}>{loadingMoreMessages ? <LoadingInline /> : "Load More Messages"}</Button>
              :
              <span>&nbsp;</span> /* to keep the archive messages button on the right */
            }
            { hasArchived && /* only display this button if the user _has_ archived threads */
              <Button onClick={() => { setShowArchived(!showArchived) }}>{showArchived ? "Hide Archived Messages" : "Show Archived Messages"}</Button>
            }
          </div>
        </ContentBlock>
      </ContentContainer>
      <DirectMessageModal isReply={false} isDmModalOpen={isModalOpen} setIsDmModalOpen={setIsModalOpen} fromUserId={user.id} availableToDm={availableToDm} doAfterMessageSent={loadMessageThreads} />
    </Page>
  }
}