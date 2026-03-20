import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  isLoading,
  className 
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("bg-card border rounded-[5px] overflow-hidden shadow-none", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "bg-card border rounded-[5px] transition-all duration-200 group overflow-hidden relative shadow-none hover-yellow",
      className
    )}>
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Icon className="w-24 h-24 rotate-12" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold tracking-tight mb-0.5">{value}</div>
        
        {description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium opacity-70">
            {description}
          </p>
        )}
        
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
