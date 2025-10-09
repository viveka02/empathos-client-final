'use client';

import { ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';

interface AISuggestionsProps {
  analysis: string | null;
  loading: boolean;
  onAnalyze: () => void;
}

export function AISuggestions({ analysis, loading, onAnalyze }: AISuggestionsProps) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">AI-Generated Suggestions</h2>
        <p className="text-sm text-muted">Actionable recommendations based on user research insights.</p>
      </div>
      <div className="p-6">
        {loading ? (
          <p>Analyzing...</p>
        ) : analysis ? (
          <div className="space-y-4">
            <article className="p-4 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-100 rounded-md">Critical</span>
                  <span className="px-2 py-1 text-xs font-medium text-muted-foreground bg-gray-100 rounded-md">Analysis</span>
                </div>
                <button className="flex items-center text-sm font-semibold text-foreground hover:text-accent">
                  View Details <ArrowRight className="ml-2"/>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground mt-4">{analysis}</pre>
              <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-muted">
                      <strong>Impact:</strong> High &nbsp;&nbsp; <strong>Effort:</strong> Medium
                  </div>
                  <div className="flex space-x-2 text-muted">
                      <button className="hover:text-primary"><ThumbsUp /></button>
                      <button className="hover:text-primary"><ThumbsDown /></button>
                  </div>
              </div>
            </article>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted">No interviews have been analyzed yet.</p>
            <button 
              onClick={onAnalyze}
              className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90"
            >
              Analyze Interviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}