"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
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
  addExternalPoint: (x: number, y: number, isDown: boolean) => void;
}

const CalligraphyCanvas = forwardRef<CalligraphyCanvasHandle, {}>(
  (props, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { currentLesson, brushType, color, opacity, thickness, theme } = useStore();

    // Three.js instances stored in refs for imperative access
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
    const guidePlaneRef = useRef<THREE.Mesh | null>(null);
    const guideMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
    const guideTextureRef = useRef<THREE.CanvasTexture | null>(null);
    const guideCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Drawing state refs
    const drawingStateRef = useRef({
      isDrawing: false,
      lastPoint: new THREE.Vector2(),
      lastTime: 0,
      instanceCount: 0,
      history: [0] as number[],
      historyIndex: 0,
    });

    const drawPropsRef = useRef({ brushType, color, opacity, thickness });
    const brushMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
    const brushTextureRef = useRef<THREE.CanvasTexture | null>(null);
    const baseAngleRef = useRef<number>(0);
    const dummyRef = useRef(new THREE.Object3D());

    const MAX_INSTANCES = 100000;

    // Update drawing props ref on every change
    useEffect(() => {
      drawPropsRef.current = { brushType, color, opacity, thickness };
      
      if (brushMaterialRef.current && brushTextureRef.current) {
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
        brushTextureRef.current.image = brushCanvas;
        brushTextureRef.current.needsUpdate = true;
        
        brushMaterialRef.current.color = new THREE.Color(color);
        brushMaterialRef.current.opacity = opacity;
      }
    }, [brushType, color, opacity, thickness]);

    const addStamp = (pos: THREE.Vector2, scale: number, angle: number) => {
      const mesh = instancedMeshRef.current;
      if (!mesh || drawingStateRef.current.instanceCount >= MAX_INSTANCES) return;
      
      const dummy = dummyRef.current;
      dummy.position.set(pos.x, pos.y, 0);
      dummy.rotation.z = angle;
      dummy.scale.set(scale, scale, 1);
      dummy.updateMatrix();
      
      mesh.setMatrixAt(drawingStateRef.current.instanceCount, dummy.matrix);
      drawingStateRef.current.instanceCount++;
      mesh.instanceMatrix.needsUpdate = true;
    };

    const handlePointerDown = (x: number, y: number) => {
      if (!containerRef.current) return;
      drawingStateRef.current.isDrawing = true;
      const currentPoint = new THREE.Vector2(
        x - containerRef.current.clientWidth / 2,
        -(y - containerRef.current.clientHeight / 2),
      );
      drawingStateRef.current.lastPoint.copy(currentPoint);
      drawingStateRef.current.lastTime = performance.now();
      
      const currentProps = drawPropsRef.current;
      let initialScale = currentProps.thickness;
      if (currentProps.brushType === "ballpoint") initialScale = currentProps.thickness * 0.2;
      
      addStamp(currentPoint, initialScale, baseAngleRef.current);
    };

    const handlePointerMove = (x: number, y: number) => {
      if (!drawingStateRef.current.isDrawing || !containerRef.current) return;

      const currentPoint = new THREE.Vector2(
        x - containerRef.current.clientWidth / 2,
        -(y - containerRef.current.clientHeight / 2),
      );
      const currentTime = performance.now();

      const dist = drawingStateRef.current.lastPoint.distanceTo(currentPoint);
      const dt = currentTime - drawingStateRef.current.lastTime;
      const speed = dist / (dt || 1);

      const currentProps = drawPropsRef.current;
      let targetScale = currentProps.thickness;
      
      if (currentProps.brushType === "pointed") {
        const minScale = currentProps.thickness * 0.2;
        const maxScale = currentProps.thickness * 1.5;
        targetScale = Math.max(minScale, maxScale - speed * (currentProps.thickness * 0.5));
      } else if (currentProps.brushType === "round") {
        const minScale = currentProps.thickness * 0.5;
        const maxScale = currentProps.thickness * 1.2;
        targetScale = Math.max(minScale, maxScale - speed * (currentProps.thickness * 0.2));
      } else if (currentProps.brushType === "ballpoint") {
        targetScale = currentProps.thickness * 0.2;
      }

      const steps = Math.max(Math.floor(dist / 2), 1);
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const p = new THREE.Vector2().lerpVectors(drawingStateRef.current.lastPoint, currentPoint, t);
        
        if (currentProps.brushType !== "marker" && currentProps.brushType !== "ballpoint") {
          p.x += (Math.random() - 0.5) * (currentProps.thickness * 0.05);
          p.y += (Math.random() - 0.5) * (currentProps.thickness * 0.05);
        }
        
        addStamp(p, targetScale, baseAngleRef.current);
      }

      drawingStateRef.current.lastPoint.copy(currentPoint);
      drawingStateRef.current.lastTime = currentTime;
    };

    const handlePointerUp = () => {
      if (drawingStateRef.current.isDrawing) {
        drawingStateRef.current.isDrawing = false;
        const { instanceCount, historyIndex } = drawingStateRef.current;
        const newHistory = drawingStateRef.current.history.slice(0, historyIndex + 1);
        newHistory.push(instanceCount);
        drawingStateRef.current.history = newHistory;
        drawingStateRef.current.historyIndex = newHistory.length - 1;
        window.dispatchEvent(new CustomEvent('canvas-history-changed'));
      }
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        drawingStateRef.current.instanceCount = 0;
        drawingStateRef.current.history = [0];
        drawingStateRef.current.historyIndex = 0;
        if (instancedMeshRef.current) {
          instancedMeshRef.current.count = 0;
          instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        }
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        window.dispatchEvent(new CustomEvent('canvas-history-changed'));
      },
      getScreenshot: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !canvasRef.current) return "";
        if (guidePlaneRef.current) guidePlaneRef.current.visible = false;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        if (guidePlaneRef.current) guidePlaneRef.current.visible = true;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return dataUrl;
      },
      undo: () => {
        if (drawingStateRef.current.historyIndex > 0) {
          drawingStateRef.current.historyIndex--;
          drawingStateRef.current.instanceCount = drawingStateRef.current.history[drawingStateRef.current.historyIndex];
          if (instancedMeshRef.current) {
            instancedMeshRef.current.count = drawingStateRef.current.instanceCount;
            instancedMeshRef.current.instanceMatrix.needsUpdate = true;
          }
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          window.dispatchEvent(new CustomEvent('canvas-history-changed'));
        }
      },
      redo: () => {
        if (drawingStateRef.current.historyIndex < drawingStateRef.current.history.length - 1) {
          drawingStateRef.current.historyIndex++;
          drawingStateRef.current.instanceCount = drawingStateRef.current.history[drawingStateRef.current.historyIndex];
          if (instancedMeshRef.current) {
            instancedMeshRef.current.count = drawingStateRef.current.instanceCount;
            instancedMeshRef.current.instanceMatrix.needsUpdate = true;
          }
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
          window.dispatchEvent(new CustomEvent('canvas-history-changed'));
        }
      },
      canUndo: () => drawingStateRef.current.historyIndex > 0,
      canRedo: () => drawingStateRef.current.historyIndex < drawingStateRef.current.history.length - 1,
      addExternalPoint: (x: number, y: number, isDown: boolean) => {
        if (isDown) {
          if (!drawingStateRef.current.isDrawing) {
            handlePointerDown(x, y);
          } else {
            handlePointerMove(x, y);
          }
        } else {
          if (drawingStateRef.current.isDrawing) {
            handlePointerUp();
          }
        }
      },
    }));

    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      const isDark = theme === "dark";
      const bgColor = isDark ? 0x18181b : 0xf5f5f0;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(bgColor, 1);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.OrthographicCamera(
        -container.clientWidth / 2,
        container.clientWidth / 2,
        container.clientHeight / 2,
        -container.clientHeight / 2,
        0.1,
        1000,
      );
      camera.position.z = 10;
      cameraRef.current = camera;

      // Brush Initial Setup
      const brushTexture = new THREE.CanvasTexture(document.createElement("canvas"));
      brushTextureRef.current = brushTexture;
      
      const brushMaterial = new THREE.MeshBasicMaterial({
        map: brushTexture,
        transparent: true,
        depthWrite: false,
        color: new THREE.Color(drawPropsRef.current.color),
        opacity: drawPropsRef.current.opacity,
      });
      brushMaterialRef.current = brushMaterial;

      const instancedMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), brushMaterial, MAX_INSTANCES);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(instancedMesh);
      instancedMeshRef.current = instancedMesh;

      // Guide logic
      const guideCanvas = document.createElement("canvas");
      guideCanvas.width = container.clientWidth;
      guideCanvas.height = container.clientHeight;
      guideCanvasRef.current = guideCanvas;
      const guideCtx = guideCanvas.getContext("2d")!;
      
      const drawGuide = () => {
        guideCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
        guideCtx.fillStyle = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
        guideCtx.font = `italic ${container.clientHeight * 0.6}px "Playfair Display", serif`;
        guideCtx.textAlign = "center";
        guideCtx.textBaseline = "middle";
        guideCtx.fillText(currentLesson.letter, guideCanvas.width / 2, guideCanvas.height / 2);
      };
      drawGuide();

      const guideTexture = new THREE.CanvasTexture(guideCanvas);
      guideTextureRef.current = guideTexture;

      const guideMaterial = new THREE.ShaderMaterial({
        uniforms: { map: { value: guideTexture }, time: { value: 0 }, isDark: { value: isDark ? 1.0 : 0.0 } },
        vertexShader: `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: `
          uniform sampler2D map; uniform float time; uniform float isDark; varying vec2 vUv;
          void main() {
            vec4 texColor = texture2D(map, vUv);
            float revealProgress = mod(time * 0.5, 2.0);
            float alpha = 1.0 - smoothstep(revealProgress - 0.1, revealProgress + 0.1, vUv.x);
            vec3 color = mix(vec3(0.0), vec3(1.0), isDark);
            float edge = smoothstep(revealProgress - 0.05, revealProgress, vUv.x) * (1.0 - smoothstep(revealProgress, revealProgress + 0.05, vUv.x));
            vec3 edgeColor = mix(vec3(0.0, 0.0, 1.0), vec3(0.5, 0.5, 1.0), isDark);
            float finalAlpha = texColor.a * (0.05 * alpha + edge * 0.2);
            gl_FragColor = vec4(mix(color, edgeColor, edge * 0.5), finalAlpha);
          }
        `,
        transparent: true, depthWrite: false,
      });
      guideMaterialRef.current = guideMaterial;

      const guidePlane = new THREE.Mesh(new THREE.PlaneGeometry(container.clientWidth, container.clientHeight), guideMaterial);
      guidePlane.position.z = -1;
      scene.add(guidePlane);
      guidePlaneRef.current = guidePlane;

      const onPointerDown = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        handlePointerDown(e.clientX - rect.left, e.clientY - rect.top);
      };
      const onPointerMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        handlePointerMove(e.clientX - rect.left, e.clientY - rect.top);
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      canvas.addEventListener("pointerleave", handlePointerUp);

      let animationFrameId: number;
      const startTime = performance.now();
      const render = () => {
        guideMaterial.uniforms.time.value = (performance.now() - startTime) / 1000;
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
        if (guideCanvasRef.current) {
            guideCanvasRef.current.width = width;
            guideCanvasRef.current.height = height;
            drawGuide();
            guideTexture.needsUpdate = true;
        }
        if (guidePlaneRef.current) {
            guidePlaneRef.current.geometry.dispose();
            guidePlaneRef.current.geometry = new THREE.PlaneGeometry(width, height);
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        canvas.removeEventListener("pointerleave", handlePointerUp);
        renderer.dispose();
        brushTexture.dispose();
        brushMaterial.dispose();
        guideTexture.dispose();
        guideMaterial.dispose();
      };
    }, [currentLesson, theme]);

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
