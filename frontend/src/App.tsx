import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale, Sun, Moon } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { ResultCard, PredictionResultData } from './components/ResultCard';
import { Sidebar } from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

// Configure axios base URL
// In production, this would point to your actual backend domain
axios.defaults.baseURL = 'http://localhost:8000';

interface HistoryItem {
  id: string;
  text: string;
  result: PredictionResultData;
  timestamp: Date;
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PredictionResultData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
      // Small artificial delay for smooth transition and premium feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await axios.post('/predict', { text });
      const result: PredictionResultData = response.data;
      
      setCurrentResult(result);
      
      setHistory(prev => [{
        id: Math.random().toString(36).substring(7),
        text,
        result,
        timestamp: new Date()
      }, ...prev]);
      
    } catch (err: any) {
      console.error('Error analyzing clause:', err);
      // Fallback for UI testing if backend is not running
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        const mockResult: PredictionResultData = {
          class_name: "Governing Law",
          confidence: 0.945,
          probabilities: {
            "Governing Law": 0.945,
            "Dispute Resolution": 0.035,
            "Termination": 0.012,
            "Confidentiality": 0.005,
            "Indemnification": 0.003
          }
        };
        setCurrentResult(mockResult);
        setHistory(prev => [{
          id: Math.random().toString(36).substring(7),
          text,
          result: mockResult,
          timestamp: new Date()
        }, ...prev]);
        setError("Backend not reachable. Displaying mock data for demonstration.");
      } else {
        setError(err.response?.data?.detail || "An error occurred while analyzing the text.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setCurrentResult(item.result);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0b] text-slate-900 dark:text-gray-100 overflow-hidden relative selection:bg-brand-500/30 transition-colors duration-500">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        {isDark ? (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[120px] mix-blend-screen animate-blob" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
            <div className="absolute top-[30%] left-[30%] w-[30%] h-[30%] rounded-full bg-pink-900/20 blur-[100px] mix-blend-screen animate-blob animation-delay-4000" />
          </>
        ) : (
          <>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/40 blur-[100px] mix-blend-multiply animate-blob" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-300/40 blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
            <div className="absolute top-[30%] left-[30%] w-[30%] h-[30%] rounded-full bg-pink-200/40 blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
          </>
        )}
      </div>

      <Sidebar history={history} onSelectHistory={handleSelectHistory} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto relative custom-scrollbar z-10">
        {/* Top Navbar */}
        <header className="px-8 py-6 flex items-center justify-between sticky top-0 z-50 bg-white/40 dark:bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.02] transition-colors duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-outfit tracking-tight text-slate-900 dark:text-white">
              Clause<span className="text-gradient">Net</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-white/5 text-sm font-medium backdrop-blur-md text-emerald-700 dark:text-emerald-400 transition-colors">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                System Ready
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-start">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6 text-slate-900 dark:text-white transition-colors duration-500">
              Classify clauses with <br/> superhuman precision
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed transition-colors duration-500">
              Leverage advanced NLP to instantly categorize legal text, evaluate confidence scores, and streamline your contract review workflow.
            </p>
          </div>

          <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm max-w-4xl w-full text-center"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {currentResult && (
              <ResultCard key="result" result={currentResult} />
            )}
          </AnimatePresence>
          
          {/* Empty State / Spacer */}
          {!currentResult && !isLoading && (
             <div className="mt-20 flex flex-col items-center opacity-30 pointer-events-none transition-colors duration-500">
               <Scale className="w-32 h-32 text-slate-400 dark:text-gray-600 drop-shadow-2xl" />
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
