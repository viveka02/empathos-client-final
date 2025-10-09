'use client';

import { cn } from "@/lib/utils";

interface BadgeProps {
  color: 'green' | 'red' | 'orange' | 'yellow' | 'gray';
  text: string;
}

export function Badge({ color, text }: BadgeProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", colorClasses[color])}>
      {text}
    </span>
  );
}