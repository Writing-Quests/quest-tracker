import PropTypes from 'prop-types'
import styled from 'styled-components'

const TextInput = styled.input`
  width: 100%;
  font-size: 16px;
  padding: 0;
  position: relative;
  background: transparent;
  border: none;
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
`

export default function Input({label, grouped, firstInGroup, lastInGroup, ...props}) {
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
  return <Label style={elStyle}>
    <span style={{position: 'relative', top: '-4px'}}>{label}</span>
    <TextInput {...props} />
  </Label>
}

Input.propTypes = {
  label: PropTypes.string,
  grouped: PropTypes.bool,
  firstInGroup: PropTypes.bool,
  lastInGroup: PropTypes.bool,
}
