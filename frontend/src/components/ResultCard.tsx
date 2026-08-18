import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Copy, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface PredictionResultData {
  class_name: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface ResultCardProps {
  result: PredictionResultData;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [isDark, setIsDark] = useState(true);

  // Quick observer to catch dark mode changes for recharts colors
  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const chartData = Object.entries(result.probabilities)
    .slice(0, 4) // Show top 4
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100),
      raw: value
    }));

  const handleCopy = () => {
    navigator.clipboard.writeText(result.class_name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      className="w-full max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-indigo-500/20" />
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-500 dark:text-gray-400 font-medium text-sm">Prediction</h3>
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Copy prediction"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gradient pb-1 font-outfit break-words">
              {result.class_name}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-500 dark:text-gray-400">Confidence Score</span>
              <span className="text-2xl font-semibold text-slate-900 dark:text-white font-outfit">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-dark-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-brand-500 dark:to-purple-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 transition-colors duration-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <h3 className="font-medium text-slate-800 dark:text-gray-200">Analysis Notes</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            The AI model has analyzed the semantic structure and terminology of your clause. High confidence indicates strong alignment with typical '{result.class_name}' patterns in our training corpus.
          </p>
        </div>
      </div>

      <div className="md:col-span-2 glass-panel rounded-2xl p-6 flex flex-col transition-colors duration-500">
        <div className="flex items-center gap-3 mb-6">
          <BarChart2 className="w-5 h-5 text-indigo-500 dark:text-brand-400" />
          <h3 className="font-medium text-slate-800 dark:text-gray-200">Probability Distribution</h3>
        </div>
        
        <div className="flex-1 min-h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 12, fontFamily: 'Outfit' }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                contentStyle={{ 
                  backgroundColor: isDark ? '#131316' : '#ffffff', 
                  border: isDark ? '1px solid #27272a' : 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: isDark ? '#e0e7ff' : '#1e293b' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#colorBrand)' : (isDark ? '#27272a' : '#cbd5e1')} />
                ))}
              </Bar>
              <defs>
                <linearGradient id="colorBrand" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
