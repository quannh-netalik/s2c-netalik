import { useCallback, useEffect, useRef, useState } from 'react';

export const useForceRender = () => {
  // Add mounted ref to prevent setState after unmount
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [, force] = useState(0);

  const requestRender = useCallback((): void => {
    // Check if mounted before updating state
    if (isMountedRef.current) {
      force((n) => (n + 1) | 0);
    }
  }, []);

  return { requestRender };
};
