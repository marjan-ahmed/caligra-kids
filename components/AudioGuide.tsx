'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { generateAudioGuide } from '@/utils/audioGuide';

export default function AudioGuide() {
  const { currentLesson, brushType, audioEnabled, narrationMode } = useStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!audioEnabled) {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {}
        sourceNodeRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const fetchAndPlay = async () => {
      try {
        const result = await generateAudioGuide(currentLesson.letter, brushType, narrationMode);
        if (!isMounted || !result || !result.base64Audio) return;

        // Stop any currently playing audio
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.stop();
          } catch (e) {
            // Ignore if already stopped
          }
          sourceNodeRef.current = null;
        }

        const { base64Audio, mimeType } = result;

        if (mimeType && (mimeType.includes('wav') || mimeType.includes('mp3') || mimeType.includes('webm'))) {
          const audio = new Audio(`data:${mimeType};base64,${base64Audio}`);
          await audio.play();
        } else {
          // Assume raw PCM 16-bit little-endian 24000Hz
          const binaryString = window.atob(base64Audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const audioCtx = audioContextRef.current;
          
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }

          const float32Data = new Float32Array(bytes.length / 2);
          const dataView = new DataView(bytes.buffer);
          for (let i = 0; i < float32Data.length; i++) {
            float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
          }

          const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
          audioBuffer.getChannelData(0).set(float32Data);

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          source.start();
          
          sourceNodeRef.current = source;
        }
      } catch (error) {
        console.error("Failed to play audio guide:", error);
      }
    };

    // Debounce to avoid spamming API
    const timer = setTimeout(fetchAndPlay, 1500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {}
        sourceNodeRef.current = null;
      }
    };
  }, [currentLesson.letter, brushType, audioEnabled, narrationMode]);

  return null;
}
