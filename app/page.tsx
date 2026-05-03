"use client";

import CalligraphyCanvas from "@/components/CalligraphyCanvas";
import Sidebar from "@/components/Sidebar";
import FeedbackPanel from "@/components/FeedbackPanel";
import Toolbar from "@/components/Toolbar";
import AudioGuide from "@/components/AudioGuide";
import GestureController from "@/components/GestureController";
import { useRef, useState, useEffect } from "react";
import { CalligraphyCanvasHandle } from "@/components/CalligraphyCanvas";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Hand, Volume2, Undo2, Palette, Menu, X, ChevronRight, ChevronLeft } from "lucide-react";

export default function Home() {
  const canvasRef = useRef<CalligraphyCanvasHandle>(null);
  const { theme, setCanvasRef } = useStore();
  const [isStarted, setIsStarted] = useState(false);
  
  useEffect(() => {
    setCanvasRef(canvasRef);
  }, [setCanvasRef]);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileFeedback, setShowMobileFeedback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full text-2xl shadow-lg shadow-indigo-500/30 overflow-hidden transition-colors"
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
      className={`flex w-full h-screen overflow-hidden transition-colors duration-300 relative ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-[#f5f5f0] text-[#1a1a1a]"
      }`}
    >
      {/* Desktop Sidebar / Mobile Drawer Overlay */}
      <AnimatePresence>
        {(!isMobile || showMobileSidebar) && (
          <motion.div
            initial={isMobile ? { x: -320 } : false}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 lg:block ${isMobile ? 'shadow-2xl' : ''}`}
          >
            <Sidebar />
            {isMobile && (
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="absolute top-4 -right-12 p-2 bg-indigo-600 text-white rounded-r-xl shadow-lg"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      {isMobile && (showMobileSidebar || showMobileFeedback) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setShowMobileSidebar(false);
            setShowMobileFeedback(false);
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <Toolbar />
        
        {/* Mobile controls */}
        {isMobile && (
          <div className="absolute top-20 left-4 right-4 z-30 flex justify-between pointer-events-none">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100 dark:border-zinc-800 pointer-events-auto active:scale-95 transition-transform"
            >
              <Menu size={20} className="text-indigo-600" />
            </button>
            <button
              onClick={() => setShowMobileFeedback(true)}
              className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-indigo-100 dark:border-zinc-800 pointer-events-auto active:scale-95 transition-transform text-indigo-600"
            >
              <Sparkles size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative min-h-0">
          <CalligraphyCanvas ref={canvasRef} />
        </div>
      </div>

      {/* Desktop Feedback / Mobile Drawer Overlay */}
      <AnimatePresence>
        {(!isMobile || showMobileFeedback) && (
          <motion.div
            initial={isMobile ? { x: 320 } : false}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 right-0 z-50 lg:relative lg:z-0 lg:block ${isMobile ? 'shadow-2xl' : ''}`}
          >
            {isMobile && (
              <button 
                onClick={() => setShowMobileFeedback(false)}
                className="absolute top-4 -left-12 p-2 bg-indigo-600 text-white rounded-l-xl shadow-lg"
              >
                <X size={20} />
              </button>
            )}
            <FeedbackPanel canvasRef={canvasRef} />
          </motion.div>
        )}
      </AnimatePresence>

      <AudioGuide />
      <GestureController />
    </main>
  );
}
