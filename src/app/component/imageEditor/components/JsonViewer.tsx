import React, { useState } from 'react';
import { Copy, Check, FileJson } from 'lucide-react';

interface JsonViewerProps {
  data: unknown;
  title?: string;
  badgeText?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title = 'JSON Output', badgeText }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = data ? JSON.stringify(data, null, 2) : '';

  const handleCopy = () => {
    if (!jsonString) return;
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const derivedBadge = badgeText
    ? badgeText
    : (() => {
        if (!data || typeof data !== 'object') return undefined;
        const maybeVocabularyList = (data as { vocabulary_list?: unknown }).vocabulary_list;
        if (Array.isArray(maybeVocabularyList)) {
          return `${maybeVocabularyList.length} items`;
        }
        return undefined;
      })();

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
            {derivedBadge && (
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full">
                {derivedBadge}
              </span>
            )}
        </div>
        
        <button
          onClick={handleCopy}
          disabled={!jsonString}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            copied 
              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50' 
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 ring-1 ring-slate-700'
          } ${!jsonString ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {!jsonString ? (
           <span className="text-slate-600 italic">No data available...</span>
        ) : (
            <pre className="whitespace-pre">{jsonString}</pre>
        )}
      </div>
    </div>
  );
};
