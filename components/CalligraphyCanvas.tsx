"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import GhostHand from "./GhostHand";

export interface CalligraphyCanvasHandle {
  clear: () => void;
  getScreenshot: () => string;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const CalligraphyCanvas = forwardRef<CalligraphyCanvasHandle, {}>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { currentLesson, setCanvasRef, brushType, color, opacity, thickness, theme } = useStore();

    // Refs for drawing properties to avoid recreating the canvas
    const drawPropsRef = useRef({ brushType, color, opacity, thickness });
    const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
    const textureRef = useRef<THREE.CanvasTexture | null>(null);
    const baseAngleRef = useRef<number>(0);

    useEffect(() => {
      drawPropsRef.current = { brushType, color, opacity, thickness };
      
      if (materialRef.current && textureRef.current) {
        // Update texture based on brushType
        const brushCanvas = document.createElement("canvas");
        brushCanvas.width = 64;
        brushCanvas.height = 64;
        const ctx = brushCanvas.getContext("2d")!;
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        
        let baseAngle = 0;
        if (brushType === "flat" || brushType === "chisel") {
          ctx.fillRect(16, 0, 32, 64);
          baseAngle = brushType === "flat" ? Math.PI / 4 : -Math.PI / 4;
        } else if (brushType === "fountain") {
          ctx.beginPath();
          ctx.ellipse(32, 32, 16, 32, 0, 0, Math.PI * 2);
          ctx.fill();
          baseAngle = Math.PI / 4;
        } else {
          const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
          if (brushType === "marker" || brushType === "ballpoint") {
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.9, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          } else {
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 64, 64);
        }
        
        baseAngleRef.current = baseAngle;
        textureRef.current.image = brushCanvas;
        textureRef.current.needsUpdate = true;
        
        materialRef.current.color = new THREE.Color(color);
        materialRef.current.opacity = opacity;
      }
    }, [brushType, color, opacity, thickness]);

    useEffect(() => {
      if (!canvasRef.current) return;
      setCanvasRef(canvasRef);
    }, [setCanvasRef]);

    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      const isDark = theme === "dark";
      const bgColor = isDark ? 0x18181b : 0xf5f5f0; // zinc-950 or warm off-white

      // Setup Three.js
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(bgColor, 1);

      const scene = new THREE.Scene();

      // Orthographic camera for 2D drawing
      const aspect = container.clientWidth / container.clientHeight;
      const camera = new THREE.OrthographicCamera(
        -container.clientWidth / 2,
        container.clientWidth / 2,
        container.clientHeight / 2,
        -container.clientHeight / 2,
        0.1,
        1000,
      );
      camera.position.z = 10;

      // Create initial brush texture
      const brushCanvas = document.createElement("canvas");
      brushCanvas.width = 64;
      brushCanvas.height = 64;
      const ctx = brushCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      
      let baseAngle = 0;
      const initialBrushType = drawPropsRef.current.brushType;
      if (initialBrushType === "flat" || initialBrushType === "chisel") {
        ctx.fillRect(16, 0, 32, 64);
        baseAngle = initialBrushType === "flat" ? Math.PI / 4 : -Math.PI / 4;
      } else if (initialBrushType === "fountain") {
        ctx.beginPath();
        ctx.ellipse(32, 32, 16, 32, 0, 0, Math.PI * 2);
        ctx.fill();
        baseAngle = Math.PI / 4;
      } else {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        if (initialBrushType === "marker" || initialBrushType === "ballpoint") {
          gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
          gradient.addColorStop(0.9, "rgba(255, 255, 255, 1)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        } else {
          gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
          gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      
      baseAngleRef.current = baseAngle;

      const brushTexture = new THREE.CanvasTexture(brushCanvas);
      textureRef.current = brushTexture;
      
      const brushMaterial = new THREE.MeshBasicMaterial({
        map: brushTexture,
        transparent: true,
        depthWrite: false,
        color: new THREE.Color(drawPropsRef.current.color),
        opacity: drawPropsRef.current.opacity,
      });
      materialRef.current = brushMaterial;

      const brushGeometry = new THREE.PlaneGeometry(1, 1);

      const MAX_INSTANCES = 100000;
      let instancedMesh = new THREE.InstancedMesh(
        brushGeometry,
        brushMaterial,
        MAX_INSTANCES,
      );
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(instancedMesh);

      let instanceCount = 0;
      const dummy = new THREE.Object3D();

      // History for Undo/Redo
      let history: number[] = [0];
      let historyIndex = 0;

      // Drawing state
      let isDrawing = false;
      let lastPoint = new THREE.Vector2();
      let lastTime = 0;

      // Guide letter
      let guideCanvas = document.createElement("canvas");
      guideCanvas.width = container.clientWidth;
      guideCanvas.height = container.clientHeight;
      let guideCtx = guideCanvas.getContext("2d")!;

      const drawGuide = () => {
        guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
        guideCtx.fillStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        guideCtx.font = `italic ${container.clientHeight * 0.6}px "Playfair Display", serif`;
        guideCtx.textAlign = "center";
        guideCtx.textBaseline = "middle";
        guideCtx.fillText(
          currentLesson.letter,
          guideCanvas.width / 2,
          guideCanvas.height / 2,
        );
      };

      drawGuide();
      const guideTexture = new THREE.CanvasTexture(guideCanvas);
      const guideMaterial = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: guideTexture },
          time: { value: 0 },
          isDark: { value: isDark ? 1.0 : 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform float time;
          uniform float isDark;
          varying vec2 vUv;
          
          void main() {
            vec4 texColor = texture2D(map, vUv);
            
            // Reveal from left to right over 2 seconds, looping every 4 seconds
            float revealProgress = mod(time * 0.5, 2.0);
            float alpha = smoothstep(revealProgress - 0.1, revealProgress + 0.1, vUv.x);
            
            // Invert alpha so it reveals (1 to 0)
            alpha = 1.0 - alpha;
            
            // Base color based on theme
            vec3 color = mix(vec3(0.0), vec3(1.0), isDark);
            
            // Base opacity
            float baseOpacity = 0.05;
            
            // Highlight the leading edge
            float edge = smoothstep(revealProgress - 0.05, revealProgress, vUv.x) * (1.0 - smoothstep(revealProgress, revealProgress + 0.05, vUv.x));
            vec3 edgeColor = mix(vec3(0.0, 0.0, 1.0), vec3(0.5, 0.5, 1.0), isDark); // Blueish edge
            
            vec3 finalColor = mix(color, edgeColor, edge * 0.5);
            float finalAlpha = texColor.a * (baseOpacity * alpha + edge * 0.2);
            
            gl_FragColor = vec4(finalColor, finalAlpha);
          }
        `,
        transparent: true,
        depthWrite: false,
      });
      const guidePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(container.clientWidth, container.clientHeight),
        guideMaterial,
      );
      guidePlane.position.z = -1;
      scene.add(guidePlane);

      const getPointerPos = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return new THREE.Vector2(
          x - container.clientWidth / 2,
          -(y - container.clientHeight / 2),
        );
      };

      const addStamp = (pos: THREE.Vector2, scale: number, angle: number) => {
        if (instanceCount >= MAX_INSTANCES) return;
        dummy.position.set(pos.x, pos.y, 0);
        dummy.rotation.z = angle;
        // Use scaleX and scaleY as 1 for now
        dummy.scale.set(scale, scale, 1);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(instanceCount, dummy.matrix);
        instanceCount++;
        instancedMesh.instanceMatrix.needsUpdate = true;
      };

      const onPointerDown = (e: PointerEvent) => {
        isDrawing = true;
        lastPoint = getPointerPos(e);
        lastTime = performance.now();
        
        const currentProps = drawPropsRef.current;
        let initialScale = currentProps.thickness;
        if (currentProps.brushType === "ballpoint") initialScale = currentProps.thickness * 0.2;
        
        addStamp(lastPoint, initialScale, baseAngleRef.current);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDrawing) return;

        const currentPoint = getPointerPos(e);
        const currentTime = performance.now();

        const dist = lastPoint.distanceTo(currentPoint);
        const dt = currentTime - lastTime;
        const speed = dist / (dt || 1);

        const currentProps = drawPropsRef.current;
        let targetScale = currentProps.thickness;
        
        if (currentProps.brushType === "pointed") {
          // Pointed brush: heavy pressure variation
          const minScale = currentProps.thickness * 0.2;
          const maxScale = currentProps.thickness * 1.5;
          targetScale = Math.max(minScale, maxScale - speed * (currentProps.thickness * 0.5));
        } else if (currentProps.brushType === "round") {
          // Round brush: slight pressure variation
          const minScale = currentProps.thickness * 0.5;
          const maxScale = currentProps.thickness * 1.2;
          targetScale = Math.max(minScale, maxScale - speed * (currentProps.thickness * 0.2));
        } else if (currentProps.brushType === "ballpoint") {
          targetScale = currentProps.thickness * 0.2;
        }

        const steps = Math.max(Math.floor(dist / 2), 1);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const p = new THREE.Vector2().lerpVectors(lastPoint, currentPoint, t);
          
          // Jitter for organic feel, except for marker/ballpoint
          if (currentProps.brushType !== "marker" && currentProps.brushType !== "ballpoint") {
            p.x += (Math.random() - 0.5) * (currentProps.thickness * 0.05);
            p.y += (Math.random() - 0.5) * (currentProps.thickness * 0.05);
          }
          
          addStamp(p, targetScale, baseAngleRef.current);
        }

        lastPoint = currentPoint;
        lastTime = currentTime;
      };

      const onPointerUp = () => {
        if (isDrawing) {
          isDrawing = false;
          // Save history
          history = history.slice(0, historyIndex + 1);
          history.push(instanceCount);
          historyIndex++;
          
          // Dispatch a custom event to notify the UI that history changed
          window.dispatchEvent(new CustomEvent('canvas-history-changed'));
        }
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerUp);

      let animationFrameId: number;
      const startTime = performance.now();
      const render = () => {
        const elapsedTime = (performance.now() - startTime) / 1000;
        guideMaterial.uniforms.time.value = elapsedTime;
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(render);
      };
      render();

      const handleResize = () => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        renderer.setSize(width, height);

        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        guideCanvas.width = width;
        guideCanvas.height = height;
        drawGuide();
        guideTexture.needsUpdate = true;
        guidePlane.geometry.dispose();
        guidePlane.geometry = new THREE.PlaneGeometry(width, height);
      };

      window.addEventListener("resize", handleResize);

      if (ref && typeof ref !== "function") {
        (
          ref as React.MutableRefObject<CalligraphyCanvasHandle | null>
        ).current = {
          clear: () => {
            instanceCount = 0;
            history = [0];
            historyIndex = 0;
            instancedMesh.count = 0;
            instancedMesh.instanceMatrix.needsUpdate = true;
            renderer.render(scene, camera);
            window.dispatchEvent(new CustomEvent('canvas-history-changed'));
          },
          getScreenshot: () => {
            guidePlane.visible = false;
            renderer.render(scene, camera);
            const dataUrl = canvas.toDataURL("image/png");
            guidePlane.visible = true;
            renderer.render(scene, camera);
            return dataUrl;
          },
          undo: () => {
            if (historyIndex > 0) {
              historyIndex--;
              instanceCount = history[historyIndex];
              instancedMesh.count = instanceCount;
              instancedMesh.instanceMatrix.needsUpdate = true;
              renderer.render(scene, camera);
              window.dispatchEvent(new CustomEvent('canvas-history-changed'));
            }
          },
          redo: () => {
            if (historyIndex < history.length - 1) {
              historyIndex++;
              instanceCount = history[historyIndex];
              instancedMesh.count = instanceCount;
              instancedMesh.instanceMatrix.needsUpdate = true;
              renderer.render(scene, camera);
              window.dispatchEvent(new CustomEvent('canvas-history-changed'));
            }
          },
          canUndo: () => historyIndex > 0,
          canRedo: () => historyIndex < history.length - 1,
        };
      }

      return () => {
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerUp);
        window.removeEventListener("resize", handleResize);

        brushGeometry.dispose();
        brushMaterial.dispose();
        brushTexture.dispose();
        guidePlane.geometry.dispose();
        guideMaterial.dispose();
        guideTexture.dispose();
        renderer.dispose();
      };
    }, [currentLesson, ref, theme]);

    const isDark = theme === "dark";

    return (
      <div
        ref={containerRef}
        className={`w-full h-full relative cursor-crosshair touch-none rounded-3xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border transition-colors duration-300 ${
          isDark ? "border-zinc-800" : "border-[#e5e5e0]"
        }`}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        <GhostHand />
      </div>
    );
  },
);

CalligraphyCanvas.displayName = "CalligraphyCanvas";

export default CalligraphyCanvas;
