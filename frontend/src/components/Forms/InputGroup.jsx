import { Children, cloneElement } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const StyledInputGroup = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`

export default function InputGroup({children}) {
  const maxIndex = Children.count(children)-1
  return <StyledInputGroup>
    {Children.map(children, (child, i) =>
      cloneElement(child, {
        grouped: Boolean(maxIndex),
        firstInGroup: (i === 0),
        lastInGroup: (i === maxIndex),
      })
    )}
  </StyledInputGroup>
}

InputGroup.propTypes = {
  children: PropTypes.node.isRequired,
}
