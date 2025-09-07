//TODO remove framer-motion
import { useRef } from 'react';
import { MotionValue, useAnimationFrame } from 'framer-motion';

const SOFT_RATIO = 0.7;
const THROTTLE_MS = 16; // 60fps 기준

export function useSmoothAnimationFrame({
  smoothIndex,
  imagesLen,
  draw,
}: {
  smoothIndex: MotionValue<number>;
  imagesLen: number;
  draw: (index: number) => void;
}) {
  const displayRef = useRef(0);
  const lastTsRef = useRef(0);

  useAnimationFrame((t) => {
    if (t - lastTsRef.current < THROTTLE_MS) return;
    lastTsRef.current = t;

    const target = smoothIndex.get();
    displayRef.current += (target - displayRef.current) * SOFT_RATIO;

    const idx = Math.floor(
      Math.min(Math.max(0, displayRef.current), imagesLen - 1),
    );
    draw(idx);
  });
}
