import { PerformanceScoreChart, StudyHoursChart } from '@/components/PerformanceChart';
import { performanceData, courses } from '@/lib/data';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const insights = [
  {
    icon: AlertTriangle,
    type: 'warning' as const,
    title: 'Algorithms performance declining',
    description: 'Score dropped from 85% to 68% over 4 weeks. Study time increased by 75% to compensate.',
  },
  {
    icon: TrendingUp,
    type: 'success' as const,
    title: 'Databases consistently strong',
    description: 'Average score: 91%. Study allocation reduced to free time for higher-priority courses.',
  },
  {
    icon: Lightbulb,
    type: 'info' as const,
    title: 'Recommendation',
    description: 'If Algorithms performance stays below 70%, the system will add 2 additional review sessions next week.',
  },
];

const typeStyles = {
  warning: 'border-warning/20 bg-amber-50/50',
  success: 'border-success/20 bg-emerald-50/50',
  info: 'border-primary/20 bg-blue-50/50',
};

const iconStyles = {
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-primary',
};

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Performance Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          How performance signals drive your adaptive schedule.
        </p>
      </div>

      {/* Course performance summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {courses.map(c => {
          const latest = performanceData.filter(p => p.courseId === c.id).slice(-1)[0];
          const trend = performanceData.filter(p => p.courseId === c.id);
          const first = trend[0]?.score ?? 0;
          const last = latest?.score ?? 0;
          const delta = last - first;
          return (
            <div key={c.id} className="shadow-card rounded-xl bg-card p-4">
              <span className="label-text">{c.name}</span>
              <p className="text-2xl font-semibold font-mono-nums text-foreground mt-1">{last}%</p>
              <p className={`text-xs font-mono-nums font-medium mt-0.5 ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
                {delta >= 0 ? '+' : ''}{delta}% over 5 weeks
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PerformanceScoreChart data={performanceData} />
        <StudyHoursChart data={performanceData} />
      </div>

      {/* Insights */}
      <div className="shadow-card rounded-xl bg-card p-5">
        <h3 className="label-text mb-3">Adaptive Insights</h3>
        <div className="space-y-2.5">
          {insights.map((ins, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${typeStyles[ins.type]}`}>
              <ins.icon className={`h-4 w-4 mt-0.5 ${iconStyles[ins.type]}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{ins.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ins.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
