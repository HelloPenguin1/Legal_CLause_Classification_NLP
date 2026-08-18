import React from 'react';
import { motion } from 'framer-motion';
import { History, FileText, ChevronRight } from 'lucide-react';
import { PredictionResultData } from './ResultCard';

interface HistoryItem {
  id: string;
  text: string;
  result: PredictionResultData;
  timestamp: Date;
}

interface SidebarProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ history, onSelectHistory }) => {
  return (
    <div className="w-80 h-screen hidden lg:flex flex-col border-r border-slate-200 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl transition-colors duration-500">
      <div className="p-6 pb-2 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3 text-indigo-500 dark:text-brand-400 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-brand-500/10 rounded-xl border border-indigo-100 dark:border-brand-500/20 shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-lg text-slate-800 dark:text-white font-outfit">Analysis History</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-gray-500 space-y-3">
            <FileText className="w-8 h-8 opacity-50" />
            <p className="text-sm">No history yet</p>
          </div>
        ) : (
          history.map((item, index) => (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="w-full text-left p-4 rounded-xl border border-slate-100 dark:border-transparent hover:border-indigo-200 dark:hover:border-dark-border/50 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-white/[0.08] transition-all group flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-indigo-600 dark:text-brand-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-brand-500/10 truncate max-w-[140px]">
                  {item.result.class_name}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-gray-600 group-hover:text-indigo-500 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <p className="text-sm text-slate-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {item.text}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-gray-600 font-medium">
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};
