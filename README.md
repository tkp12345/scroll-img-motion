# scroll-img-motion

[![npm version](https://img.shields.io/npm/v/scroll-img-motion.svg)](https://www.npmjs.com/package/scroll-img-motion)
[![npm downloads](https://img.shields.io/npm/dm/scroll-img-motion.svg)](https://www.npmjs.com/package/scroll-img-motion)

A React library for smooth scroll-triggered image sequence animations using Canvas and Framer Motion.  
👉 [View on npm](https://www.npmjs.com/package/scroll-img-motion)

## Features

-  **Canvas-based rendering** for smooth performance
-  **Optimized image loading** with prefetch and cancellation
-  **Smart image caching** with bitmap optimization

## Installation

```bash
npm install scroll-img-motion
```

## Usage

```tsx
import React from 'react';
import { ImgScrollCanvas } from 'scroll-img-motion';

function App() {
  const imageUrls = [
    '/images/frame-001.webp',
    '/images/frame-002.webp',
    '/images/frame-003.webp',
    // ... more images
  ];

  return (
    <div style={{ height: '200vh' }}>
      <ImgScrollCanvas urls={imageUrls} />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `urls` | `string[]` | Yes | Array of image URLs for the sequence |

## How it works

1. **Image Loading**: Uses optimized ImageBitmap loading with smart prefetching
2. **Canvas Rendering**: Renders images on canvas for smooth performance
3. **Scroll Detection**: Uses Framer Motion's useScroll for precise scroll tracking
4. **Frame Smoothing**: Applies spring animations for butter-smooth transitions

## Advanced Usage

The library also exports utility hooks and functions for custom implementations:

```tsx
import { 
  useCanvasResize,
  useImageSequenceLoader,
  useSmoothAnimationFrame,
  drawImageOnCanvas 
} from 'scroll-img-motion';
```

## Requirements

- React 18+
- Framer Motion 10+

## License

MIT
