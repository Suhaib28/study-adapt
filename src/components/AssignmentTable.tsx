import type { Assignment } from '@/lib/types';
import { getDifficultyClass, getCourseColorClass } from '@/lib/data';
import { Check, Clock, AlertTriangle } from 'lucide-react';

interface AssignmentTableProps {
  assignments: Assignment[];
  onToggleComplete?: (id: string) => void;
}

const statusConfig = {
  completed: { icon: Check, label: 'Done', className: 'text-success' },
  'in-progress': { icon: Clock, label: 'In Progress', className: 'text-primary' },
  upcoming: { icon: Clock, label: 'Upcoming', className: 'text-muted-foreground' },
  urgent: { icon: AlertTriangle, label: 'Urgent', className: 'text-danger' },
};

export function AssignmentTable({ assignments, onToggleComplete }: AssignmentTableProps) {
  return (
    <div className="shadow-card rounded-xl bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="label-text text-left px-4 py-3">Assignment</th>
            <th className="label-text text-left px-4 py-3">Course</th>
            <th className="label-text text-left px-4 py-3">Deadline</th>
            <th className="label-text text-left px-4 py-3">Difficulty</th>
            <th className="label-text text-left px-4 py-3">Est. Hours</th>
            <th className="label-text text-left px-4 py-3">Status</th>
            <th className="label-text text-left px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => {
            const status = statusConfig[a.status];
            const StatusIcon = status.icon;
            return (
              <tr
                key={a.id}
                className={`border-b border-border last:border-0 h-14 transition-colors hover:bg-secondary/50 ${
                  a.status === 'completed' ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 text-sm font-medium text-foreground">
                  {a.name}
                </td>
                <td className="px-4">
                  <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold ${getCourseColorClass(a.courseColor)}`}>
                    {a.courseName}
                  </span>
                </td>
                <td className="px-4 font-mono-nums text-sm text-muted-foreground">
                  {a.daysUntilDue > 0 ? `${a.daysUntilDue}d` : a.status === 'completed' ? '—' : 'Overdue'}
                </td>
                <td className="px-4">
                  <span className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${getDifficultyClass(a.difficulty)}`}>
                    {a.difficulty}
                  </span>
                </td>
                <td className="px-4 font-mono-nums text-sm text-muted-foreground">
                  {a.estimatedHours}h
                </td>
                <td className="px-4">
                  <span className={`flex items-center gap-1 text-xs font-medium ${status.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                </td>
                <td className="px-4">
                  {a.status !== 'completed' && (
                    <button
                      onClick={() => onToggleComplete?.(a.id)}
                      className="h-5 w-5 rounded-md border-2 border-border hover:border-success hover:bg-success/10 transition-colors duration-150 flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 opacity-0 hover:opacity-100 text-success" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
