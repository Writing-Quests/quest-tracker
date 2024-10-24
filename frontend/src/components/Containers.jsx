import { useMemo } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import wave from '../assets/wave.svg'
import waveRaw from '../assets/wave.svg?raw'


const AnimatedContainerDiv = styled.div`
  margin-top: 40px;
  test: ${props => props.url};
  background-color: ${props => props.color ? props.color : 'var(--color-primary)'};
  position: relative;
  padding-bottom: 30px;
  margin-bottom: 30px;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
  color: white;
  &::before {
    content: '';
    display: block;
    background-image: url("${props => props.url ? props.url : wave}");
    background-position: '0 0';
    background-repeat: repeat-x;
    width: 100vw;
    height: 20px;
    position: relative;
    top: -20px;
  }
  &::after {
    content: '';
    background-image: url("${props => props.url ? props.url : wave}");
    display: block;
    background-repeat: repeat-x;
    width: 100vw;
    height: 20px;
    transform: rotate(180deg);
    position: absolute;
    bottom: -20px;
  }
`

export function AnimatedContainer({color, children, ...props}) {
  const url = useMemo(() => {
    if(!color) { return }
    const d = new DOMParser().parseFromString(waveRaw, 'text/xml')
    d.getElementsByTagName('path')[0].style.fill = color
    return ('data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(d.documentElement)))
  }, [color])
  if(color) {
    return <AnimatedContainerDiv url={url} color={color} {...props}>
      {children}
    </AnimatedContainerDiv>
  } else {
    return <AnimatedContainerDiv {...props}>{children}</AnimatedContainerDiv>
  }
}
AnimatedContainer.propTypes = {
  color: PropTypes.string,
  children: PropTypes.node,
}

export const CenteredContainer = styled.div`
  margin: auto;
  max-width: min(500px, calc(100vw - 40px));
  display: flex;
  flex-direction: column;
`

const ErrorContainerDiv = styled.div`
  width: 100%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
  text-overflow: ellipsis;
  max-height: 200px;
  max-width: 100%;
`

export function ErrorContainer({error, children}) {
  if(!error) {
    if(!children) {
      return <ErrorContainerDiv>Unknown error</ErrorContainerDiv>
    } else {
      return <ErrorContainerDiv>{children}</ErrorContainerDiv>
    }
  } else {
    return <ErrorContainerDiv><strong>{error.name ? error.name : 'Error'}:</strong> {error.message ? error.message : JSON.stringify(error)}</ErrorContainerDiv>
  }
}
ErrorContainer.propTypes = {
  error: PropTypes.object,
  children: PropTypes.node,
}

export const SuccessContainer = styled.div`
  width: 100%;
  background-color: #ddffd3;
  margin: 10px 0;
  border: 1px solid #1c8c0e;
  border-radius: 3px;
  padding: 10px;
`
export const NeutralContainer = styled.div`
  width: 100%;
  margin: 10px 0;
  border: 1px solid #838686;
  border-radius: 3px;
  padding: 10px;
`

export const WarningContainer = styled.div`
  background-color: #F4F1ED;
  color: #D7722C;
  width: 100%;
  margin: 10px 0;
  border: 1px solid #D7722C;
  border-radius: 3px;
  padding: 5px;
`

export const ContentContainer = styled.div`
  background-color: #FAFAFA;
  border-top: 1px solid #EBEBEB;
  border-bottom: 1px solid #EBEBEB;
  width: 100vw;
  padding: 10px 0 10px 0;
  display: grid;
  grid-template-rows: auto;
  justify-items: center;
`

export const ContentBlock = styled.div`
  padding: 0 20px;
  max-width: ${props => props.maxWidth ? props.maxWidth : '700px'};
  width: 100%;
`
