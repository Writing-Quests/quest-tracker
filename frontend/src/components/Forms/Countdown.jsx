import { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const CountdownContainer = styled.div`
  position: relative;
  width: 98%;
  height: 6px;
  border-radius: 10px;
  background-color: transparent;
  border: 1px solid ${(props) => `${props.color}`};
  margin: 10px auto;
`

const CountdownInner = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 12px;
  background-color: ${(props) => `${props.color}`};
  height: 6px;
  transition: all 1s ease-out;
  width: ${(props) => `${props.percent}%`};
`

export function CountdownBar ({totalTime,closeModal,colorScheme}) {
  const [currentTime,setCurrentTime] = useState(totalTime)
  const [percent,setPercent] = useState(100)
  let barColor = '#F4AC96'
  switch (colorScheme) {
    case 'success':
      barColor = '#1c8c0e'
    break;
  }
  let countdownInterval = setInterval(() => {
    setCurrentTime(currentTime - 1)
    if (currentTime !== -1) {
      setPercent(parseInt((currentTime/totalTime) * 100))
    } else {
      clearInterval(countdownInterval)
      closeModal();
    }
  },1000)
  return <>
    <CountdownContainer color={barColor}>
      <CountdownInner percent={percent} color={barColor} />
    </CountdownContainer>
  </>
}
CountdownBar.propTypes = {
  totalTime: PropTypes.number.isRequired,
  colorScheme: PropTypes.string,
  closeModal: PropTypes.func.isRequired
}