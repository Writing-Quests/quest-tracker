import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function TextTimestamp({ datetime, type="prefix" }) {
  const date = new Date(datetime).toLocaleDateString()
  const time = new Date(datetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  switch (type) {
    case 'prefix':
      return <>{date} {time}</>
    
    case 'short':
      const shortDate = new Date(datetime).toLocaleDateString([], {'year': '2-digit', 'month': '2-digit', 'day': '2-digit'});
      return <>{shortDate} {time}</>
    break;

    default:
      return <>{time} on {date}</>
  }
}

export function TextTitleCase({ text, ...props }) {
  let keep_lower = ["and", "as", "but", "for", "if", "nor", "or", "so", "yet", "a", "an", "the", "as", "at", "by", "for", "in", "of", "off", "on", "per", "to", "up", "via"]
  let words = this.split(' ')
  let title = '';
  words.forEach((w, i) => {
    if (keep_lower.includes(w) && i !== 0) { // the first word is always capitalized, regardless of usually lowercase words
      title += `${w.toLowerCase()} `;
    } else {
      title += `${w.substring(0, 1).toUpperCase()}${w.substring(1).toLowerCase()} `
    }
  })
  return <div {...props}>{title.trim()}</div>
}

export function numberWithCommas (number) {
  return number.toString().replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g,"$1,")
}

export function MarkdownBlock ({children, ...props}) {
  const disallowedElements = ['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'iframe', 'style']
  return <div {...props}><Markdown disallowedElements={disallowedElements} remarkPlugins={[remarkGfm]} components={{a({ children, ...rest }) { return <a rel="nofollow noopener" href={rest.href}>{children}</a>}}}>{children}</Markdown></div>
}