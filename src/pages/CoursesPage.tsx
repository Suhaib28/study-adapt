import { CourseCard } from '@/components/CourseCard';
import { courses, assignments, studyBlocks, performanceData } from '@/lib/data';
import { useState } from 'react';
import { ArrowLeft, BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react';
import { PerformanceScoreChart } from '@/components/PerformanceChart';
import { getDifficultyClass, getCourseColorClass } from '@/lib/data';

export default function CoursesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  if (selectedCourse) {
    const courseAssignments = assignments.filter(a => a.courseId === selectedCourse.id);
    const courseBlocks = studyBlocks.filter(b => b.courseId === selectedCourse.id);
    const coursePerfData = performanceData.filter(p => p.courseId === selectedCourse.id);
    const totalHours = courseBlocks.reduce((s, b) => s + b.duration, 0);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCourseId(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </button>

        <div>
          <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${getCourseColorClass(selectedCourse.color)}`}>
            {selectedCourse.code}
          </span>
          <h1 className="text-2xl font-semibold text-foreground mt-2">{selectedCourse.name}</h1>
          <p className="text-sm text-muted-foreground">{selectedCourse.instructor}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Assignments', value: courseAssignments.length, icon: BookOpen },
            { label: 'Study Hours/Week', value: `${totalHours}h`, icon: Clock },
            { label: 'Avg Performance', value: `${selectedCourse.averagePerformance}%`, icon: TrendingUp },
            { label: 'Sessions/Week', value: courseBlocks.length, icon: Calendar },
          ].map(s => (
            <div key={s.label} className="shadow-card rounded-xl bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="h-3.5 w-3.5 text-primary" />
                <span className="label-text">{s.label}</span>
              </div>
              <p className="text-xl font-semibold font-mono-nums text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Performance chart */}
        <PerformanceScoreChart data={coursePerfData} courseId={selectedCourse.id} />

        {/* Assignments list */}
        <div className="shadow-card rounded-xl bg-card p-5">
          <h3 className="label-text mb-3">Assignments</h3>
          <div className="space-y-2">
            {courseAssignments.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.status === 'completed' ? 'Completed' : `Due in ${a.daysUntilDue} days · ${a.estimatedHours}h estimated`}
                  </p>
                </div>
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${getDifficultyClass(a.difficulty)}`}>
                  {a.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended sessions */}
        <div className="shadow-card rounded-xl bg-card p-5">
          <h3 className="label-text mb-3">Recommended Study Sessions</h3>
          <div className="space-y-2">
            {courseBlocks.map(b => (
              <div key={b.id} className={`flex items-center justify-between rounded-lg px-4 py-3 ${getCourseColorClass(selectedCourse.color)}`}>
                <div>
                  <p className="text-sm font-medium">{b.task}</p>
                  <p className="text-xs opacity-70">{b.day} · {b.startHour}:00 – {b.startHour + b.duration}:{b.duration % 1 === 0.5 ? '30' : '00'}</p>
                </div>
                <span className="font-mono-nums text-xs font-semibold">{b.duration}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground leading-tight">Courses</h1>
        <p className="text-sm text-muted-foreground mt-1">4 courses being tracked this semester.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <CourseCard key={c.id} course={c} onClick={() => setSelectedCourseId(c.id)} />
        ))}
      </div>
    </div>
  );
}
