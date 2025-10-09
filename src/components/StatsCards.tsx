// client/src/app/components/StatsCards.tsx
'use client';

import { FiUsers, FiBarChart, FiCheckCircle } from 'react-icons/fi';

interface StatsCardsProps {
  totalInsights: number;
  totalInterviews: number;
}

export function StatsCards({ totalInsights, totalInterviews }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex items-center">
        <FiCheckCircle className="text-primary h-8 w-8 mr-4" />
        <div>
          <p className="text-sm text-muted-foreground">Total Insights</p>
          <h3 className="text-2xl font-bold text-foreground">{totalInsights}</h3>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex items-center">
        <FiUsers className="text-primary h-8 w-8 mr-4" />
        <div>
          <p className="text-sm text-muted-foreground">Total Interviews</p>
          <h3 className="text-2xl font-bold text-foreground">{totalInterviews}</h3>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg shadow-sm p-6 flex items-center">
        <FiBarChart className="text-primary h-8 w-8 mr-4" />
        <div>
          <p className="text-sm text-muted-foreground">Insights Per Interview</p>
          <h3 className="text-2xl font-bold text-foreground">
            {totalInterviews > 0 ? (totalInsights / totalInterviews).toFixed(1) : 0}
          </h3>
        </div>
      </div>
    </div>
  );
}