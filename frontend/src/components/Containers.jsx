import { useMemo } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import wave from '../assets/wave.svg'
import waveRaw from '../assets/wave.svg?raw'
import {TextTimestamp, numberWithCommas} from './TextTransforms'

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
  width: 90%;
  background-color: #FFDCD3;
  margin: 10px 0;
  border: 1px solid #EA846A;
  border-radius: 3px;
  padding: 10px;
  max-height: 200px;
  max-width: 100%;
  color: #333;
  overflow: hidden;
`

const PaginationDiv = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 10px 0;
  padding: 10px;
  max-height: 200px;
  max-width: 100%;
  color: #333;
  text-align: center;
  overflow: hidden;
  .arrowButton, ul.pageNumbers li {
    user-select: none;
    display: inline-block;
    text-align: center;
    height: 2rem;
    line-height: 2rem;
    width: 2rem;
    border: 1px solid #ccc;
    &:not([data-current-page=true]):hover {
      cursor: pointer;
      background-color: #b83a14;
      color: #fff;
    }
  }
  ul.pageNumbers {
    flex-grow: 2;
    list-type: none;
    margin: 0;
    padding: 0;
    display: inline-block;
    li {
      margin: 0 0.25rem;
      &[data-current-page=true] {
        background-color: #f7b284;
        border: 1px solid #b83a14;
        font-weight: bold;
      }
    }
  }
`

const FeedEntryBlock = styled.div`
  width: 100%;
  .entry_timestamp {
    font-size: 0.8rem;
    color: #b83a14;
    font-style: italic;
  }
  p {
    margin-top: 0;
  }
  a {
    text-decoration: none;
    color: #4f72c0;
    &:hover {
      text-decoration: underline;
      color: #638ff0;
    }
  }
`

export const SuccessContainer = styled.div`
  width: 100%;
  background-color: #ddffd3;
  margin: 10px 0;
  border: 1px solid #1c8c0e;
  border-radius: 3px;
  padding: 10px;
  color: #333;
`
export const NeutralContainer = styled.div`
  width: 100%;
  margin: 10px 0;
  border: 1px solid #838686;
  border-radius: 3px;
  padding: 10px;
  color: #333;
`

export const WarningContainer = styled.div`
  background-color: #F4F1ED;
  color: #D7722C;
  width: 100%;
  margin: 10px 0;
  border: 1px solid #D7722C;
  border-radius: 3px;
  padding: 5px;
  color: #333;
`

export const ContentContainer = styled.div`
  background-color: #FAFAFA;
  border-top: 1px solid #EBEBEB;
  border-bottom: 1px solid #EBEBEB;
  min-width: 100vw;
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
export function ErrorContainer({error, children}) {
  if(!error) {
    if(!children) {
      return <ErrorContainerDiv>Unknown error</ErrorContainerDiv>
    } else {
      return <ErrorContainerDiv>{children}</ErrorContainerDiv>
    }
  } else {
    return <ErrorContainerDiv><strong>{error.name ? `Error (${error.name})` : 'Error'}:</strong> {error.message ? error.message : JSON.stringify(error)}</ErrorContainerDiv>
  }
}
ErrorContainer.propTypes = {
  error: PropTypes.object,
  children: PropTypes.node,
}

export function PaginationContainer({hydraPageInfo, getNextPage, children}) { 
  // getNextPage only has one parameter: url for the flip
  // hydra pagination gives us the first page [hydra:first], last page [hydra:last], and next page [hydra:next]
  // current page is @id
  // it DOESN'T give us total pages in a simple way I'd hope so. my solution to keep this pagination container general is stupid
  // and that solution is regex
  // the smarter solution that i'd like to revisit later is an eventlistener to serialize/manage the page data so it just comes to just nicer
  const currentApiUrl = hydraPageInfo['@id'].match(/\/api\/(.*)\?page=\d*/)[1];
  const currentPage = Number(hydraPageInfo['@id'].match(/.*\?page=(\d*)/)[1]);
  const allPages = []
  const lastPageNumber = (hydraPageInfo['hydra:last'].match(/.*\?page=(\d*)/)[1]);
  for (var i = 0; i < lastPageNumber; i++) {
    allPages.push(i+1)
  }
  const pageButtons = allPages.map((pg) => { return <li key={`pageButton${pg}`} onClick={() => { if (pg !== currentPage) { getNextPage(`${currentApiUrl}?page=${pg}`) }}} data-current-page={pg === currentPage}>{pg}</li>})
  // the other problem to solve: hydra gives us back our API URLs with the /api in them, which we've already accounted for. 
  return (
    <>
    <PaginationDiv>
    {hydraPageInfo['hydra:previous'] ? <span className="arrowButton" onClick={() => {getNextPage(hydraPageInfo['hydra:previous'].replace('/api/',''))}}>&lt;</span> : <i>&nbsp;</i> }
    <ul className="pageNumbers">
    {pageButtons}
    </ul>
    {hydraPageInfo['hydra:next'] ? <span className="arrowButton" onClick={() => {getNextPage(hydraPageInfo['hydra:next'].replace('/api/',''))}}>&gt;</span> : <i>&nbsp;</i> }
    </PaginationDiv>
    {children}
    </>
  )
}
ErrorContainer.propTypes = {
  hydraPageInfo: PropTypes.object,
  getNextPage: PropTypes.func
}

export function ProjectUpdateContainer ({update,isMyProject,includeTitle=true}) {
  try {
    let timestamp = <TextTimestamp datetime={update.created_at} />
    let label = update.update_type == 'new' ? 'created': `${update.details.verb} ${numberWithCommas(update.details.value)} ${update.details.unit}`;
    if (includeTitle && label !== 'new') {
      label += " to"
    }
    return <FeedEntryBlock>
      <span className="entry_timestamp">{timestamp}</span>
      <p>
        {isMyProject ? "You" : <a href={`/profile/${update.username}`} title={`${update.username}'s profile`}>{update.username}</a>}
        &nbsp;{label}
        {includeTitle ?
          <>&nbsp; &#8220;<b><a href={`/project/view/${update.project_code}`}>{update.project_title}</a></b>.&#8221;</>
          :
          <>.</>
        }
      </p>
    </FeedEntryBlock>
  } catch (error) {
    // this is for "huh there's no updates for this project", which is usually an error
    // since this function doesn't have all the project data, just returning nothing
    return null;
  }
}

ProjectUpdateContainer.propTypes = {
  update: PropTypes.object,
  isMyProject: PropTypes.bool
}