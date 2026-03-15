import { StudyBlockCard } from '@/components/StudyBlockCard';
import { CourseHoursChart } from '@/components/CourseHoursChart';
import { WorkloadGraph } from '@/components/WorkloadGraph';
import { studyBlocks, weeklyWorkload, courseHoursDistribution } from '@/lib/data';
import { Sparkles, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const adaptiveRules = [
  { condition: 'Deadline < 3 days', action: 'Increase study block priority', active: true },
  { condition: 'Performance < 70%', action: 'Add additional review session', active: true },
  { condition: 'Workload > 6h/day', action: 'Redistribute tasks across week', active: false },
];

export default function AdaptivePlanPage() {
  const movedCount = studyBlocks.filter(b => b.adaptivelyMoved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Adaptive Study Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-mono-nums">{movedCount}</span> blocks adaptively adjusted this week.
        </p>
      </div>

      {/* Adaptive rules */}
      <div className="shadow-card rounded-xl bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="label-text">Active Scheduling Rules</h3>
        </div>
        <div className="space-y-2">
          {adaptiveRules.map((rule, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
              rule.active ? 'border-primary/20 bg-blue-50/50' : 'border-border bg-secondary/30'
            }`}>
              <div>
                <p className="text-sm font-medium text-foreground">{rule.condition}</p>
                <p className="text-xs text-muted-foreground">→ {rule.action}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                rule.active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
              }`}>
                {rule.active ? 'Active' : 'Standby'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule + Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Calendar grid */}
        <div className="shadow-card rounded-xl bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="label-text">Weekly Plan</h2>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>= Adaptively moved</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const blocks = studyBlocks.filter(b => b.day === day);
              const totalHours = blocks.reduce((s, b) => s + b.duration, 0);
              return (
                <div key={day}>
                  <div className="text-center mb-2">
                    <p className="text-xs font-semibold text-foreground">{day}</p>
                    <p className={`font-mono-nums text-[10px] ${totalHours > 5 ? 'text-danger font-semibold' : 'text-muted-foreground'}`}>
                      {totalHours}h
                    </p>
                  </div>
                  <motion.div layout className="space-y-1.5 min-h-[180px]">
                    {blocks.map(b => (
                      <StudyBlockCard key={b.id} block={b} />
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts sidebar */}
        <div className="space-y-4">
          <CourseHoursChart data={courseHoursDistribution} />
          <WorkloadGraph data={weeklyWorkload} />
        </div>
      </div>
    </div>
  );
}
