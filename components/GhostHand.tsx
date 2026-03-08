'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { getLetterPath } from '@/utils/letterPaths';

export default function GhostHand() {
  const { currentLesson, showGhostHand, ghostHandOpacity, color } = useStore();
  const [position, setPosition] = useState({ x: 0, y: 0, p: 0 });
  const [visible, setVisible] = useState(false);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState(0);
  const [currentPointIdx, setCurrentPointIdx] = useState(0);
  const requestRef = useRef<number | null>(null);

  const strokes = getLetterPath(currentLesson.letter);

  useEffect(() => {
    if (!showGhostHand) {
      setVisible(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    let currentStroke = 0;
    let currentPoint = 0;
    let lastTime = performance.now();
    let state = 'moving'; // 'moving', 'paused', 'between_strokes'
    let pauseTimer = 0;

    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      if (state === 'paused') {
        pauseTimer -= dt;
        if (pauseTimer <= 0) {
          state = 'moving';
          currentStroke = 0;
          currentPoint = 0;
        }
      } else if (state === 'between_strokes') {
        pauseTimer -= dt;
        if (pauseTimer <= 0) {
          state = 'moving';
          setVisible(true);
        }
      } else if (state === 'moving') {
        const stroke = strokes[currentStroke];
        if (!stroke) return;
        
        const point = stroke[currentPoint];
        if (point) {
          setPosition(point);
          setCurrentStrokeIdx(currentStroke);
          setCurrentPointIdx(currentPoint);
          setVisible(true);
          currentPoint++;
        } else {
          // End of stroke
          currentStroke++;
          currentPoint = 0;
          if (currentStroke >= strokes.length) {
            // End of letter
            state = 'paused';
            pauseTimer = 2000; // Pause at the end of the letter
            setVisible(false);
          } else {
            state = 'between_strokes';
            pauseTimer = 500; // Pause between strokes
            setVisible(false);
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [currentLesson.letter, showGhostHand, strokes]);

  if (!showGhostHand) return null;

  return (
    <>
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render the full path as a faint dotted line */}
        {strokes.map((stroke, i) => {
          if (stroke.length === 0) return null;
          const d = stroke.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`).join(' ');
          return (
            <path
              key={`faint-${i}`}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray="4 8"
              opacity={0.15}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Render the glowing trail ahead of the hand */}
        {visible && strokes[currentStrokeIdx] && (() => {
          const trail = strokes[currentStrokeIdx].slice(currentPointIdx, currentPointIdx + 40);
          if (trail.length < 2) return null;
          const end = trail[trail.length - 1];
          const prev = trail[trail.length - 2];
          const angle = Math.atan2(end.y - prev.y, end.x - prev.x) * (180 / Math.PI);
          
          const segments = [];
          for (let i = 0; i < 4; i++) {
            const startIdx = Math.floor(i * trail.length / 4);
            const endIdx = Math.floor((i + 1) * trail.length / 4) + 1;
            const segment = trail.slice(startIdx, endIdx);
            if (segment.length > 1) {
              segments.push(
                <path
                  key={`trail-${i}`}
                  d={segment.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`).join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeDasharray="4 8"
                  opacity={0.8 - i * 0.2}
                  vectorEffect="non-scaling-stroke"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
              );
            }
          }

          return (
            <>
              {segments}
              <polygon
                points="-1.5,-1.5 1.5,0 -1.5,1.5"
                fill={color}
                opacity={0.2}
                transform={`translate(${end.x * 100}, ${end.y * 100}) rotate(${angle}) scale(1.5)`}
                vectorEffect="non-scaling-stroke"
                filter="url(#glow)"
                className="animate-pulse"
              />
            </>
          );
        })()}

        {/* Render arrows at key direction changes or end of strokes */}
        {strokes.map((stroke, i) => {
          if (stroke.length < 10) return null;
          const end = stroke[stroke.length - 1];
          const prev = stroke[stroke.length - 10];
          const angle = Math.atan2(end.y - prev.y, end.x - prev.x) * (180 / Math.PI);
          return (
            <polygon
              key={`arrow-${i}`}
              points="-1,-1 1,0 -1,1"
              fill={color}
              opacity={0.4}
              transform={`translate(${end.x * 100}, ${end.y * 100}) rotate(${angle}) scale(1.5)`}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>

      <div 
        className="absolute pointer-events-none z-20 transition-opacity duration-300"
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          opacity: visible ? ghostHandOpacity : 0,
          transform: `translate(-50%, -100%) scale(${0.8 + position.p * 0.4})`,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="drop-shadow-lg">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M18 11v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v-7a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0" />
          <path d="M22 13v3a6 6 0 0 1-6 6" />
        </svg>
      </div>
    </>
  );
}
