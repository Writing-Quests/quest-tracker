export default function TextTimestamp({ datetime, label, ...props }) {
  const date = new Date(datetime).toLocaleDateString()
  const time = new Date(datetime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return <div {...props}>{label} at {time} on {date}</div>
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