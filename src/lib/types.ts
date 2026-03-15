export type Difficulty = 'high' | 'medium' | 'low';
export type AssignmentStatus = 'completed' | 'in-progress' | 'upcoming' | 'urgent';
export type CourseColor = 'algorithms' | 'os' | 'math' | 'databases';

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  color: CourseColor;
  assignmentCount: number;
  averagePerformance: number;
  difficulty: Difficulty;
}

export interface Assignment {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  courseColor: CourseColor;
  deadline: Date;
  daysUntilDue: number;
  difficulty: Difficulty;
  estimatedHours: number;
  status: AssignmentStatus;
  completedAt?: Date;
}

export interface StudyBlock {
  id: string;
  courseId: string;
  courseName: string;
  courseColor: CourseColor;
  task: string;
  day: string;
  startHour: number;
  duration: number; // hours
  adaptivelyMoved: boolean;
  reason?: string;
}

export interface PerformanceEntry {
  courseId: string;
  courseName: string;
  week: string;
  score: number;
  recommendedHours: number;
  actualHours: number;
}

export interface DeadlineItem {
  id: string;
  name: string;
  courseName: string;
  courseColor: CourseColor;
  daysLeft: number;
  difficulty: Difficulty;
}
