// hooks/use-media-query.ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const handler = () => setMatches(media.matches);
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [query]);

  return matches;
}