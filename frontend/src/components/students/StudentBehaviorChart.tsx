import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PolarGrid,
  BarChart,
  Bar,
} from 'recharts';

type StudentBehaviorProps = {
  student: {
    name: string;
    behavior: {
      mouseMovements: number[];
      keystrokePatterns: number[];
      activityShifts: number[];
      inactivePeriods: number[];
      typingMetrics: {
        speed: number;
        averageSpeed: number;
        discrepancy: number;
        keystrokes: number[];
        intervals: number[];
      };
    };
    windowSwitches?: number;
    inactiveTime?: number;
    keystrokeConsistency?: number;
    riskScore: number;
    behaviorFlags: string[];
  };
};

const StudentBehaviorChart = ({ student }: StudentBehaviorProps) => {
  // Transform the data for the chart
  const chartData = student.behavior.mouseMovements.map((value, index) => ({
    name: `Interval ${index + 1}`,
    mouseMovements: value,
    keystrokePatterns: student.behavior.keystrokePatterns[index] || 0,
    activityShifts: student.behavior.activityShifts[index] || 0,
    inactivePeriods: student.behavior.inactivePeriods[index] || 0,
    typingSpeed: student.behavior.typingMetrics.speed || 0,
    typingDiscrepancy: student.behavior.typingMetrics.discrepancy || 0,
  }));

  // Calculate average values for reference lines
  const avgMouseMovements = chartData.reduce((sum, item) => sum + (item.mouseMovements || 0), 0) / chartData.length;
  const avgKeystrokePatterns = chartData.reduce((sum, item) => sum + (item.keystrokePatterns || 0), 0) / chartData.length;
  const avgActivityShifts = chartData.reduce((sum, item) => sum + (item.activityShifts || 0), 0) / chartData.length;
  const avgInactivePeriods = chartData.reduce((sum, item) => sum + (item.inactivePeriods || 0), 0) / chartData.length;

  // Configure chart colors
  const chartConfig = {
    mouseMovements: {
      label: 'Mouse Movement',
      theme: {
        light: '#0284c7', // sky-600
        dark: '#38bdf8', // sky-400
      },
    },
    keystrokePatterns: {
      label: 'Keystroke Patterns',
      theme: {
        light: '#059669', // emerald-600
        dark: '#34d399', // emerald-400
      },
    },
    activityShifts: {
      label: 'Tab Switches',
      theme: {
        light: '#d97706', // amber-600
        dark: '#fbbf24', // amber-400
      },
    },
    inactivePeriods: {
      label: 'Cursor Inactivity',
      theme: {
        light: '#dc2626', // red-600
        dark: '#f87171', // red-400
      },
    },
  };

  // Data for risk score radial chart
  const riskScoreData = [
    {
      name: 'Risk Score',
      value: student.riskScore,
      fill: student.riskScore > 50 
        ? '#ef4444' // red-500
        : student.riskScore > 25 
          ? '#f59e0b' // amber-500
          : '#22c55e', // green-500
    }
  ];

  // Data for behavior metrics bar chart
  const behaviorMetrics = [
    {
      name: 'Tab Switches',
      value: student.windowSwitches || Math.round(avgActivityShifts * chartData.length),
      fill: '#f59e0b',
    },
    {
      name: 'Inactivity',
      value: student.inactiveTime || Math.round(avgInactivePeriods * chartData.length),
      fill: '#ef4444',
    },
    {
      name: 'Keystroke Consistency',
      value: student.keystrokeConsistency || 
        (avgKeystrokePatterns > 0 ? Math.round(100 - (Math.abs(avgKeystrokePatterns - chartData[0].keystrokePatterns) / avgKeystrokePatterns * 100)) : 0),
      fill: '#22c55e',
    }
  ];

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: </span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Behavioral Activity Timeline</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={customTooltip} />
              <Legend verticalAlign="top" height={36} />
              
              <Line
                type="monotone"
                dataKey="mouseMovements"
                stroke="#0284c7"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Mouse Movement"
              />
              <ReferenceLine 
                y={avgMouseMovements} 
                stroke="#0284c7" 
                strokeDasharray="3 3"
                label={{ value: 'Avg', position: 'insideTopLeft', fontSize: 10, fill: '#0284c7' }}
              />
              
              <Line
                type="monotone"
                dataKey="keystrokePatterns"
                stroke="#059669"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Keystroke Patterns"
              />
              
              <Line
                type="monotone"
                dataKey="activityShifts"
                stroke="#d97706"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Tab Switches"
              />
              
              <Line
                type="monotone"
                dataKey="inactivePeriods"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Cursor Inactivity"
              />

              <Line
                type="monotone"
                dataKey="typingSpeed"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Typing Speed (CPM)"
              />

              <Line
                type="monotone"
                dataKey="typingDiscrepancy"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Keystroke Consistency"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Score Radial Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="80%" 
                barSize={20} 
                data={riskScoreData}
                startAngle={180} 
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <PolarGrid />
                <RadialBar
                  background
                  dataKey="value"
                  cornerRadius={10}
                  fill="#82ca9d"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold fill-current"
                >
                  {student.riskScore}
                </text>
                <text
                  x="50%"
                  y="65%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm fill-muted-foreground"
                >
                  Risk Score
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavior Metrics Bar Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Behavior Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={behaviorMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" scale="band" tick={{ fontSize: 12 }} />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  label={{ 
                    position: 'right',
                    formatter: (value: number) => `${value}`,
                    fill: '#6b7280'
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBehaviorChart;
