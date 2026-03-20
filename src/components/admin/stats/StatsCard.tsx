import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
}

export function StatsCard({ title, value, icon: Icon, description, trend, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 border-2 overflow-hidden">
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
    <Card className="bg-card/50 border-2 hover:border-primary/20 transition-all duration-300 group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Icon className="w-24 h-24 rotate-12" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <Icon className="w-4 h-4 text-primary opacity-60" />
      </CardHeader>
      
      <CardContent>
        <div className="text-2xl font-bold tracking-tight mb-0.5">{value}</div>
        
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed italic opacity-80">
            {description}
          </p>
        )}
        
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
            <span>{trend.isUp ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% desde o período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
