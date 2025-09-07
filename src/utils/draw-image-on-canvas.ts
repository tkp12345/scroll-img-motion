import type { RefObject } from 'react';
import type { Bitmap } from './bitmap-utils';

export function drawImageOnCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  image: Bitmap | undefined,
  cssSize: { width: number; height: number },
  lastDrawnIndexRef?: { current: number | null },
  indexForGuard?: number,
) {
  const canvas = canvasRef.current;
  if (!canvas || !image) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 마지막으로 그린 인덱스와 동일하면 다시 안그림
  if (
    lastDrawnIndexRef &&
    indexForGuard != null &&
    lastDrawnIndexRef.current === indexForGuard
  )
    return;
  if (lastDrawnIndexRef) lastDrawnIndexRef.current = indexForGuard ?? null;

  // 고해상도 디스플레이(DPR)에 맞게 캔버스 스케일 조정 for iphone....🤡
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const iw =
    'naturalWidth' in (image as any)
      ? (image as any).naturalWidth
      : (image as ImageBitmap).width;
  const ih =
    'naturalHeight' in (image as any)
      ? (image as any).naturalHeight
      : (image as ImageBitmap).height;

  const cW = cssSize.width,
    cH = cssSize.height;
  const imgAR = iw / ih,
    cvsAR = cW / cH;

  let drawW: number,
    drawH: number,
    dx = 0,
    dy = 0;
  if (imgAR > cvsAR) {
    drawW = cH * imgAR;
    drawH = cH;
    dx = (cW - drawW) / 2;
  } else {
    drawH = cW / imgAR;
    drawW = cW;
    dy = (cH - drawH) / 2;
  }

  ctx.clearRect(0, 0, cW, cH);
  ctx.drawImage(image as any, dx, dy, drawW, drawH);
}
