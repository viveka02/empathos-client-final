'use client';

import { AreaChart, BarChart, DonutChart, Title } from '@tremor/react';

const valueFormatter = (number: number) => `${new Intl.NumberFormat("us").format(number).toString()}`;

interface ChartData {
  name: string;
  value: number;
}

interface InsightsChartsProps {
  categoryData: ChartData[];
  sentimentData: ChartData[];
}

export function InsightsCharts({ categoryData, sentimentData }: InsightsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <Title>Insights by Category</Title>
        <AreaChart
          className="mt-6"
          data={categoryData}
          index="name"
          categories={["value"]}
          colors={["blue"]}
          valueFormatter={valueFormatter}
          yAxisWidth={30}
        />
      </div>
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <Title>Sentiment Distribution</Title>
        <DonutChart
          className="mt-6"
          data={sentimentData}
          category="value"
          index="name"
          valueFormatter={valueFormatter}
          colors={["active", "destructive", "muted"]}
        />
      </div>
    </div>
  );
}