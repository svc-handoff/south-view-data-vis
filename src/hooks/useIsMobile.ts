import { useSyncExternalStore } from 'react'

function mediaQueryHook(query: string) {
  const list = window.matchMedia(query)
  const subscribe = (onChange: () => void) => {
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }
  return () => useSyncExternalStore(subscribe, () => list.matches)
}

// Same query as Tailwind's max-lg variant, so JS and CSS can't disagree about the layout
export const useIsMobile = mediaQueryHook('(width < 64rem)')
export const useIsLandscape = mediaQueryHook('(orientation: landscape)')
export const useIsTouch = mediaQueryHook('(pointer: coarse)')
