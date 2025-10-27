import useTitle from '../../services/useTitle'
import Page from '../Page'
import { ContentContainer, ContentBlock } from '../Containers'
import { Link } from 'react-router-dom'

export function AboutDirectMessages () {
  useTitle('About the Questing Writing Tracker')
  return (
    <Page>
      <ContentContainer>
        <ContentBlock>
      <h1>Direct Messages in Questy</h1>
      <p>As of Novel Quests 2025, users can send each other direct messages! Direct messaging is an opt-in feature: you will only recieve DMs from mutual buddies if you have selected the option in <Link to="/settings">your user settings</Link>. If at any time you turn off DMs or remove a user as a buddy, they will no longer be able to reply to or initiate a new direct message with you. Users can only turn on the option to send and receive DMs after they have verified their email address.</p>

      <p>This first roll-out of direct messages is a bit limited. Messages have limited Markdown support for formatting. You can archive messages to hide them from your inbox &mdash; but we haven't implemented a "delete" option yet, and messages move back to your inbox if the other user replies. Messages are one-on-one communications at this time.</p>

      <p>If you have any questions about direct messages, or ideas on how to improve the feature in future releases, please don't hesitate to reach out and let us know!</p>
      </ContentBlock>
      </ContentContainer>
    </Page>
  )
}