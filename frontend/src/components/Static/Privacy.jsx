import styled from 'styled-components'
import { Link } from 'react-router-dom'
import useTitle from '../../services/useTitle'
import Page from '../Page'
import { ContentContainer, ContentBlock } from '../Containers'

const SubText = styled.p`
  margin: 5px 0 10px 0;
  color: #313435;
  font-size: 0.8rem;
`

export function PrivacyPolicy () {
  useTitle('Privacy Policy')
  return (
    <Page>
      <ContentContainer>
        <ContentBlock>
        <h1 style={{marginBottom: '0'}}>Privacy Policy</h1>
        <SubText>Last updated: November 03, 2024</SubText>
        <p>Questy falls under <a href="https://www.writingquests.org/cla-privacy-policy/" target="_blank">the Writing Quests privacy policy</a>. In addition to the details of the overall  policy, Questy has some specific considerations.</p>

        <ul>
          <li>We will not sell your email address or project information.</li>
          <li>Questy uses cookies.</li>
          <li>The Questy Writing Tracker collects your email address and username as required to use our service.
            <ul>
              <li>Your email address is not visible or available to other users on the site, even when your profile is public.</li>
              <li>We will only email you as part of automated email systems to manage your account.</li>
            </ul>
          </li>
          <li>Statistics from public projects (associated with username data) is visible to anyone with a link
             <ul>
             <li>Public project data and usernames are used as part of the Writing Quests community graph project. <b>Private accounts and projects are not included on these graphs.</b></li>
             </ul>
            </li>
          <li>We do not use generative AI tools, nor is your project or personal data used to &quot;teach&quot; any such AI tools.</li>
          <li>Your data as stored in our site database is visible to Writing Quests volunteers with access to our website.</li>
          <li>We cannot account for the content or behavior of third-party links shared on another user&apos;s profile.
            <ul>
              <li>Accounts may be removed from the service for violating the <Link to='/terms'>Terms of Use &amp; Community Values</Link>. This includes content that is used to spam, harrass, or trick other participants.</li>
              <li>Users may report profile and project information that violates these terms and values either directly from a profile or by reaching out directly to <a href="mailto:reports@writingquests.org">reports@writingquests.org</a>. Reports are reviewed by volunteer staff.</li>
            </ul>
          </li>
        </ul>

        <p>Please don&apos;t hesitate to reach out to <a href="mailto:secretary@writingquests.org">secretary@writingquests.org</a> for any questions or clarifications.</p>

        </ContentBlock>
      </ContentContainer>
    </Page>
  )
}