'use client';

import React from 'react';
import { useStore, BrushType } from '@/store/useStore';
import { PenTool, Paintbrush, Highlighter, Pencil, Circle, Square, Minus, Hand, Volume2, VolumeX, GraduationCap, Undo2, Redo2 } from 'lucide-react';
import { playSound } from '@/utils/sounds';

const BRUSHES: { type: BrushType; icon: React.ReactNode; label: string }[] = [
  { type: 'fountain', icon: <PenTool size={18} />, label: 'Fountain Pen' },
  { type: 'pointed', icon: <Paintbrush size={18} />, label: 'Pointed Brush' },
  { type: 'flat', icon: <Minus size={18} className="rotate-45" />, label: 'Flat Brush' },
  { type: 'chisel', icon: <Square size={18} />, label: 'Chisel Marker' },
  { type: 'marker', icon: <Highlighter size={18} />, label: 'Marker' },
  { type: 'round', icon: <Circle size={18} />, label: 'Round Brush' },
  { type: 'ballpoint', icon: <Pencil size={18} />, label: 'Ballpoint' },
];

const COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3', // Violet
];

export default function Toolbar() {
  const {
    brushType, setBrushType,
    color, setColor,
    opacity, setOpacity,
    thickness, setThickness,
    theme,
    showGhostHand, setShowGhostHand,
    ghostHandOpacity, setGhostHandOpacity,
    audioEnabled, setAudioEnabled,
    narrationMode, setNarrationMode
  } = useStore();

  const isDark = theme === 'dark';

  return (
    <div className={`h-16 w-full border-b flex items-center px-6 gap-8 transition-colors duration-300 ${
      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-[#e5e5e0] text-[#1a1a1a]'
    }`}>
      
      {/* Brushes */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest opacity-50 mr-2">Tool</span>
        <div className={`flex p-1 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          {BRUSHES.map((brush) => (
            <button
              key={brush.type}
              onClick={() => {
                setBrushType(brush.type);
                playSound('pop');
              }}
              title={brush.label}
              className={`p-2 rounded-lg transition-all ${
                brushType === brush.type
                  ? isDark 
                    ? 'bg-zinc-700 shadow-sm text-indigo-400' 
                    : 'bg-white shadow-sm text-indigo-600'
                  : isDark
                    ? 'hover:bg-zinc-700/50 opacity-70 hover:opacity-100'
                    : 'hover:bg-zinc-200 opacity-70 hover:opacity-100'
              }`}
            >
              {brush.icon}
            </button>
          ))}
        </div>
      </div>

      <div className={`w-px h-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

      {/* Colors */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest opacity-50 mr-2">Color</span>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                playSound('pop');
              }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c 
                  ? isDark ? 'scale-125 border-zinc-900 shadow-md' : 'scale-125 border-white shadow-md' 
                  : 'border-transparent hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
            }}
            className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      <div className={`w-px h-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

      {/* Thickness */}
      <div className="flex items-center gap-3 flex-1 max-w-[200px]">
        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Size</span>
        <input
          type="range"
          min="1"
          max="50"
          value={thickness}
          onChange={(e) => setThickness(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <span className="text-xs font-mono w-6 text-right">{thickness}</span>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-3 flex-1 max-w-[150px]">
        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Flow</span>
        <input
          type="range"
          min="10"
          max="100"
          value={opacity * 100}
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          className="w-full accent-indigo-600"
        />
        <span className="text-xs font-mono w-8 text-right">{Math.round(opacity * 100)}%</span>
      </div>

      <div className={`w-px h-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

      {/* Ghost Hand */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setShowGhostHand(!showGhostHand);
            playSound('giggle');
          }}
          className={`p-2 rounded-lg transition-all ${
            showGhostHand
              ? isDark 
                ? 'bg-indigo-900/50 text-indigo-400' 
                : 'bg-indigo-100 text-indigo-600'
              : isDark
                ? 'hover:bg-zinc-700/50 opacity-70 hover:opacity-100'
                : 'hover:bg-zinc-200 opacity-70 hover:opacity-100'
          }`}
          title="Toggle Ghost Hand"
        >
          <Hand size={18} />
        </button>
        {showGhostHand && (
          <input
            type="range"
            min="10"
            max="100"
            value={ghostHandOpacity * 100}
            onChange={(e) => setGhostHandOpacity(Number(e.target.value) / 100)}
            className="w-16 accent-indigo-600"
            title="Ghost Hand Opacity"
          />
        )}
      </div>

      <div className={`w-px h-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

      {/* Audio Guide */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setAudioEnabled(!audioEnabled);
            playSound('pop');
          }}
          className={`p-2 rounded-lg transition-all ${
            audioEnabled
              ? isDark
                ? 'bg-indigo-900/50 text-indigo-400'
                : 'bg-indigo-100 text-indigo-600'
              : isDark
                ? 'hover:bg-zinc-700/50 opacity-70 hover:opacity-100'
                : 'hover:bg-zinc-200 opacity-70 hover:opacity-100'
          }`}
          title="Toggle Audio Guide"
        >
          {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {audioEnabled && (
          <button
            onClick={() => {
              setNarrationMode(narrationMode === 'Beginner' ? 'Advanced' : 'Beginner');
              playSound('pop');
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'
            }`}
          >
            <GraduationCap size={14} />
            {narrationMode}
          </button>
        )}
      </div>

      <div className={`w-px h-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

      {/* Undo / Redo */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => {
            const canvas = useStore.getState().canvasRef?.current;
            if (canvas) canvas.undo();
            playSound('pop');
          }}
          className={`p-2 rounded-full transition-all ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-black'
          }`}
          title="Undo"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={() => {
            const canvas = useStore.getState().canvasRef?.current;
            if (canvas) canvas.redo();
            playSound('pop');
          }}
          className={`p-2 rounded-full transition-all ${
            isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-black'
          }`}
          title="Redo"
        >
          <Redo2 size={20} />
        </button>
      </div>

    </div>
  );
}
