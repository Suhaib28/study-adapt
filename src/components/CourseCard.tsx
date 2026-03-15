import type { Course } from '@/lib/types';
import { getCourseColorClass, getDifficultyClass } from '@/lib/data';
import { BookOpen, TrendingUp } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const colorClass = getCourseColorClass(course.color);

  return (
    <div
      onClick={onClick}
      className="shadow-card hover:shadow-card-hover rounded-xl bg-card p-5 cursor-pointer transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colorClass}`}>
            {course.code}
          </span>
          <h3 className="mt-2 text-base font-semibold text-foreground">{course.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
        </div>
        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-medium ${getDifficultyClass(course.difficulty)}`}>
          {course.difficulty}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{course.assignmentCount} assignments</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          <span className="font-mono-nums">{course.averagePerformance}%</span>
        </div>
      </div>
      {/* Performance bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${course.averagePerformance}%` }}
        />
      </div>
    </div>
  );
}
