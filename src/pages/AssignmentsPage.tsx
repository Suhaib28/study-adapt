import { useState } from 'react';
import { AssignmentTable } from '@/components/AssignmentTable';
import { assignments as initialAssignments } from '@/lib/data';
import type { Assignment } from '@/lib/types';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const [assignmentList, setAssignmentList] = useState<Assignment[]>(initialAssignments);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filtered = assignmentList.filter(a => {
    if (filter === 'active') return a.status !== 'completed';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const handleToggleComplete = (id: string) => {
    setAssignmentList(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, status: 'completed' as const, completedAt: new Date() }
          : a
      )
    );
    toast.success('Assignment completed! Workload re-balanced.');
  };

  const activeCount = assignmentList.filter(a => a.status !== 'completed').length;
  const urgentCount = assignmentList.filter(a => a.status === 'urgent').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-mono-nums">{activeCount}</span> active · <span className="font-mono-nums text-danger">{urgentCount}</span> urgent
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AssignmentTable assignments={filtered} onToggleComplete={handleToggleComplete} />
    </div>
  );
}
