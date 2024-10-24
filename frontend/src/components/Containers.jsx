import styled from 'styled-components'
import PropTypes from 'prop-types'
import wave from '../assets/wave.svg'

export const AnimatedContainer = styled.div`
  margin-top: 40px;
  background-color: var(--color-primary);
  position: relative;
  padding-bottom: 30px;
  &::before {
    content: '';
    display: block;
    background-image: url("${wave}");
    background-position: '0 0';
    background-repeat: repeat-x;
    width: 100vw;
    height: 20px;
    position: relative;
    top: -20px;
  }
  &::after {
    content: '';
    background-image: url("${wave}");
    display: block;
    background-repeat: repeat-x;
    width: 100vw;
    height: 20px;
    transform: rotate(180deg);
    position: absolute;
    bottom: -20px;
  }
`

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
  display: flex;
  justify-content: center;
`

export const ContentBlock = styled.div`
  margin: 0 20px 0 20px;
  max-width: 1500px;
  flex: 1;
`
