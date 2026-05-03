"use client";

import React, { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useStore } from "@/store/useStore";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GestureController() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gestureMode, setGestureMode, canvasRef: appCanvasRef } = useStore();
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  
  const lastGestureRef = useRef({ isDown: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    async function initMediaPipe() {
      if (landmarker) return;
      setIsLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLandmarker(handLandmarker);
      } catch (err) {
        console.error("Failed to init MediaPipe:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (gestureMode) {
      initMediaPipe();
    }
  }, [gestureMode, landmarker]);

  useEffect(() => {
    if (!gestureMode || !landmarker || !videoRef.current) {
      // Clean up stream
      if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      return;
    }

    let animationFrameId: number;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 },
            audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setHasCamera(true);
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setGestureMode(false);
      }
    }

    function predictWebcam() {
      if (!landmarker || !videoRef.current || !gestureMode) return;

      const results = landmarker.detectForVideo(videoRef.current, performance.now());
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        // Index finger tip is 8, Thumb tip is 4
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Pinch gesture detection (distance between thumb and index)
        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Down if distance is small (pinch)
        const isDown = dist < 0.08;
        
        // Map normalized coordinates to app canvas
        const appCanvas = appCanvasRef?.current;
        if (appCanvas && appCanvas.addExternalPoint) {
           const rect = appCanvas.getBoundingClientRect?.() || { left: 0, top: 0, width: 800, height: 600 };
           
           // Coordinates are inverted horizontally for "mirror" effect
           const canvasX = (1 - indexTip.x) * rect.width;
           const canvasY = indexTip.y * rect.height;

           appCanvas.addExternalPoint(canvasX, canvasY, isDown);
        }
      } else {
        // Hand not detected, treat as up
        const appCanvas = appCanvasRef?.current;
        if (appCanvas && appCanvas.addExternalPoint) {
            appCanvas.addExternalPoint(0, 0, false);
        }
      }

      animationFrameId = requestAnimationFrame(predictWebcam);
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [gestureMode, landmarker, appCanvasRef, setGestureMode]);

  if (!gestureMode) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[60] group">
       <div className="relative overflow-hidden rounded-2xl border-4 border-indigo-600 shadow-2xl bg-zinc-900 w-48 h-36">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10 text-white p-4 text-center">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Waking up hand AI...</p>
            </div>
          )}
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover scale-x-[-1]"
          />
          
          <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-[8px] font-bold rounded-md uppercase tracking-wider">
             Gesture Mode Beta
          </div>
          
          <button 
            onClick={() => setGestureMode(false)}
            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-rose-500 text-white rounded-md transition-colors"
          >
             <CameraOff size={12} />
          </button>
          
          <div className="absolute bottom-2 left-2 right-2 flex justify-center">
            <p className="text-[8px] text-white/70 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
               Pinch fingers to draw!
            </p>
          </div>
       </div>
    </div>
  );
}
