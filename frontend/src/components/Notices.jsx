import { useLocation } from 'react-router-dom'
import { ErrorContainer, SuccessContainer } from './Containers'

export default function Notices() {
  const location = useLocation()
  const notices = location?.state?.notices
  if(!notices?.length) { return null }
  const noticeComponents = location.state.notices.map(notice => {
    switch(notice.type) {
      case 'error':
        return <ErrorContainer>{notice.text}</ErrorContainer>
      default:
      case 'success':
        return <SuccessContainer>{notice.text}</SuccessContainer>
    }
  })
  return <>
    {noticeComponents.map((c, i) => <div key={i}>{c} </div>)}
  </>

}
