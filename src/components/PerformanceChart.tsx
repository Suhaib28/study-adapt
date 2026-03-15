import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import type { PerformanceEntry } from '@/lib/types';

interface PerformanceChartProps {
  data: PerformanceEntry[];
  courseId?: string;
}

export function PerformanceScoreChart({ data, courseId }: PerformanceChartProps) {
  const courses = [...new Set(data.map(d => d.courseName))];
  const weeks = [...new Set(data.map(d => d.week))];

  const chartData = weeks.map(week => {
    const entry: Record<string, string | number> = { week };
    courses.forEach(course => {
      const found = data.find(d => d.week === week && d.courseName === course);
      if (found) entry[course] = found.score;
    });
    return entry;
  });

  const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#22C55E'];
  const filtered = courseId ? courses.filter(c => data.some(d => d.courseName === c && d.courseId === courseId)) : courses;

  return (
    <div className="shadow-card rounded-xl bg-card p-5">
      <h3 className="label-text mb-4">Performance Trends</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          {filtered.map((course, i) => (
            <Line
              key={course}
              type="monotone"
              dataKey={course}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: colors[i % colors.length] }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StudyHoursChartProps {
  data: PerformanceEntry[];
}

export function StudyHoursChart({ data }: StudyHoursChartProps) {
  const weeks = [...new Set(data.map(d => d.week))];
  const chartData = weeks.map(week => {
    const entries = data.filter(d => d.week === week);
    return {
      week,
      recommended: entries.reduce((s, e) => s + e.recommendedHours, 0),
      actual: entries.reduce((s, e) => s + e.actualHours, 0),
    };
  });

  return (
    <div className="shadow-card rounded-xl bg-card p-5">
      <h3 className="label-text mb-4">Study Hours: Recommended vs Actual</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="recommended" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="actual" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
