import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { FaTrophy, FaStar, FaBolt, FaHome, FaRedo, FaGamepad } from "react-icons/fa";

interface Question {
  question: string;
  options: string[];
  answer: number;
  category: string;
}

const allQuestions: Question[] = [
  { question: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperText and links Markup Language", "None"], answer: 0, category: "Web Dev" },
  { question: "Which language runs in a web browser?", options: ["Java", "C", "Python", "JavaScript"], answer: 3, category: "Web Dev" },
  { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, category: "DSA" },
  { question: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Tree"], answer: 1, category: "DSA" },
  { question: "What is a closure in JavaScript?", options: ["A loop", "A function with access to its outer scope", "A CSS property", "An HTML tag"], answer: 1, category: "JavaScript" },
  { question: "Which keyword declares a constant in JS?", options: ["var", "let", "const", "def"], answer: 2, category: "JavaScript" },
  { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], answer: 1, category: "Web Dev" },
  { question: "What is the output of typeof null?", options: ["null", "undefined", "object", "string"], answer: 2, category: "JavaScript" },
  { question: "Which algorithm is used in Git merge?", options: ["DFS", "BFS", "3-way merge", "Dijkstra"], answer: 2, category: "DSA" },
  { question: "What is React?", options: ["A database", "A UI library", "A backend framework", "A CSS framework"], answer: 1, category: "React" },
  { question: "What hook manages state in React?", options: ["useEffect", "useContext", "useState", "useRef"], answer: 2, category: "React" },
  { question: "What is the virtual DOM?", options: ["A real browser DOM", "A lightweight copy of the real DOM", "A CSS engine", "A JavaScript engine"], answer: 1, category: "React" },
];

const TOTAL_TIME = 15;

const Gamification: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"menu" | "playing" | "result">("menu");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [answered, setAnswered] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [category, setCategory] = useState("All");
  const [answers, setAnswers] = useState<boolean[]>([]);

  const categories = ["All", "Web Dev", "JavaScript", "DSA", "React"];

  const startGame = () => {
    const pool = category === "All"
      ? allQuestions
      : allQuestions.filter(q => q.category === category);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    setCurrent(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(TOTAL_TIME);
    setAnswered(false);
    setSelected(null);
    setXpEarned(0);
    setAnswers([]);
    setGameState("playing");
  };

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const correct = idx === questions[current].answer;
    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (correct) {
      const bonus = timeLeft > 10 ? 3 : timeLeft > 5 ? 2 : 1;
      const newStreak = streak + 1;
      const xp = 10 * bonus + (newStreak >= 3 ? 5 : 0);
      setScore(s => s + xp);
      setXpEarned(e => e + xp);
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setGameState("result");
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(TOTAL_TIME);
      }
    }, 1000);
  }, [answered, questions, current, streak, timeLeft, answers]);

  useEffect(() => {
    if (gameState !== "playing" || answered) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameState, answered, handleAnswer]);

  const pct = questions.length > 0 ? Math.round((score / (questions.length * 30)) * 100) : 0;
  const grade = pct >= 80 ? "🏆 Excellent!" : pct >= 60 ? "⭐ Good Job!" : pct >= 40 ? "📚 Keep Learning!" : "💪 Try Again!";

  if (gameState === "menu") return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🎮</div>
          <h1 className="text-5xl font-extrabold text-white mb-2">Skill Quiz</h1>
          <p className="text-purple-300 text-lg">Test your knowledge, earn XP, climb the ranks!</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h3 className="text-white font-bold mb-4 text-lg">Choose Category</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`py-2.5 px-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  category === c
                    ? "bg-purple-500 border-purple-400 text-white scale-105"
                    : "border-white/20 text-white/70 hover:border-purple-400 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            <div className="bg-white/10 rounded-2xl p-3">
              <FaTrophy className="text-yellow-400 text-2xl mx-auto mb-1" />
              <p className="text-white text-xs">Earn XP</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <FaBolt className="text-cyan-400 text-2xl mx-auto mb-1" />
              <p className="text-white text-xs">Streak Bonus</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <FaStar className="text-pink-400 text-2xl mx-auto mb-1" />
              <p className="text-white text-xs">8 Questions</p>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:scale-105 hover:shadow-[0_10px_40px_rgba(168,85,247,0.5)] transition-all"
          >
            🚀 Start Quiz
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full mt-3 py-3 rounded-2xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2"
          >
            <FaHome /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  if (gameState === "playing" && questions[current]) {
    const q = questions[current];
    const progress = ((current) / questions.length) * 100;
    const timeWarning = timeLeft <= 5;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">{current + 1}/{questions.length}</span>
              <span className="bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm">{q.category}</span>
            </div>
            <div className="flex items-center gap-4">
              {streak >= 2 && (
                <span className="flex items-center gap-1 text-orange-400 font-bold animate-bounce">
                  🔥 {streak}x
                </span>
              )}
              <span className="text-yellow-400 font-bold">⚡ {score} XP</span>
            </div>
          </div>

          {/* Progress */}
          <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Timer */}
          <div className={`flex items-center justify-center mb-6 ${timeWarning ? "animate-pulse" : ""}`}>
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-extrabold text-2xl ${
              timeWarning ? "border-red-400 text-red-400" : "border-purple-400 text-white"
            }`}>
              {timeLeft}
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-6">
            <h2 className="text-white text-xl font-bold text-center leading-relaxed">{q.question}</h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              let style = "border-white/20 bg-white/5 text-white hover:border-purple-400 hover:bg-purple-500/20";
              if (answered) {
                if (idx === q.answer) style = "border-green-400 bg-green-500/20 text-green-300";
                else if (idx === selected && selected !== q.answer) style = "border-red-400 bg-red-500/20 text-red-300";
                else style = "border-white/10 bg-white/5 text-white/40";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full py-4 px-6 rounded-2xl border-2 font-semibold text-left transition-all ${style} ${!answered ? "hover:scale-[1.02] cursor-pointer" : "cursor-default"}`}
                >
                  <span className="inline-block w-8 h-8 rounded-lg bg-white/10 text-center leading-8 mr-3 text-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "result") return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="text-8xl mb-4 animate-bounce">{pct >= 60 ? "🏆" : "📚"}</div>
        <h1 className="text-4xl font-extrabold text-white mb-2">{grade}</h1>

        <div className="grid grid-cols-3 gap-4 my-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20">
            <p className="text-purple-300 text-sm mb-1">Score</p>
            <p className="text-white text-3xl font-extrabold">{score}</p>
            <p className="text-white/50 text-xs">XP Earned</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20">
            <p className="text-green-300 text-sm mb-1">Correct</p>
            <p className="text-white text-3xl font-extrabold">{answers.filter(Boolean).length}/{questions.length}</p>
            <p className="text-white/50 text-xs">Questions</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20">
            <p className="text-orange-300 text-sm mb-1">Best Streak</p>
            <p className="text-white text-3xl font-extrabold">{maxStreak}🔥</p>
            <p className="text-white/50 text-xs">Answers</p>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white/10 rounded-2xl p-4 mb-6 text-left">
          <h3 className="text-white font-bold mb-3">Answer Summary</h3>
          <div className="flex gap-2 flex-wrap">
            {answers.map((a, i) => (
              <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${a ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <FaRedo /> Play Again
          </button>
          <button
            onClick={() => setGameState("menu")}
            className="w-full py-3 rounded-2xl border border-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <FaGamepad /> Change Category
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-2xl border border-white/20 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <FaHome /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return null;
};

export default Gamification;
