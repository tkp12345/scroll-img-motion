import React, { useCallback, useEffect, useRef } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import { useCanvasResize } from "./hooks/useCanvasResize";
import { useImageSequenceLoader } from "./hooks/useImageSequenceLoader";
import { drawImageOnCanvas } from "./utils/draw-image-on-canvas";
import { useSmoothAnimationFrame } from "./hooks/useSmoothAnimationFrame";

export function ImgScrollCanvas({ urls }: { urls: string[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null); // 섹션 래퍼(스크롤 진행 구간 측정용)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useCanvasResize(canvasRef, { width: 708, height: 800 });

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start 90%", "end 0%"], // 섹션의 90% 지점부터 0% 지점까지를 유효 범위로
  });
  const rawIndex = useTransform(
    scrollYProgress,
    [0, 0.9],
    [0, urls.length - 1],
  );
  const smoothIndex = useSpring(rawIndex, { stiffness: 1000, damping: 100 });

  // 이미지 시퀀스 로더(동시 4, ±20 선로딩, 멀어지면 취소)
  const { getBitmap, setCenter } = useImageSequenceLoader(urls, {
    maxRequest: 4,
    prefetchWindow: 20,
  });

  // 캔버스 드로우(중복 드로우 방지)
  const lastDrawnRef = useRef<number | null>(null);
  const draw = useCallback(
    (idx: number) => {
      const bmp = getBitmap(idx);
      drawImageOnCanvas(canvasRef, bmp, size, lastDrawnRef, idx);
    },
    [getBitmap, size],
  );

  // 부드러운 프레임 업데이트 (선로딩 트리거 + draw)
  useSmoothAnimationFrame({
    smoothIndex,
    imagesLen: urls.length,
    draw: (idx) => {
      setCenter(idx);
      draw(idx);
    },
  });

  // 첫 프레임 보장
  useEffect(() => {
    setCenter(0);
    draw(0);
  }, [setCenter, draw]);

  return (
    <div
      ref={wrapperRef}
      style={{
        height: 690, // 고정 섹션 높이
        display: "grid",
        placeItems: "center",
        background: "#0b0c0e",
        borderRadius: 12,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
