
import styled from 'styled-components'

export const ModalStyle = {
  content: {
    top: '10%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -10%)',
    backgroundColor: 'white',
    maxHeight: '90%',
    maxWidth: '90%',
    padding: '15px',
    marginTop: '6px',
    border: '2px solid rgba(0,0,0,0.5)',
    borderRadius: '3px',
    fontSize: '1rem',
    transition: 'all 0.15s'
  }
}

export const ModalCloseButton = styled.div`
  float: right;
  font-size: 2rem;
  cursor: pointer;
  &:hover {
    color: #E77425;
  }
`