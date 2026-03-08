import { create } from "zustand";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type NarrationMode = "Beginner" | "Advanced";

export type Lesson = {
  id: string;
  letter: string;
  description: string;
  difficulty: Difficulty;
};

export const LESSONS: Lesson[] = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  const isVowel = ["A", "E", "I", "O", "U"].includes(letter);
  return {
    id: letter,
    letter,
    description: `Practice the capital ${letter}. Focus on smooth, deliberate strokes.`,
    difficulty: isVowel ? "Beginner" : (i % 3 === 0 ? "Advanced" : "Intermediate"),
  };
});

export type BrushType = "flat" | "round" | "pointed" | "chisel" | "marker" | "fountain" | "ballpoint";

interface AppState {
  currentLesson: Lesson;
  setCurrentLesson: (lesson: Lesson) => void;
  feedback: string | null;
  score: number | null;
  setFeedback: (feedback: string | null, score: number | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  canvasRef: React.RefObject<any> | null;
  setCanvasRef: (ref: React.RefObject<any>) => void;
  
  // Creative Toolkit
  brushType: BrushType;
  setBrushType: (type: BrushType) => void;
  color: string;
  setColor: (color: string) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  thickness: number;
  setThickness: (thickness: number) => void;
  
  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  
  // Ghost Hand
  showGhostHand: boolean;
  setShowGhostHand: (show: boolean) => void;
  ghostHandOpacity: number;
  setGhostHandOpacity: (opacity: number) => void;
  
  // Audio Guide
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  narrationMode: NarrationMode;
  setNarrationMode: (mode: NarrationMode) => void;

  // History (Undo/Redo)
  history: string[];
  historyIndex: number;
  pushHistory: (dataUrl: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>((set) => ({
  currentLesson: LESSONS[0],
  setCurrentLesson: (lesson) =>
    set({ currentLesson: lesson, feedback: null, score: null, history: [], historyIndex: -1 }),
  feedback: null,
  score: null,
  setFeedback: (feedback, score) => set({ feedback, score }),
  isAnalyzing: false,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  canvasRef: null,
  setCanvasRef: (ref) => set({ canvasRef: ref }),
  
  brushType: "fountain",
  setBrushType: (type) => set({ brushType: type }),
  color: "#FF4500", // Default to a fun color
  setColor: (color) => set({ color }),
  opacity: 0.8,
  setOpacity: (opacity) => set({ opacity }),
  thickness: 15,
  setThickness: (thickness) => set({ thickness }),
  
  theme: "light",
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  
  showGhostHand: true,
  setShowGhostHand: (show) => set({ showGhostHand: show }),
  ghostHandOpacity: 0.5,
  setGhostHandOpacity: (opacity) => set({ ghostHandOpacity: opacity }),
  
  audioEnabled: false,
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  narrationMode: "Beginner",
  setNarrationMode: (mode) => set({ narrationMode: mode }),

  history: [],
  historyIndex: -1,
  pushHistory: (dataUrl) => set((state) => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(dataUrl);
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  }),
  undo: () => set((state) => ({
    historyIndex: Math.max(0, state.historyIndex - 1)
  })),
  redo: () => set((state) => ({
    historyIndex: Math.min(state.history.length - 1, state.historyIndex + 1)
  })),
  clearHistory: () => set({ history: [], historyIndex: -1 }),
}));
