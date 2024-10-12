import styled from 'styled-components'
import wave from '../assets/wave.svg'

export const AnimatedContainer = styled.div`
  min-height: calc(100vh - 250px);
  margin-top: 20px;
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

export const ErrorContainer = styled.div`
  width: 100%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
`

export const SuccessContainer = styled.div`
  width: 100%;
  background-color: #ddffd3;
  margin: 10px 0;
  border: 1px solid #1c8c0e;
  border-radius: 3px;
  padding: 10px;
`
