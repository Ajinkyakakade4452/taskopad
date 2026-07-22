import { useState } from 'react';
import { ChartDataPoint, Priority, Task } from '../types';

interface ChartsProps {
  theme: 'dark' | 'light';
  tasks: Task[];
}

export function StatisticsChart({ theme, tasks }: ChartsProps) {
  const [viewMode, setViewMode] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [filterType, setFilterType] = useState<'My Task' | 'All Tasks'>('All Tasks');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate real monthly data for last 12 months
  const generateMonthlyData = (): ChartDataPoint[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result: ChartDataPoint[] = [];

    for (let i = 0; i < 12; i++) {
      const monthIndex = (now.getMonth() - 11 + i + 12) % 12;
      const year = now.getFullYear() + Math.floor((now.getMonth() - 11 + i) / 12);
      
      // Filter tasks for this month
      const monthTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.getMonth() === monthIndex && taskDate.getFullYear() === year;
      });

      const completed = monthTasks.filter(t => t.status === 'Completed').length;
      const incomplete = monthTasks.filter(t => t.status !== 'Completed').length;

      result.push({
        month: months[monthIndex],
        completed,
        incomplete
      });
    }
    return result;
  };

  // Generate real weekly data for last 4 weeks
  const generateWeeklyData = (): ChartDataPoint[] => {
    const now = new Date();
    const result: ChartDataPoint[] = [];

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + 6));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const completed = weekTasks.filter(t => t.status === 'Completed').length;
      const incomplete = weekTasks.filter(t => t.status !== 'Completed').length;

      result.unshift({
        month: `Wk ${4 - i}`,
        completed,
        incomplete
      });
    }
    return result;
  };

  const data = viewMode === 'Monthly' ? generateMonthlyData() : generateWeeklyData();

  // Calculate dynamic max value based on data
  const allValues = data.flatMap(d => [d.completed, d.incomplete]);
  const maxDataVal = Math.max(...allValues, 10); // At least 10 for empty state
  // Round up to nearest multiple of 20 for better ticks
  const maxVal = Math.ceil(maxDataVal / 20) * 20;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  return (
    <div
      id="statistics-card"
      className={`rounded-2xl p-6 transition-all duration-300 shadow-lg border ${
        theme === 'dark'
          ? 'bg-[#141C38] border-slate-800 text-slate-200'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-lg tracking-tight">Statistics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Task completion trajectory</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className={`text-xs font-medium rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-cyan-400 transition ${
              theme === 'dark'
                ? 'bg-[#0D1631] border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="My Task">My Task</option>
            <option value="All Tasks">All Tasks</option>
          </select>

          {/* Toggle buttons */}
          <div
            className={`p-1 rounded-lg flex items-center ${
              theme === 'dark' ? 'bg-[#0D1631]' : 'bg-slate-100'
            }`}
          >
            {(['Monthly', 'Weekly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${
                  viewMode === mode
                    ? theme === 'dark'
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'bg-cyan-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox={`0 0 600 ${height}`} preserveAspectRatio="none">
          {/* Grids */}
          {(() => {
            const gridLines: number[] = [];
            const step = Math.ceil(maxVal / 5);
            for (let i = 0; i <= maxVal; i += step) {
              gridLines.push(i);
            }
            return gridLines.map((yVal, i) => {
              const y = height - paddingY - (yVal / maxVal) * (height - 2 * paddingY);
              return (
                <g key={yVal}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={600 - paddingX}
                    y2={y}
                    stroke={theme === 'dark' ? '#1e294b' : '#f1f5f9'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 12}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {yVal}
                  </text>
                </g>
              );
            });
          })()}

          {/* X Axis Labels and Vertical Guideline lines */}
          {data.map((d, index) => {
            const x =
              paddingX +
              (index / (data.length - 1)) * (600 - 2 * paddingX);
            return (
              <g key={d.month}>
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-slate-400"
                >
                  {d.month}
                </text>
                {hoveredIndex === index && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke={theme === 'dark' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(6, 182, 212, 0.15)'}
                    strokeDasharray="4"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Draw Paths */}
          {(() => {
            // Completed Line
            const completedPoints = data.map((d, index) => {
              const x =
                paddingX +
                (index / (data.length - 1)) * (600 - 2 * paddingX);
              const y =
                height - paddingY - (d.completed / maxVal) * (height - 2 * paddingY);
              return `${x},${y}`;
            });

            // Incomplete Line
            const incompletePoints = data.map((d, index) => {
              const x =
                paddingX +
                (index / (data.length - 1)) * (600 - 2 * paddingX);
              const y =
                height - paddingY - (d.incomplete / maxVal) * (height - 2 * paddingY);
              return `${x},${y}`;
            });

            return (
              <>
                {/* Completed Gradient Area */}
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="incompleteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d={`M ${paddingX},${height - paddingY} L ${completedPoints.join(' L ')} L ${600 - paddingX},${height - paddingY} Z`}
                  fill="url(#completedGrad)"
                />
                <path
                  d={`M ${paddingX},${height - paddingY} L ${incompletePoints.join(' L ')} L ${600 - paddingX},${height - paddingY} Z`}
                  fill="url(#incompleteGrad)"
                />

                {/* Completed Line */}
                <path
                  d={`M ${completedPoints.join(' L ')}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Incomplete Line */}
                <path
                  d={`M ${incompletePoints.join(' L ')}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Hotspots / Interactive dots */}
                {data.map((d, index) => {
                  const x =
                    paddingX +
                    (index / (data.length - 1)) * (600 - 2 * paddingX);
                  const yComp =
                    height - paddingY - (d.completed / maxVal) * (height - 2 * paddingY);
                  const yIncomp =
                    height - paddingY - (d.incomplete / maxVal) * (height - 2 * paddingY);

                  return (
                    <g
                      key={index}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Invisible wider area for hovering */}
                      <rect
                        x={x - 15}
                        y={paddingY}
                        width="30"
                        height={height - 2 * paddingY}
                        fill="transparent"
                      />

                      {/* Completed Point */}
                      <circle
                        cx={x}
                        cy={yComp}
                        r={hoveredIndex === index ? 6 : 4}
                        fill={theme === 'dark' ? '#0f1a36' : '#ffffff'}
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />

                      {/* Incomplete Point */}
                      <circle
                        cx={x}
                        cy={yIncomp}
                        r={hoveredIndex === index ? 6 : 4}
                        fill={theme === 'dark' ? '#0f1a36' : '#ffffff'}
                        stroke="#ef4444"
                        strokeWidth="2.5"
                      />
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredIndex !== null && (
          <div
            className={`absolute z-10 p-3 rounded-xl border text-xs shadow-xl backdrop-blur-md pointer-events-none transition-all duration-100 ${
              theme === 'dark'
                ? 'bg-slate-900/90 border-slate-700 text-white'
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
            style={{
              left: `${Math.min(
                Math.max(
                  5,
                  (hoveredIndex / (data.length - 1)) * 100 - 15
                ),
                70
              )}%`,
              top: '10px',
            }}
          >
            <div className="font-bold border-b pb-1 mb-1 border-slate-700/50 flex justify-between items-center gap-4">
              <span>{data[hoveredIndex].month} 2026</span>
              <span className="text-[10px] text-slate-400 font-normal">{viewMode}</span>
            </div>
            <div className="flex flex-col gap-1.5 mt-1 font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                <span>Completed: {data[hoveredIndex].completed}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Incomplete: {data[hoveredIndex].incomplete}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-slate-800/20 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-1.5 rounded-full bg-[#06b6d4]"></span>
          <span className="text-slate-400 font-medium">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1.5 rounded-full bg-[#ef4444]"></span>
          <span className="text-slate-400 font-medium">Incomplete</span>
        </div>
      </div>
    </div>
  );
}

interface PriorityChartProps {
  theme: 'dark' | 'light';
  tasks: Task[];
}

export function PriorityTaskSummary({ theme, tasks }: PriorityChartProps) {
  // Real data from tasks
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const criticalCount = pendingTasks.filter(t => t.priority === 'Critical').length;
  const lowCount = pendingTasks.filter(t => t.priority === 'Low').length;
  const mediumCount = pendingTasks.filter(t => t.priority === 'Medium').length;
  const highCount = pendingTasks.filter(t => t.priority === 'High').length;

  const total = lowCount + mediumCount + highCount + criticalCount;

  // Circle Math
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  // Percentages
  const pctCritical = criticalCount / total;
  const pctHigh = highCount / total;
  const pctMedium = mediumCount / total;
  const pctLow = lowCount / total;

  // Stroke Dash arrays
  const strokeDashCritical = circumference * pctCritical;
  const strokeDashHigh = circumference * pctHigh;
  const strokeDashMedium = circumference * pctMedium;
  const strokeDashLow = circumference * pctLow;

  // Offsets (Critical starts at top, then High, Medium, Low)
  const offsetCritical = 0;
  const offsetHigh = strokeDashCritical;
  const offsetMedium = strokeDashCritical + strokeDashHigh;
  const offsetLow = strokeDashCritical + strokeDashHigh + strokeDashMedium;

  return (
    <div
      id="priority-card"
      className={`rounded-2xl p-6 transition-all duration-300 shadow-lg border h-full flex flex-col justify-between ${
        theme === 'dark'
          ? 'bg-[#141C38] border-slate-800 text-slate-200'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div>
        <h3 className="font-semibold text-lg tracking-tight">Priority Task Summary</h3>
        <p className="text-xs text-slate-400 mt-0.5">Distribution of pending tasks</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-6">
        {/* Interactive Donut SVG */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={theme === 'dark' ? '#0D1631' : '#f1f5f9'}
              strokeWidth="9"
            />

            {/* Critical Segment (Violet) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#8b5cf6"
              strokeWidth="11"
              strokeDasharray={`${strokeDashCritical} ${circumference}`}
              strokeDashoffset={-offsetCritical}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* High Segment (Red) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="11"
              strokeDasharray={`${strokeDashHigh} ${circumference}`}
              strokeDashoffset={-offsetHigh}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Medium Segment (Yellow) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="11"
              strokeDasharray={`${strokeDashMedium} ${circumference}`}
              strokeDashoffset={-offsetMedium}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Low Segment (Green) */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="11"
              strokeDasharray={`${strokeDashLow} ${circumference}`}
              strokeDashoffset={-offsetLow}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Centered Total Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono tracking-tight">{total}</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Tasks</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-row md:flex-col flex-wrap justify-center gap-4 md:gap-3 text-xs w-full">
          {/* Critical */}
          <div className="flex items-center justify-between gap-3 bg-violet-500/5 hover:bg-violet-500/10 transition px-3 py-2 rounded-xl border border-violet-500/10 min-w-[85px] md:w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
              <span className="text-slate-400 font-medium">Critical</span>
            </div>
            <span className="font-bold font-mono text-violet-500">{criticalCount}</span>
          </div>

          {/* High */}
          <div className="flex items-center justify-between gap-3 bg-red-500/5 hover:bg-red-500/10 transition px-3 py-2 rounded-xl border border-red-500/10 min-w-[85px] md:w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-400 font-medium">High</span>
            </div>
            <span className="font-bold font-mono text-red-500">{highCount}</span>
          </div>

          {/* Medium */}
          <div className="flex items-center justify-between gap-3 bg-amber-500/5 hover:bg-amber-500/10 transition px-3 py-2 rounded-xl border border-amber-500/10 min-w-[85px] md:w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-400 font-medium">Medium</span>
            </div>
            <span className="font-bold font-mono text-amber-500">{mediumCount}</span>
          </div>

          {/* Low */}
          <div className="flex items-center justify-between gap-3 bg-emerald-500/5 hover:bg-emerald-500/10 transition px-3 py-2 rounded-xl border border-emerald-500/10 min-w-[85px] md:w-full">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 font-medium">Low</span>
            </div>
            <span className="font-bold font-mono text-emerald-500">{lowCount}</span>
          </div>
        </div>
      </div>

      <div className={`text-[11px] text-center p-2 rounded-lg ${theme === 'dark' ? 'bg-[#0D1631]/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        {criticalCount > 0
          ? <><span className="text-violet-400 font-semibold">{criticalCount}</span> task(s) flagged as <span className="text-violet-400 font-semibold">Critical</span> — Immediate attention required.</>
          : <>Majority of active assignments are flagged as <span className="text-red-400 font-semibold">High Priority</span>.</>
        }
      </div>
    </div>
  );
}
