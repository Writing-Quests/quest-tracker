import { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'

export default function InputGroup({children}) {
  const maxIndex = Children.count(children)-1
  return <>
    {Children.map(children, (child, i) =>
      cloneElement(child, {
        grouped: Boolean(maxIndex),
        firstInGroup: (i === 0),
        lastInGroup: (i === maxIndex),
      })
    )}
  </>
}

InputGroup.propTypes = {
  children: PropTypes.node.isRequired,
}
