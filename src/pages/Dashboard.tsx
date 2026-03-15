import { BookOpen, Calendar, Clock, Activity, Sparkles } from 'lucide-react';
import { StudyBlockCard } from '@/components/StudyBlockCard';
import { DeadlineAlert } from '@/components/DeadlineAlert';
import { WorkloadGraph } from '@/components/WorkloadGraph';
import { studyBlocks, deadlines, weeklyWorkload, assignments } from '@/lib/data';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const stats = [
  { label: 'Upcoming Assignments', value: assignments.filter(a => a.status !== 'completed').length, icon: BookOpen, accent: 'text-primary' },
  { label: 'Study Hours This Week', value: '22h', icon: Clock, accent: 'text-primary' },
  { label: 'Courses Tracked', value: 4, icon: Calendar, accent: 'text-primary' },
  { label: 'Balance Score', value: '84/100', icon: Activity, accent: 'text-success' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">
          Your week, optimized for performance.
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          The algorithm has adjusted 4 blocks this week based on workload density.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="shadow-card rounded-xl bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.accent}`} />
              <span className="label-text">{s.label}</span>
            </div>
            <p className="text-2xl font-semibold font-mono-nums text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main content: Schedule + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Weekly Schedule */}
        <div className="shadow-card rounded-xl bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="label-text">Weekly Adaptive Schedule</h2>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>= Adaptively moved</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const blocks = studyBlocks.filter(b => b.day === day);
              return (
                <div key={day} className="min-h-[200px]">
                  <p className="text-xs font-semibold text-foreground mb-2 text-center">{day}</p>
                  <div className="space-y-1.5">
                    {blocks.length > 0 ? (
                      blocks.map(b => <StudyBlockCard key={b.id} block={b} />)
                    ) : (
                      <div className="rounded-lg border border-dashed border-border h-20 flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground">Free</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <DeadlineAlert deadlines={deadlines} />
          <WorkloadGraph data={weeklyWorkload} />
        </div>
      </div>
    </div>
  );
}
