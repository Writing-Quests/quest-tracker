import styled from 'styled-components'
import { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal'
import Input, { Button } from './Forms/Input'
import { ErrorContainer } from './Containers'
import api from '../services/api'

export const ModalStyle = {
  content: {
    top: '10%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -10%)',
    backgroundColor: 'white',
    height: '90%',
    width: '90%',
    padding: '15px',
    marginTop: '6px',
    border: '2px solid rgba(0,0,0,0.5)',
    borderRadius: '3px',
    fontSize: '1rem',
    transition: 'all 0.15s'
  }
}

export const ModalCloseButton = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 2rem;
  cursor: pointer;
  &:hover {
    color: #E77425;
  }
`

export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: space-between;
  align-items: stretch;
  height: calc(100% - 160px);
  div:has(.mdxeditor-root-contenteditable) {
     flex-grow: 2;
    .mdxeditor-root-contenteditable {
      height: 100%;
    }
  }
`

const CloseModalConfirmationBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2rem;
  font-size: 1.4rem;
  background-color: white;
  justify-content: flex-start;
  gap: 10px;
  flex-direction: column;
`

export function DirectMessageModal({ isDmModalOpen, setIsDmModalOpen, isReply, fromUserId, ...props }) {
  const [submitWait, setSubmitWait] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [pendingCloseModal, setPendingCloseModal] = useState(false)
  const confirmedCloseModal = useRef()
  const characterCountLabel = useRef()
  const messageContent = useRef(null)

  let modalTitle = 'Send a New Message'
  if (isReply) {
    modalTitle = `Reply to ${props.thread.other_user_details.username}`
  }

  async function sendDirectMessage() {
    let message_details = {
      "from_user_id": fromUserId,
      "content": messageContent.current
    }
    if (isReply) { // we would have passed the details, re: who is the DM
      message_details = {
        ...message_details,
        'to_user_id': props.toUserId,
        'message_thread': `/api/messages/details/${props.thread.code}`
      }
    } else {
      message_details = {
        ...message_details,
        "subject": document.querySelector('#threadSubject').value,
        'to_user_id': (props.hasOwnProperty('toUserId') ? props.toUserId : Number(document.querySelector('#receiving_user_id').value))
      }
    }
    let resp = await api.post(`/messages/send`, message_details)
    return resp.status;
  }

  function closeModal() {
    if (confirmedCloseModal.current || characterCountLabel.current == 0) {
      setIsDmModalOpen(false)
      characterCountLabel.current = 0
      confirmedCloseModal.current = false // back to false after the single modal close event
    } else {
      setPendingCloseModal(true)
    }
  }

  function checkCharacterCount(markdown) {
    characterCountLabel.current = (markdown.length)
    if (characterCountLabel.current > 4000) {
      setSendError(`Messages cannot exceed 4000 characters. Your message is currently ${characterCountLabel.current}`)
    } else if (characterCountLabel.current < 4000 && sendError !== null) {
      setSendError(null)
    }
    messageContent.current = markdown
  }

  useEffect(() => {
    if (isDmModalOpen) {
      setPendingCloseModal(false)
      confirmedCloseModal.current = false
    } else { // clear error state after close
      setSendError(null)
    }
  }, [isDmModalOpen])

  return <Modal id="directMessageModal" isOpen={isDmModalOpen} onRequestClose={closeModal} style={ModalStyle} contentLabel={modalTitle}>
    <ModalCloseButton onClick={closeModal}>&#215;</ModalCloseButton>
    <h2>{modalTitle}</h2>
    {sendError !== null &&
      <ErrorContainer>{sendError}</ErrorContainer>
    }
    <ModalForm onSubmit={(async (e) => {
      e.preventDefault()
      setSubmitWait(true)
      let messageSent = await sendDirectMessage()
      if (messageSent == 201) {
        confirmedCloseModal.current = true
        closeModal()
        if (props.doAfterMessageSent && props.availableToDm) {
          props.doAfterMessageSent();
        } else {
          props.doAfterMessageSent(true, 'Message sent!')
        }
      } else {
        setSendError('Unable to send message.')
      }
      setSubmitWait(false)
    })}>
      {(!isReply && !props.toUserId) &&
        <>
          <Input type="select" required={true} label="Send Message To..." id="receiving_user_id">
            <option value=""></option>
            {props.availableToDm}
          </Input>
        </>
      }
      {!isReply &&
        <Input required={true} id="threadSubject" type="text" label="Subject" />
      }
      <Input type="markdown" label={`Message (4000 characters)`} onChange={(markdown) => checkCharacterCount(markdown)} />
      <Input type="submit" value={submitWait ? "Sending..." : "Send"} disabled={submitWait} />
    </ModalForm>
    <CloseModalConfirmationBox style={{ 'zIndex': 88, "display": (pendingCloseModal ? 'flex' : 'none') }}>
      <p>You have an unsent reply. Do you really want to close this window?</p>
      <Button onClick={() => {
        setPendingCloseModal(false)
        confirmedCloseModal.current = false
      }}>Cancel</Button>
      <Button onClick={() => {
        confirmedCloseModal.current = true
        closeModal()
      }} style={{ 'backgroundColor': '#a63412', 'color': 'white' }}>Close Modal</Button>
    </CloseModalConfirmationBox>
  </Modal>
}