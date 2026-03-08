"use client";

import CalligraphyCanvas from "@/components/CalligraphyCanvas";
import Sidebar from "@/components/Sidebar";
import FeedbackPanel from "@/components/FeedbackPanel";
import Toolbar from "@/components/Toolbar";
import AudioGuide from "@/components/AudioGuide";
import { useRef, useState } from "react";
import { CalligraphyCanvasHandle } from "@/components/CalligraphyCanvas";
import { useStore } from "@/store/useStore";
import { motion } from "motion/react";
import { Sparkles, Hand, Volume2, Undo2, Palette } from "lucide-react";

export default function Home() {
  const canvasRef = useRef<CalligraphyCanvasHandle>(null);
  const { theme } = useStore();
  const [isStarted, setIsStarted] = useState(false);
  const isDark = theme === "dark";

  if (!isStarted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-100 to-indigo-100 flex flex-col items-center justify-center p-8 font-bubbly text-zinc-800 overflow-hidden relative">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce text-red-500 font-black" style={{ animationDuration: '3s' }}>A</div>
        <div className="absolute top-20 right-20 text-7xl opacity-30 animate-bounce text-orange-500 font-black" style={{ animationDuration: '4s' }}>B</div>
        <div className="absolute bottom-20 left-1/4 text-8xl opacity-30 animate-bounce text-yellow-500 font-black" style={{ animationDuration: '5s' }}>C</div>
        <div className="absolute top-1/2 right-10 text-5xl opacity-30 animate-bounce text-green-500 font-black" style={{ animationDuration: '3.5s' }}>D</div>
        <div className="absolute bottom-10 right-1/3 text-6xl opacity-30 animate-bounce text-blue-500 font-black" style={{ animationDuration: '4.5s' }}>E</div>
        <div className="absolute top-1/3 left-20 text-7xl opacity-30 animate-bounce text-indigo-500 font-black" style={{ animationDuration: '5.5s' }}>F</div>
        <div className="absolute bottom-1/3 left-10 text-5xl opacity-30 animate-bounce text-purple-500 font-black" style={{ animationDuration: '3.2s' }}>G</div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-center z-10 max-w-4xl"
        >
          <h1 
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text mb-6 drop-shadow-sm"
            style={{ backgroundImage: 'linear-gradient(to right, #FF0000, #FF7F00, #FBBF24, #00FF00, #3B82F6, #4B0082, #9400D3)' }}
          >
            Calligra Kids!
          </h1>
          <p className="text-xl md:text-2xl text-indigo-900/80 mb-12 max-w-2xl mx-auto">
            Learn the alphabet with magical glowing trails, rainbow colors, and a friendly AI coach!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Hand, title: "Ghost Hand", desc: "Follow the glowing trail to learn perfect strokes!", color: "bg-red-100 text-red-500" },
              { icon: Volume2, title: "Audio Coach", desc: "Friendly voice guidance cheers you on!", color: "bg-orange-100 text-orange-500" },
              { icon: Palette, title: "Fun Tools", desc: "Rainbow colors and magical brushes!", color: "bg-green-100 text-green-500" },
              { icon: Undo2, title: "Oopsies OK!", desc: "Easy undo buttons make learning stress-free.", color: "bg-blue-100 text-blue-500" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white p-6 rounded-3xl shadow-xl shadow-indigo-100/50 flex flex-col items-center text-center border-2 border-transparent hover:border-indigo-200 transition-colors"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-4 rotate-3`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-zinc-800">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsStarted(true)}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white rounded-full text-2xl shadow-lg overflow-hidden"
            style={{ backgroundImage: 'linear-gradient(to right, #FF0000, #FF7F00, #FBBF24, #00FF00, #3B82F6, #4B0082, #9400D3)' }}
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <Sparkles className="mr-3 animate-pulse" />
            Start Learning!
          </motion.button>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className={`flex w-full h-screen overflow-hidden transition-colors duration-300 ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-[#f5f5f0] text-[#1a1a1a]"
      }`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 p-8 flex flex-col items-center justify-center relative min-h-0">
          <CalligraphyCanvas ref={canvasRef} />
        </div>
      </div>
      <FeedbackPanel canvasRef={canvasRef} />
      <AudioGuide />
    </main>
  );
}
