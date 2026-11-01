import React, { useEffect, useRef, useImperativeHandle } from 'react';
import {
  useSpringValue,
  useSpring,
  animated,
  to as interpolate
} from '@react-spring/web';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';

const useGesture = createUseGesture([dragAction, pinchAction]);

export const CustomZoom = React.forwardRef(
  ({ children, minScale = 0.5, maxScale = 3, initialScale = 1, onZoomChange, pinch = true }, ref) => {
    const x = useSpringValue(0);
    const y = useSpringValue(0);
    const scale = useSpringValue(initialScale);
    const rotateZ = useSpringValue(0);

    const elementRef = useRef(null);
    const scaleRef = useRef(initialScale);

    // Compose spring style
    const style = {
      x,
      y,
      scale,
      rotateZ,
    };


    useImperativeHandle(ref, () => ({
      api: { x, y, scale, rotateZ },
      element: elementRef.current,
      zoomIn: (factor = 1.2) => {
        const newScale = Math.min(maxScale, scaleRef.current * factor);
        scale.start(newScale);
        scaleRef.current = newScale;
        if (onZoomChange) onZoomChange(newScale);
      },
      zoomOut: (factor = 1.2) => {
        const newScale = Math.max(minScale, scaleRef.current / factor);
        scale.start(newScale);
        // Reset to center when zooming out
        x.start(0);
        y.start(0);
        scaleRef.current = newScale;
        if (onZoomChange) onZoomChange(newScale);
      },
      reset: () => {
        x.start(0);
        y.start(0);
        scale.start(initialScale);
        rotateZ.start(0);
      },
    }));

      // Optimized touch and mouse handling
  useEffect(() => {
    const preventZoom = (e) => e.preventDefault();
    
    // Prevent browser zoom gestures
    document.addEventListener('gesturestart', preventZoom);
    document.addEventListener('gesturechange', preventZoom);
    document.addEventListener('gestureend', preventZoom);
    
    // Handle mouse events only for desktop
    const element = elementRef.current;
    if (element && !('ontouchstart' in window)) {
      const handleMouse = (e) => {
        e.preventDefault();
      };
      
      element.addEventListener('mousedown', handleMouse, { passive: false });
      element.addEventListener('mousemove', handleMouse, { passive: false });
      element.addEventListener('mouseup', handleMouse, { passive: false });
      
      return () => {
        document.removeEventListener('gesturestart', preventZoom);
        document.removeEventListener('gesturechange', preventZoom);
        document.removeEventListener('gestureend', preventZoom);
        
        element.removeEventListener('mousedown', handleMouse);
        element.removeEventListener('mousemove', handleMouse);
        element.removeEventListener('mouseup', handleMouse);
      };
    }
    
    return () => {
      document.removeEventListener('gesturestart', preventZoom);
      document.removeEventListener('gesturechange', preventZoom);
      document.removeEventListener('gestureend', preventZoom);
    };
  }, []);

      // Use gesture
  useGesture(
    {
      onDrag: ({ pinching, cancel, offset: [ox, oy], movement: [mx, my], first, touches, event }) => {
        // Don't cancel drag during pinch on mobile for better experience
        // if (pinching) return cancel();
        
        const currentScaleValue = scaleRef.current;
        
        // Only allow dragging when zoomed in
        if (currentScaleValue > 1) {
          // Calculate bounds to keep image in view
          const element = elementRef.current;
          if (element) {
            const rect = element.getBoundingClientRect();
            const maxX = Math.max(0, (rect.width * (currentScaleValue - 1)) / 2);
            const maxY = Math.max(0, (rect.height * (currentScaleValue - 1)) / 2);
            
            // Clamp position within bounds
            const clampedX = Math.max(-maxX, Math.min(maxX, ox));
            const clampedY = Math.max(-maxY, Math.min(maxY, oy));
            
            // Use immediate updates for better responsiveness
            x.set(clampedX);
            y.set(clampedY);
          } else {
            x.set(ox);
            y.set(oy);
          }
        } else {
          // Reset to center when not zoomed
          x.set(0);
          y.set(0);
        }
      },
      onPinch: pinch
      ? ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo }) => {
          if (first) {
            const { width, height, x: elX, y: elY } = elementRef.current.getBoundingClientRect();
            const tx = ox - (elX + width / 2);
            const ty = oy - (elY + height / 2);
            memo = [x.get(), y.get(), tx, ty];
          }

          const nextX = memo[0] - (ms - 1) * memo[2];
          const nextY = memo[1] - (ms - 1) * memo[3];
          
          // If zooming out to minimum scale, reset to center
          if (s <= 1) {
            x.start(0);
            y.start(0);
          } else {
            x.start(nextX);
            y.start(nextY);
          }
          
          scale.start(s);
          rotateZ.start(0);
          
          // Update scale ref for zoom controls
          scaleRef.current = s;
          if (onZoomChange) onZoomChange(s);
          
          return memo;
        }
      : undefined,
      onDoubleClick: ({ event }) => {
        event.preventDefault();
        const currentScaleValue = scaleRef.current;
        if (currentScaleValue > 1) {
          // Zoom out to 1
          scale.start(1);
          x.start(0);
          y.start(0);
          scaleRef.current = 1;
          if (onZoomChange) onZoomChange(1);
        } else {
          // Zoom in to 2
          scale.start(2);
          scaleRef.current = 2;
          if (onZoomChange) onZoomChange(2);
        }
      },
    },
    {
      target: elementRef,
      drag: { 
        from: () => [x.get(), y.get()],
        threshold: 1, // Small threshold for mobile to prevent accidental drags
        filterTaps: false, // Don't filter taps to allow double-tap
        preventDefault: false, // Allow default touch behavior
        rubberband: false, // Disable rubberband for more direct control
        delay: false, // No delay for immediate response
        pointer: { touch: true, mouse: true }, // Enable both touch and mouse
      },
      pinch: {
        scaleBounds: { min: minScale, max: maxScale },
        rubberband: true,
        threshold: 0, // No threshold for pinch to make it more responsive
        preventDefault: true,
      },
    }
  );

      return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden select-none touch-manipulation">
      <animated.div
        ref={elementRef}
        style={{
          transform: interpolate(
            [x, y, scale, rotateZ],
            (x, y, s, r) => `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`
          ),
          touchAction: 'none', // Prevent default touch actions
          userSelect: 'none', // Prevent text selection on desktop
          cursor: !('ontouchstart' in window) ? 'grab' : 'default', // Show grab cursor only on desktop
        }}
        className="w-full h-full flex items-center justify-center select-none touch-manipulation"
        onMouseDown={!('ontouchstart' in window) ? () => {
          // Change cursor to grabbing when dragging starts (desktop only)
          if (elementRef.current) {
            elementRef.current.style.cursor = 'grabbing';
          }
        } : undefined}
        onMouseUp={!('ontouchstart' in window) ? () => {
          // Change cursor back to grab when dragging ends (desktop only)
          if (elementRef.current) {
            elementRef.current.style.cursor = 'grab';
          }
        } : undefined}
      >
        {children}
      </animated.div>
    </div>
  );
  }
);

  
  // Zoom Controls Component
export const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  canZoomIn = true,
  canZoomOut = true,
  currentScale
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      
      {/* Zoom Controls */}
      <div className="flex gap-2">
        {canZoomIn && (
          <button
            onClick={onZoomIn}
            className="bg-gray-800/90 hover:bg-gray-800 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-200 active:scale-95"
            title="Zoom In"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        )}
        {canZoomOut && (
          <button
            onClick={onZoomOut}
            className="bg-gray-800/90 hover:bg-gray-800 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-200 active:scale-95"
            title="Zoom Out"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM7 10h6" />
          </svg>
          </button>
        )}
      </div>
      
    
    </div>
  );
};
