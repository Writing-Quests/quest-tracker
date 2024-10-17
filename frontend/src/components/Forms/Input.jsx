import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledTextInput = styled.input`
  width: 100%;
  font-size: 16px;
  padding: 0;
  position: relative;
  background: transparent;
  border: none;
  &:focus {
    outline: none;
  }
  &[readonly] {
    cursor: not-allowed;
  }
`

const StyledTextarea = styled.textarea`
  width: 100%;
  font-size: 16px;
  padding: 0;
  position: relative;
  background: transparent;
  border: none;
  margin-top: 6px;
  margin-bottom: 2px;
  &:focus {
    outline: none;
  }
`

const Label = styled.label`
  border: 1px solid #C0C0C0;
  border-radius: 3px;
  background-color: white;
  padding: 10px 5px;
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.01rem;
  color: #333;
  &:focus-within {
    z-index: 1;
    outline: 2px solid rgba(0,0,0,0.5);
    color: black;
  }
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &[readonly] {
    cursor: not-allowed;
    filter: brightness(0.8);
  }
`

const CTAButton = styled.button`
  width: 100%;
  padding: 15px 0;
  margin-top: 6px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  border-bottom: 2px solid black;
  cursor: pointer;
  position: relative;
  transition: all 0.15s;
  margin-bottom: 2px;
  top: 0;
  text-shadow: -1px 1px 0 black;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:not([disabled]):hover {
    border-bottom-width: 4px;
    top: -2px;
    background-color: #353535;
    margin-bottom: 0;
  }
  &:not([disabled]):active {
    border-bottom-width: 2px;
    top: 0;
    background-color: #252525;
    margin-bottom: 2px;
  }
`

const OutlineButton = styled.button`
  width: 100%;
  padding: 15px 0;
  margin-top: 6px;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:not([disabled]):hover {
    background-color: rgba(255, 255, 255, 0.1);
    outline: 1px solid white;
  }
  &:not([disabled]):active {
    background-color: rgba(255, 255, 255, 0.15);
    outline: 2px solid #252525;
  }
`

const NormalButton = styled.button`
  padding: 15px 20px;
  margin-top: 6px;
  background-color: transparent;
  color: #333;
  border: none;
  background-color: #e5e5e5;
  border-radius: 3px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:hover {
    background-color: #d5d5d5;
  }
`

const LinkButton = styled.button`
  width: 100%;
  padding: 15px 0;
  margin-top: 6px;
  background-color: transparent;
  color: white;
  border: none;
  font-weight: normal;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &[disabled]{
    cursor: not-allowed;
    opacity: 0.75;
  }
  &:not([disabled]):hover {
    text-decoration: underline;
  }
`

function TextareaInput({elStyle, label, ...props}) {
  return <Label style={elStyle} disabled={props.disabled}>
    <span style={{position: 'relative', top: '-4px'}}>{label}</span>
    <StyledTextarea {...props}></StyledTextarea>
  </Label>
}
TextareaInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
}

function TextInput({elStyle, label, ...props}) {
  return <Label style={elStyle} disabled={props.disabled} readOnly={props.readOnly}>
    <span style={{position: 'relative', top: '-4px'}}>{label}</span>
    <StyledTextInput {...props} />
  </Label>
}
TextInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
  disabled: PropTypes.bool,
}

// eslint-disable-next-line no-unused-vars
function ButtonInput({elStyle, label: _,...props}) {
  return <CTAButton as="input" style={elStyle} {...props} />
}
ButtonInput.propTypes = {
  elStyle: PropTypes.object,
  label: PropTypes.string,
}

export default function Input({grouped, firstInGroup, lastInGroup, ...props}) {
  const elStyle = {}
  if(grouped) {
    if(firstInGroup) {
      elStyle.borderBottomRightRadius = 0
      elStyle.borderBottomLeftRadius = 0
      elStyle.borderBottom = 'none'
    } else if (lastInGroup) {
      elStyle.borderTopLeftRadius = 0
      elStyle.borderTopRightRadius = 0
    } else {
      elStyle.borderRadius = 0
      elStyle.borderBottom = 'none'
    }
  }
  switch (props.type) {
    case 'submit':
      return <ButtonInput elStyle={elStyle} {...props} />
    case 'textarea':
      return <TextareaInput  elStyle={elStyle} {...props} />
    case 'text':
    case 'password':
    case 'email':
    default:
      return <TextInput elStyle={elStyle} {...props} />
  }
}

Input.propTypes = {
  label: PropTypes.string,
  grouped: PropTypes.bool,
  firstInGroup: PropTypes.bool,
  lastInGroup: PropTypes.bool,
  type: PropTypes.string.isRequired,
}

export function Button({type, ...props}) {
  switch(type) {
    case 'outline':
      return <OutlineButton {...props} />
    case 'cta':
      return <CTAButton {...props} />
    case 'link':
      return <LinkButton {...props} />
    default:
    case 'normal':
      return <NormalButton {...props} />
  }
}
Button.propTypes = {
  type: PropTypes.string,
}
