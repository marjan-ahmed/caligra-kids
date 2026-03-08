"use client";

import React from "react";
import { useStore, LESSONS } from "@/store/useStore";
import { PenTool, Moon, Sun } from "lucide-react";
import { playSound } from "@/utils/sounds";

export default function Sidebar() {
  const { currentLesson, setCurrentLesson, theme, toggleTheme } = useStore();
  const isDark = theme === "dark";

  return (
    <div
      className={`w-80 shrink-0 h-full border-r flex flex-col transition-colors duration-300 ${
        isDark
          ? "bg-zinc-950 border-zinc-800 text-zinc-100"
          : "bg-[#f5f5f0] border-[#e5e5e0] text-[#1a1a1a]"
      }`}
    >
      <div
        className={`p-6 border-b flex justify-between items-center ${
          isDark ? "border-zinc-800" : "border-[#e5e5e0]"
        }`}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <PenTool size={20} />
            </div>
            <h1 
              className="font-bubbly text-3xl font-bold text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(to right, #FF0000, #FF7F00, #FBBF24, #00FF00, #3B82F6, #4B0082, #9400D3)' }}
            >
              Calligra Kids
            </h1>
          </div>
          <p
            className={`text-sm opacity-80 font-bubbly ${
              isDark ? "text-zinc-400" : "text-[#5A5A40]"
            }`}
          >
            Learn to write with magic!
          </p>
        </div>
        <button
          onClick={() => {
            toggleTheme();
            playSound('pop');
          }}
          className={`p-2 rounded-full transition-colors ${
            isDark
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              : "bg-white hover:bg-zinc-100 text-zinc-600 shadow-sm"
          }`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 px-2">
          A-Z Practice
        </h2>
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => {
              setCurrentLesson(lesson);
              playSound('pop');
            }}
            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${
              currentLesson.id === lesson.id
                ? isDark
                  ? "bg-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-zinc-700"
                  : "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e5e5e0]"
                : isDark
                ? "hover:bg-zinc-900/50 border border-transparent"
                : "hover:bg-white/50 border border-transparent"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bubbly text-4xl font-bold text-indigo-500">
                {lesson.letter}
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                  lesson.difficulty === "Beginner"
                    ? isDark
                      ? "bg-emerald-900/30 text-emerald-400"
                      : "bg-emerald-100 text-emerald-800"
                    : lesson.difficulty === "Intermediate"
                    ? isDark
                      ? "bg-amber-900/30 text-amber-400"
                      : "bg-amber-100 text-amber-800"
                    : isDark
                    ? "bg-rose-900/30 text-rose-400"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {lesson.difficulty}
              </span>
            </div>
            <p
              className={`text-xs leading-relaxed line-clamp-2 ${
                isDark ? "text-zinc-400" : "text-[#5A5A40]"
              }`}
            >
              {lesson.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
