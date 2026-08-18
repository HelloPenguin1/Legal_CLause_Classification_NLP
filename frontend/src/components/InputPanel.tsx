import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface InputPanelProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onAnalyze(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-500" />
        <form 
          onSubmit={handleSubmit}
          className="relative glass-panel rounded-2xl p-4 flex flex-col gap-4 transition-colors duration-500"
        >
          <div className="flex items-start gap-4">
            <div className="mt-2 p-2 rounded-xl bg-indigo-50 dark:bg-brand-500/10 text-indigo-500 dark:text-brand-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your legal clause here... (Press Cmd/Ctrl + Enter to analyze)"
              className="flex-1 w-full min-h-[120px] bg-transparent text-slate-800 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500 resize-none outline-none text-lg font-outfit leading-relaxed py-2 custom-scrollbar transition-colors"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-white/5 pt-4 mt-2 transition-colors duration-500">
            <div className="text-sm text-slate-500 dark:text-gray-500 font-outfit">
              {text.length} characters
            </div>
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className={cn(
                "relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 overflow-hidden",
                !text.trim() || isLoading
                  ? "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <Send className="w-4 h-4" />
                  </>
                )}
              </span>
              {text.trim() && !isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
