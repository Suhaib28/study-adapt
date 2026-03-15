import type { DeadlineItem } from '@/lib/types';
import { getCourseColorClass, getDifficultyClass } from '@/lib/data';
import { Clock } from 'lucide-react';

interface DeadlineAlertProps {
  deadlines: DeadlineItem[];
}

export function DeadlineAlert({ deadlines }: DeadlineAlertProps) {
  return (
    <div className="shadow-card rounded-xl bg-card p-4">
      <h3 className="label-text mb-3">Upcoming Deadlines</h3>
      <div className="space-y-2.5">
        {deadlines.map((d) => {
          const urgent = d.daysLeft <= 3;
          return (
            <div
              key={d.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 border transition-colors ${
                urgent ? 'border-danger/20 bg-red-50/50' : 'border-border bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${getCourseColorClass(d.courseColor)}`}>
                  {d.courseName.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${getDifficultyClass(d.difficulty)}`}>
                  {d.difficulty}
                </span>
                <span className={`flex items-center gap-1 font-mono-nums text-xs font-semibold ${
                  urgent ? 'text-danger' : 'text-muted-foreground'
                }`}>
                  <Clock className="h-3 w-3" />
                  {d.daysLeft}d
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
