'use client';

import { BarChart, DonutChart, Title } from '@tremor/react';

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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 bg-card border border-border rounded-lg shadow-sm p-6">
        <Title>Insights by Category</Title>
        <BarChart
          className="mt-6"
          data={categoryData}
          index="name"
          categories={["value"]}
          colors={["indigo"]}
          valueFormatter={valueFormatter}
          yAxisWidth={48}
        />
      </div>
      <div className="lg:col-span-2 bg-card border border-border rounded-lg shadow-sm p-6">
        <Title>Sentiment Distribution</Title>
        <DonutChart
          className="mt-6"
          data={sentimentData}
          category="value"
          index="name"
          valueFormatter={valueFormatter}
          colors={["emerald", "rose", "slate"]}
        />
      </div>
    </div>
  );
}