import Page from './Page'
import { ContentContainer, ContentBlock } from './Containers'

export default function NovelQuestPage() {
  return <Page>
    <ContentContainer>
      <ContentBlock>
        <h1>Novel Quest 2025</h1>
        {/* TODO: Rules */}
        {/* TODO: Leave novel quest link */}
      </ContentBlock>
      {/* TODO: Winners block */}
      <ContentBlock>
        <h2>Your Stats</h2>
        {/* TODO: Bar chart */}
        {/* TODO: Line chart */}
        {/* TODO: List of projects that are included with links to them to update progress */}
        {/* TODO: By the numbers (avg # words per day, # words to meet par today, streak) */}
        {/* TODO: Badges */}
      </ContentBlock>
      <ContentBlock>
        <h2>All Stats</h2>
        {/* TODO: Note about privacy of your stats */}
        {/* TODO: Overall ranking w/ bar charts for each person */}
        {/* TODO: Aggregate bar chart */}
        {/* TODO: By the numbers: # particiapnts, mean, stdev, min, max, median, % winners */}
      </ContentBlock>
    </ContentContainer>
  </Page>
}
