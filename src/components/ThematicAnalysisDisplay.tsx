'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Theme {
  theme_title: string;
  description: string;
  supporting_quotes: string[];
  sentiment: string;
}

interface ThematicAnalysisDisplayProps {
  analysis: {
    thematic_analysis: Theme[];
  } | null;
}

export function ThematicAnalysisDisplay({ analysis }: ThematicAnalysisDisplayProps) {
  if (!analysis || !analysis.thematic_analysis) {
    return null; // Don't render anything if there's no data
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Thematic Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis.thematic_analysis.map((theme, index) => (
          <div key={index} className="border-t border-border pt-4">
            <h4 className="font-semibold text-lg text-foreground">{theme.theme_title}</h4>
            <p className="text-muted-foreground text-sm mt-1">{theme.description}</p>
            <div className="mt-3 space-y-2">
              {theme.supporting_quotes.map((quote, qIndex) => (
                <blockquote key={qIndex} className="border-l-4 border-accent pl-4 italic text-sm text-muted-foreground">
                  "{quote}"
                </blockquote>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}