"use client";

import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import { Loader2, Sparkles, RotateCcw, Check, Star } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { CalligraphyCanvasHandle } from "./CalligraphyCanvas";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { playSound } from "@/utils/sounds";

export default function FeedbackPanel({
  canvasRef,
}: {
  canvasRef: React.RefObject<CalligraphyCanvasHandle | null>;
}) {
  const {
    currentLesson,
    feedback,
    score,
    setFeedback,
    isAnalyzing,
    setIsAnalyzing,
    theme,
  } = useStore();
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark";

  const handleAnalyze = async () => {
    if (!canvasRef.current) return;

    setIsAnalyzing(true);
    setError(null);
    setFeedback(null, null);

    try {
      const dataUrl = canvasRef.current.getScreenshot();
      // Remove the data:image/png;base64, part
      const base64Data = dataUrl.split(",")[1];

      const ai = new GoogleGenAI({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      });

      const prompt = `You are an encouraging kindergarten teacher. The user is practicing the letter '${currentLesson.letter}'. Analyze their stroke, proportions, and smoothness from the provided image. Provide constructive feedback in 2-3 short, simple, and joyful sentences. Rate it out of 10. Return the response in JSON format with two keys: "feedback" (string) and "score" (number).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: "application/json",
        },
      });

      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);
      
      const finalScore = result.score || 0;

      setFeedback(
        result.feedback || "Great job! You're doing amazing!",
        finalScore,
      );
      
      if (finalScore >= 7) {
        playSound('cheer');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3']
        });
      } else {
        playSound('pop');
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Oops! Something went wrong. Let's try again!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setFeedback(null, null);
      setError(null);
      playSound('pop');
    }
  };

  return (
    <div
      className={`w-80 shrink-0 h-full border-l flex flex-col transition-colors duration-300 ${
        isDark
          ? "bg-zinc-950 border-zinc-800 text-zinc-100"
          : "bg-white border-[#e5e5e0] text-[#1a1a1a]"
      }`}
    >
      <div
        className={`p-6 border-b ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-[#f5f5f0] border-[#e5e5e0]"
        }`}
      >
        <h2 className="font-bubbly text-2xl font-bold mb-2 text-indigo-500">
          Practice: {currentLesson.letter}
        </h2>
        <p
          className={`text-sm leading-relaxed ${
            isDark ? "text-zinc-400" : "text-[#5A5A40]"
          }`}
        >
          {currentLesson.description}
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center items-center relative">
        <AnimatePresence mode="wait">
          {!feedback && !isAnalyzing && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center opacity-50 absolute"
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <p className="text-sm font-bubbly">
                Draw your letter on the canvas and request feedback.
              </p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center absolute"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-indigo-400" />
              <p className="text-sm font-bubbly">
                Analyzing your strokes...
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-center p-4 rounded-2xl border absolute w-[calc(100%-3rem)] ${
                isDark
                  ? "bg-rose-950/50 border-rose-900 text-rose-400"
                  : "bg-rose-50 border-rose-100 text-rose-600"
              }`}
            >
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {feedback && !isAnalyzing && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full p-6 rounded-3xl border shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${
                isDark
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-[#f5f5f0] border-[#e5e5e0]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">
                  Star Rating
                </h3>
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700"
                      : "bg-white border-[#e5e5e0]"
                  }`}
                >
                  <span className="text-lg font-bubbly font-medium flex gap-1 text-yellow-500">
                    {Array.from({ length: Math.ceil((score || 0) / 2) }).map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed font-bubbly">
                &quot;{feedback}&quot;
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`p-6 border-t flex gap-3 ${
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-[#f5f5f0] border-[#e5e5e0]"
        }`}
      >
        <button
          onClick={handleClear}
          disabled={isAnalyzing}
          className={`flex-1 py-3 px-4 rounded-full border text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
            isDark
              ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-100"
              : "bg-white border-[#e5e5e0] hover:bg-gray-50 text-[#1a1a1a]"
          }`}
        >
          <RotateCcw size={16} />
          Clear
        </button>
        <button
          onClick={() => {
            handleAnalyze();
            playSound('pop');
          }}
          disabled={isAnalyzing}
          className={`flex-1 py-3 px-4 rounded-full text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md`}
          style={{ backgroundImage: 'linear-gradient(to right, #FF0000, #FF7F00, #FBBF24, #00FF00, #3B82F6, #4B0082, #9400D3)' }}
        >
          {isAnalyzing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Analyze
        </button>
      </div>
    </div>
  );
}
