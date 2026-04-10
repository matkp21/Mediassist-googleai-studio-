// src/components/markdown/mermaid-renderer.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '@/contexts/theme-provider';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MermaidRendererProps {
  chart: string;
}

// Generate a unique ID for each renderer instance
let idCounter = 0;
const generateId = () => `mermaid-chart-${idCounter++}`;

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartId = useRef(generateId());

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      logLevel: 'fatal',
      themeVariables: {
        primaryColor: '#3b82f6', // blue-500
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#3b82f6',
        lineColor: resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db', // gray-600 dark:gray-400
        textColor: resolvedTheme === 'dark' ? '#f9fafb' : '#111827', // gray-50 dark:gray-900
        mainBkg: resolvedTheme === 'dark' ? 'hsl(var(--card))' : 'hsl(var(--card))',
        errorBkgColor: '#fef2f2',
        errorTextColor: '#b91c1c',
      }
    });

    const renderChart = async () => {
      setIsLoading(true);
      setError(null);
      setSvg(null);
      try {
        if (chart) {
            // The mermaid.render function is asynchronous and returns the SVG code
            const { svg: renderedSvg } = await mermaid.render(chartId.current, chart);
            setSvg(renderedSvg);
        }
      } catch (e: any) {
        console.error("Mermaid rendering error:", e);
        setError(e.message || "Failed to render diagram. Check syntax.");
      } finally {
        setIsLoading(false);
      }
    };
    
    renderChart();
  }, [chart, resolvedTheme]);

  return (
    <div className="p-4 bg-muted/30 rounded-lg min-h-[200px] flex items-center justify-center">
      {isLoading && (
        <div className="flex flex-col items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-xs">Rendering diagram...</p>
        </div>
      )}
      {error && (
        <div className="text-destructive text-xs flex flex-col items-center">
            <AlertTriangle className="h-6 w-6 mb-2"/>
            <p className="font-semibold">Rendering Error</p>
            <p className="mt-1">{error}</p>
        </div>
      )}
      {svg && !isLoading && !error && (
        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svg }} />
      )}
    </div>
  );
};
