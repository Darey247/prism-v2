import React, { useState, useRef, useMemo } from 'react';
import { useWallet } from '../../context/WalletContext';
import { MOCK_CHART_TIMEFRAMES } from '../../lib/constants';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const PortfolioChart: React.FC = () => {
  const { totalPortfolioBalance, formatCurrency, settings } = useWallet();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1M');
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  const chartData = useMemo(() => {
    const raw = MOCK_CHART_TIMEFRAMES[selectedTimeframe] || MOCK_CHART_TIMEFRAMES['1M'];
    const lastRawValue = raw.points[raw.points.length - 1].value;
    const ratio = totalPortfolioBalance / (lastRawValue || 1);

    const scaledPoints = raw.points.map(p => ({
      ...p,
      value: p.value * ratio
    }));

    return {
      changePercent: raw.changePercent,
      points: scaledPoints
    };
  }, [selectedTimeframe, totalPortfolioBalance]);

  const points = chartData.points;
  const isPositive = chartData.changePercent >= 0;

  const width = 800;
  const height = 220;
  const paddingX = 20;
  const paddingY = 25;

  const minVal = Math.min(...points.map(p => p.value)) * 0.98;
  const maxVal = Math.max(...points.map(p => p.value)) * 1.02;

  const getCoordinates = (p: { time: string; value: number }, idx: number) => {
    const x = paddingX + (idx / (points.length - 1)) * (width - 2 * paddingX);
    const range = maxVal - minVal || 1;
    const y = height - paddingY - ((p.value - minVal) / range) * (height - 2 * paddingY);
    return { x, y };
  };

  const coords = points.map(getCoordinates);

  const curvePath = useMemo(() => {
    if (coords.length === 0) return '';
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [coords]);

  const areaPath = useMemo(() => {
    if (!curvePath) return '';
    const last = coords[coords.length - 1];
    const first = coords[0];
    return `${curvePath} L ${last.x} ${height} L ${first.x} ${height} Z`;
  }, [curvePath, coords, height]);

  const handlePointer = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, relativeX / rect.width));
    const index = Math.round(percent * (points.length - 1));
    setActivePointIndex(index);
  };

  const currentPoint = activePointIndex !== null ? points[activePointIndex] : points[points.length - 1];
  const currentCoords = activePointIndex !== null ? coords[activePointIndex] : coords[coords.length - 1];

  return (
    <div className="rounded-3xl glass-ios-card p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Performance</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isPositive 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? '+' : ''}{chartData.changePercent.toFixed(2)}%</span>
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {settings.hideBalance ? '••••••••' : formatCurrency(currentPoint.value)}
            </span>
            <span className="text-xs text-slate-400">
              {currentPoint.time}
            </span>
          </div>
        </div>

        {/* iOS Segmented Timeframe Controls */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900/80 border border-white/10 overflow-x-auto">
          {timeframes.map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => {
                setSelectedTimeframe(tf);
                setActivePointIndex(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTimeframe === tf
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div 
        ref={containerRef}
        onMouseMove={(e) => handlePointer(e.clientX)}
        onMouseLeave={() => setActivePointIndex(null)}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointer(e.touches[0].clientX);
        }}
        onTouchEnd={() => setActivePointIndex(null)}
        className="relative w-full h-44 sm:h-56 cursor-crosshair select-none touch-none mt-2"
      >
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#6366F1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#chartGradient)" />

          <path 
            d={curvePath} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {activePointIndex !== null && (
            <g>
              <line
                x1={currentCoords.x}
                y1={paddingY}
                x2={currentCoords.x}
                y2={height}
                stroke="#818CF8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <circle
                cx={currentCoords.x}
                cy={currentCoords.y}
                r="6"
                fill="#FFFFFF"
                stroke="#6366F1"
                strokeWidth="3"
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {activePointIndex !== null && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl glass-ios text-center text-xs whitespace-nowrap z-20 shadow-2xl"
            style={{
              left: `${(currentCoords.x / width) * 100}%`,
              top: `${(currentCoords.y / height) * 100 - 8}%`
            }}
          >
            <span className="font-mono font-bold text-white block">
              {settings.hideBalance ? '••••' : formatCurrency(currentPoint.value)}
            </span>
            <span className="text-[10px] text-slate-400 block">{currentPoint.time}</span>
          </div>
        )}
      </div>

      {/* Time labels below chart */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-white/10">
        <span>{points[0].time}</span>
        <span>{points[Math.floor(points.length / 2)].time}</span>
        <span>{points[points.length - 1].time}</span>
      </div>
    </div>
  );
};
