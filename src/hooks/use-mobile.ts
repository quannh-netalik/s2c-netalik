import * as React from 'react';

export const BreakPoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useIsMobile(breakPoint: number = BreakPoint.md) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakPoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < breakPoint);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < breakPoint);
    return () => mql.removeEventListener('change', onChange);
  }, [breakPoint]);

  return !!isMobile;
}
