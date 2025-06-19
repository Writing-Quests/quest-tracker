import styled from 'styled-components'
import PropTypes from 'prop-types'

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const InlineLoadingContainer = styled(LoadingContainer)`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
  margin: 15px 0;
`

const LoadingText = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: ${({$inline}) => $inline ? '0' : '10px'};
`

// set the loading container to full width to stop the menu from changing sizes on us during loading - ashley
export default function Loading({inline, text='Loading', fullPage}) {
  const size = inline ? 46 : 96;
  const Container = inline ? InlineLoadingContainer : LoadingContainer;
  if(fullPage) {
    return <div style={{height: '100%', display: 'flex', 'width': '100%'}}>
      <Loading inline={inline} text={text} />
    </div>
  }
  return <Container style={{'width': '100dvw'}}>
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"><g fill="none" stroke="#aaa" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path strokeDasharray={16} strokeDashoffset={16} d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="16;0"></animate><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform></path><path strokeDasharray={64} strokeDashoffset={64} strokeOpacity={0.3} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.2s" values="64;0"></animate></path></g></svg>
    <LoadingText $inline={inline}>{text}&hellip;</LoadingText>
  </Container>
}
Loading.propTypes = {
  inline: PropTypes.bool,
  text: PropTypes.string,
  fullPage: PropTypes.bool,
}
