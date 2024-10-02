import { useEffect } from 'react'

export default function useTitle(title) {
  const defaultTitle = "Writing Quests"

  useEffect(() => {
    if(title?.length) {
      document.title = `${defaultTitle} | ${title}`
    } else {
      document.title = defaultTitle
    }
  }, [title])
}
