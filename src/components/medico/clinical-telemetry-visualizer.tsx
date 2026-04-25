"use client";

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface TelemetryData {
  timestamp: string;
  value: number;
  threshold?: number;
}

interface TelemetryVisualizerProps {
  title: string;
  description?: string;
  data: TelemetryData[];
  type?: 'line' | 'bar' | 'area';
  unit?: string;
  criticalThreshold?: number;
}

/**
 * Architectural Mapping: DeepTutor "Visualize" capability.
 * Transforms clinical data arrays into interactive Recharts visualizations.
 * Reduces cognitive load for physicians interpreting vitals and lab trends.
 */
export function ClinicalTelemetryVisualizer({
  title,
  description,
  data,
  type = 'line',
  unit = '',
  criticalThreshold
}: TelemetryVisualizerProps) {
  
  const isCritical = criticalThreshold !== undefined && data.some(d => d.value > criticalThreshold);

  return (
    <Card className="w-full shadow-lg border-primary/10 overflow-hidden bg-background/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {isCritical && (
            <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
              <AlertCircle className="h-3 w-3" />
              THRESHOLD ALERT
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="timestamp" 
                fontSize={10} 
                tickFormatter={(str) => new Date(str).toLocaleDateString()}
              />
              <YAxis fontSize={10} unit={unit} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
              {criticalThreshold && (
                <Line 
                  type="step" 
                  dataKey={() => criticalThreshold} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5" 
                  name="Threshold"
                  dot={false}
                />
              )}
            </LineChart>
          ) : type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="timestamp" fontSize={10} />
              <YAxis fontSize={10} unit={unit} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="timestamp" fontSize={10} />
              <YAxis fontSize={10} unit={unit} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={0.1} fill="hsl(var(--primary))" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
