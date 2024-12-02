import useTitle from '../../services/useTitle'
import Page from '../Page'
import { ContentContainer, ContentBlock } from '../Containers'

export function AboutQuesty () {
  useTitle('About the Questing Writing Tracker')
  return (
    <Page>
      <ContentContainer>
        <ContentBlock>
      <h1>About Questy</h1>
      <p>Built by and for writers, Questy is the official writing tracker of <a href="https://www.writingquests.org/framework/" target="_blank" title="Writing Quests Framework at writingquests.org">the Writing Quests Framework</a> The current version supports both writing and editing goals, and allows you to use both words and hours to track your progress.</p>

      <p>Questy is in beta as of November 2024, just in time for the inaugural <a href="https://novelquest.org/" target="_blank" title="Novel Quest at novelquest.org">Novel Quest</a>. The current incarnation supports tracking writing and editing goals, but watch this space for expansion and improvement in 2025!</p>

      <p>Writing Quests is an open-source framework that allows groups to create their own challenges to fit their needs and individual needs. The Questy tracker is managed by <a href="https://www.writingquests.org/get-involved/contributors/" target="_blank" title="Writing Quests contributors list, on writingquests.org">the Writing Quests team</a>.</p>

      <p>Have an idea or running into an issue? Please reach out via our <a href='/feedback' target='_blank' rel='noopener' style={{fontWeight: 'inherit'}}>feedback form!</a>.</p>
      <h2>Get Involved</h2>
      <ul>
        <li><a href="https://writingquests.substack.com/" title="Writing Quests on Substack" target="_blank">Writing Quests Newsletter (Substack)</a></li>
        <li><a href="https://facebook.com/groups/writingquests" target="_blank" title="Writing Quests on Facebook">The Writing Quests Facebook Group</a></li>
        <li><a href="https://www.instagram.com/writingquests" target="_blank" title="Writing Quests on Instagram">Instagram: @writingquests</a></li>
      </ul>
      </ContentBlock>
      </ContentContainer>
    </Page>
  )
}