import React, { useRef } from 'react';

export function useStableRef<T>(initial: T) {
  const ref = useRef<T | null>(null);
  if (ref.current === null) ref.current = initial;
  return ref as React.MutableRefObject<T>;
}
