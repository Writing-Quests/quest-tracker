import { useRef, useEffect } from 'react'

export default function usePrev(input) {
  const prev = useRef(input)
  useEffect(() => {
    prev.current = input
  }, [input])
  return prev.current
}
