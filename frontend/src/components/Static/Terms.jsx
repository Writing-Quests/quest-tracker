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

export function TermsOfUse () {
  useTitle('Terms of Use & Commmunity Values')
  return (
    <Page>
      <ContentContainer>
        <ContentBlock>
          <h1 style={{marginBottom: '0'}}>Terms of Use &amp; Community Values</h1>
          <SubText>Last updated: November 03, 2024</SubText>
          <p>Please reach out to support@writingquests.org if you have any questions or concerns.</p>

          <h2>Terms of Use</h2>
          
          <h3>Acceptance of Terms</h3>
          
          <p>Your use of Questy is considered an acknowledgement and commitment to the Writing Quests community values and terms of use. If you do not agree to these terms, do not use Writing Quests.</p>

          <h3>Service Description</h3>
          <p>Questy is a platform for writers to engage in tracking their projects for writing or editing (&quot;Service&quot;). The Service may change from time to time at our discretion.</p>

          <h3>User Obligations</h3>
          <p>You agree to use Writing Quests in compliance with all applicable laws and regulations and not to use it for any unlawful purpose. You are responsible for any content you create or share through the Service.</p>

          <p>It is expected that content made available publically on Questy, including user links, profile descriptions, and project names are in accordance with our community guidelines and free from abuse and spam. Profiles in violation of this agreement may be modified.</p>

          <h3>Privacy Policy</h3>
          <p>Your use of Writing Quests is also governed by our <Link to="/privacy">Privacy Policy</Link>, which explains how we collect, use, and protect your personal information.</p>

          <h3>Changes to Agreement</h3>
          <p>We may update these T&Cs from time to time. Your continued use of Writing Quests after posted changes will constitute your acceptance of such changes.</p>

          <h2>Community Values</h2>
          <h3>Non-Discrimination</h3>
          <p>We embrace diversity and ensure an inclusive environment where all writers are treated with respect and dignity.</p>
          <h3>Universal Writing Belief</h3>
          <p>Everyone has a story to tell. Writing Quests is a platform where every person can be a writer, regardless of their background or experience.</p>

          <h3>Meritocracy of Ideas</h3>
          <p>Here, everyone can be a winner. We celebrate the effort and creativity in each submission, recognizing that every contribution enriches our collective narrative.</p>

          <h3>Supportive Community</h3>
          <p>We are committed to providing a supportive space for writers to grow and flourish. Our community thrives on encouragement, constructive feedback, and mutual respect.</p>

          <h3>Storytelling at Heart</h3>
          <p>We hold a firm belief that stories have the power to change the world. Your tales, whether fact or fiction, contribute to the vast tapestry of the human experience.</p>

          <h3>Plain Language</h3>
          <p>We advocate for clear and straightforward communication. Our content is accessible, avoiding jargon to ensure understanding across diverse audiences.</p>
        </ContentBlock>
      </ContentContainer>
    </Page>
  )
}
