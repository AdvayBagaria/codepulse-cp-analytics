import React from 'react';
import { cn } from '../lib/utils';

type LoadingSkeletonProps = {
  lines?: number;
  className?: string;
};

export default function LoadingSkeleton({ lines = 4, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'skeleton h-4 rounded-lg',
            index === 0 && 'h-6 w-2/3',
            index === lines - 1 && lines > 1 && 'w-5/6'
          )}
        />
      ))}
    </div>
  );
}
