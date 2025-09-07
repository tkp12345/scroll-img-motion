// 캔버스 픽셀 버퍼는 여기서만 리셋(DPR 반영). 매 프레임 리셋 금지.

import { RefObject, useEffect, useState } from 'react';

export function useCanvasResize(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  defaultSize: { width: number; height: number },
) {
  const [size, setSize] = useState(defaultSize);

  useEffect(() => {
    const update = () => {
      const cssWidth = window.innerWidth < 768 ? 360 : 708;
      const cssHeight = window.innerWidth < 768 ? 318 : 800;
      setSize({ width: cssWidth, height: cssHeight });

      const cv = canvasRef.current;
      if (!cv) return;
      const dpr = Math.max(window.devicePixelRatio || 1, 1);
      const needW = Math.floor(cssWidth * dpr);
      const needH = Math.floor(cssHeight * dpr);
      if (cv.width !== needW || cv.height !== needH) {
        cv.width = needW;
        cv.height = needH;
        cv.style.width = `${cssWidth}px`;
        cv.style.height = `${cssHeight}px`;
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [canvasRef]);

  return size;
}
