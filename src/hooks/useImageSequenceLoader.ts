import { useEffect } from 'react';
import { Bitmap, fetchBitmapWithFallback } from '../utils/bitmap-utils';
import { useStableRef } from './useStableref';

//TODO: cache 제한 로직 추가 - 오래된 항목을 지우거나 하는 방향으로 . ..

type Opts = {
  maxRequest?: number; // 동시 요청 제한 (기본 4)
  prefetchWindow?: number; // 현재 인덱스 ±N 선로딩 (기본 20)
};

export const useImageSequenceLoader = (
  imageUrls: string[],
  options: Opts = {},
) => {
  const maxRequest = options.maxRequest ?? 4;
  const windowSize = options.prefetchWindow ?? 20;

  const cacheRef = useStableRef(new Map<number, Bitmap>()); // 로드된 이미지들 캐시
  const queueRef = useStableRef<number[]>([]); // 대기 중인 큐
  const inProgressRequestRef = useStableRef(new Map<number, AbortController>()); // 진행중인 요청들
  const inProgressRequestCountRef = useStableRef(0); // 진행중 요청 수
  const centerRef = useStableRef(0); //  현재 중심 인덱스

  const getBitmap = (i: number) => cacheRef.current.get(i);

  const pump = () => {
    if (inProgressRequestCountRef.current >= maxRequest) return;

    //현재 인덱스 에서 가까운 이미지 부터 우선로드
    queueRef.current.sort(
      (a, b) =>
        Math.abs(a - centerRef.current) - Math.abs(b - centerRef.current),
    );

    while (
      inProgressRequestCountRef.current < maxRequest &&
      queueRef.current.length
    ) {
      const i = queueRef.current.shift()!;
      if (i < 0 || i >= imageUrls.length) continue;

      if (cacheRef.current.has(i) || inProgressRequestRef.current.has(i))
        continue;

      const ctrl = new AbortController();
      inProgressRequestRef.current.set(i, ctrl);
      inProgressRequestCountRef.current++;

      fetchBitmapWithFallback(imageUrls[i], ctrl.signal)
        .then((bmp) => cacheRef.current.set(i, bmp))
        .catch(() => {})
        .finally(() => {
          inProgressRequestRef.current.delete(i);
          inProgressRequestCountRef.current = Math.max(
            0,
            inProgressRequestCountRef.current - 1,
          );
          pump();
        });
    }
  };

  const setCenter = (i: number) => {
    //현재 위치
    centerRef.current = i;

    //멀어진 요청 취소
    for (const [idx, ctrl] of inProgressRequestRef.current) {
      if (Math.abs(idx - i) > windowSize * 2) {
        ctrl.abort();
        inProgressRequestRef.current.delete(idx);
        inProgressRequestCountRef.current = Math.max(
          0,
          inProgressRequestCountRef.current - 1,
        );
      }
    }

    //새로운 선로딩 범위 설정
    const start = Math.max(0, i - windowSize);
    const end = Math.min(imageUrls.length - 1, i + windowSize);

    for (let k = start; k <= end; k++) {
      if (
        !cacheRef.current.has(k) &&
        !inProgressRequestRef.current.has(k) &&
        !queueRef.current.includes(k)
      ) {
        queueRef.current.push(k);
      }
    }
    pump();
  };

  useEffect(() => {
    for (const c of inProgressRequestRef.current.values()) c.abort();
    inProgressRequestRef.current.clear();
    cacheRef.current.clear();
  }, []);

  return { getBitmap, setCenter };
};
