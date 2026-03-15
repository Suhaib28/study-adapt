import { Course, Assignment, StudyBlock, PerformanceEntry, DeadlineItem } from './types';

export const courses: Course[] = [
  {
    id: 'cse340',
    name: 'Algorithms',
    code: 'CSE 340',
    instructor: 'Dr. Sarah Chen',
    color: 'algorithms',
    assignmentCount: 5,
    averagePerformance: 78,
    difficulty: 'high',
  },
  {
    id: 'cse360',
    name: 'Operating Systems',
    code: 'CSE 360',
    instructor: 'Prof. James Miller',
    color: 'os',
    assignmentCount: 4,
    averagePerformance: 82,
    difficulty: 'medium',
  },
  {
    id: 'mat275',
    name: 'Linear Algebra',
    code: 'MAT 275',
    instructor: 'Dr. Emily Rodriguez',
    color: 'math',
    assignmentCount: 6,
    averagePerformance: 88,
    difficulty: 'medium',
  },
  {
    id: 'cse412',
    name: 'Databases',
    code: 'CSE 412',
    instructor: 'Prof. David Kim',
    color: 'databases',
    assignmentCount: 3,
    averagePerformance: 91,
    difficulty: 'low',
  },
];

export const assignments: Assignment[] = [
  {
    id: 'a1',
    name: 'Algorithms Project',
    courseId: 'cse340',
    courseName: 'Algorithms',
    courseColor: 'algorithms',
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    daysUntilDue: 4,
    difficulty: 'high',
    estimatedHours: 8,
    status: 'urgent',
  },
  {
    id: 'a2',
    name: 'OS Lab Report',
    courseId: 'cse360',
    courseName: 'Operating Systems',
    courseColor: 'os',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    daysUntilDue: 2,
    difficulty: 'medium',
    estimatedHours: 4,
    status: 'urgent',
  },
  {
    id: 'a3',
    name: 'Math Quiz Prep',
    courseId: 'mat275',
    courseName: 'Linear Algebra',
    courseColor: 'math',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    daysUntilDue: 5,
    difficulty: 'low',
    estimatedHours: 2,
    status: 'upcoming',
  },
  {
    id: 'a4',
    name: 'Database Schema Design',
    courseId: 'cse412',
    courseName: 'Databases',
    courseColor: 'databases',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    daysUntilDue: 7,
    difficulty: 'medium',
    estimatedHours: 5,
    status: 'upcoming',
  },
  {
    id: 'a5',
    name: 'Dynamic Programming HW',
    courseId: 'cse340',
    courseName: 'Algorithms',
    courseColor: 'algorithms',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    daysUntilDue: 6,
    difficulty: 'high',
    estimatedHours: 6,
    status: 'in-progress',
  },
  {
    id: 'a6',
    name: 'Process Scheduling Report',
    courseId: 'cse360',
    courseName: 'Operating Systems',
    courseColor: 'os',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    daysUntilDue: 10,
    difficulty: 'medium',
    estimatedHours: 3,
    status: 'upcoming',
  },
  {
    id: 'a7',
    name: 'Eigenvalues Problem Set',
    courseId: 'mat275',
    courseName: 'Linear Algebra',
    courseColor: 'math',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    daysUntilDue: -2,
    difficulty: 'medium',
    estimatedHours: 3,
    status: 'completed',
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'a8',
    name: 'SQL Joins Exercise',
    courseId: 'cse412',
    courseName: 'Databases',
    courseColor: 'databases',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    daysUntilDue: -5,
    difficulty: 'low',
    estimatedHours: 2,
    status: 'completed',
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const studyBlocks: StudyBlock[] = [
  { id: 'sb1', courseId: 'cse340', courseName: 'Algorithms', courseColor: 'algorithms', task: 'Project Research', day: 'Mon', startHour: 14, duration: 2, adaptivelyMoved: true, reason: 'High difficulty + 4 days to deadline' },
  { id: 'sb2', courseId: 'cse360', courseName: 'Operating Systems', courseColor: 'os', task: 'Lab Report Draft', day: 'Mon', startHour: 17, duration: 1.5, adaptivelyMoved: false },
  { id: 'sb3', courseId: 'mat275', courseName: 'Linear Algebra', courseColor: 'math', task: 'Quiz Review', day: 'Tue', startHour: 10, duration: 1, adaptivelyMoved: false },
  { id: 'sb4', courseId: 'cse340', courseName: 'Algorithms', courseColor: 'algorithms', task: 'DP Problem Set', day: 'Tue', startHour: 14, duration: 2.5, adaptivelyMoved: true, reason: 'Performance below 80% threshold' },
  { id: 'sb5', courseId: 'cse412', courseName: 'Databases', courseColor: 'databases', task: 'Schema Design', day: 'Wed', startHour: 11, duration: 2, adaptivelyMoved: false },
  { id: 'sb6', courseId: 'cse360', courseName: 'Operating Systems', courseColor: 'os', task: 'Process Scheduling', day: 'Wed', startHour: 15, duration: 1.5, adaptivelyMoved: false },
  { id: 'sb7', courseId: 'cse340', courseName: 'Algorithms', courseColor: 'algorithms', task: 'Project Implementation', day: 'Thu', startHour: 9, duration: 3, adaptivelyMoved: true, reason: '2 hrs added – prevent Thursday crunch' },
  { id: 'sb8', courseId: 'mat275', courseName: 'Linear Algebra', courseColor: 'math', task: 'Eigenvalue Practice', day: 'Thu', startHour: 14, duration: 1.5, adaptivelyMoved: false },
  { id: 'sb9', courseId: 'cse360', courseName: 'Operating Systems', courseColor: 'os', task: 'Lab Finalization', day: 'Fri', startHour: 10, duration: 2, adaptivelyMoved: true, reason: 'Deadline in 2 days – priority boost' },
  { id: 'sb10', courseId: 'cse412', courseName: 'Databases', courseColor: 'databases', task: 'SQL Practice', day: 'Fri', startHour: 14, duration: 1.5, adaptivelyMoved: false },
  { id: 'sb11', courseId: 'cse340', courseName: 'Algorithms', courseColor: 'algorithms', task: 'Project Review', day: 'Sat', startHour: 10, duration: 2, adaptivelyMoved: false },
  { id: 'sb12', courseId: 'mat275', courseName: 'Linear Algebra', courseColor: 'math', task: 'Final Quiz Prep', day: 'Sun', startHour: 14, duration: 1.5, adaptivelyMoved: false },
];

export const deadlines: DeadlineItem[] = [
  { id: 'd1', name: 'OS Lab Report', courseName: 'Operating Systems', courseColor: 'os', daysLeft: 2, difficulty: 'medium' },
  { id: 'd2', name: 'Algorithms Project', courseName: 'Algorithms', courseColor: 'algorithms', daysLeft: 4, difficulty: 'high' },
  { id: 'd3', name: 'Math Quiz', courseName: 'Linear Algebra', courseColor: 'math', daysLeft: 5, difficulty: 'low' },
  { id: 'd4', name: 'DP Homework', courseName: 'Algorithms', courseColor: 'algorithms', daysLeft: 6, difficulty: 'high' },
  { id: 'd5', name: 'Database Schema', courseName: 'Databases', courseColor: 'databases', daysLeft: 7, difficulty: 'medium' },
];

export const performanceData: PerformanceEntry[] = [
  { courseId: 'cse340', courseName: 'Algorithms', week: 'W1', score: 85, recommendedHours: 4, actualHours: 3.5 },
  { courseId: 'cse340', courseName: 'Algorithms', week: 'W2', score: 78, recommendedHours: 5, actualHours: 4 },
  { courseId: 'cse340', courseName: 'Algorithms', week: 'W3', score: 72, recommendedHours: 6, actualHours: 5 },
  { courseId: 'cse340', courseName: 'Algorithms', week: 'W4', score: 68, recommendedHours: 7, actualHours: 6.5 },
  { courseId: 'cse340', courseName: 'Algorithms', week: 'W5', score: 75, recommendedHours: 6, actualHours: 6 },
  { courseId: 'cse360', courseName: 'Operating Systems', week: 'W1', score: 80, recommendedHours: 3, actualHours: 3 },
  { courseId: 'cse360', courseName: 'Operating Systems', week: 'W2', score: 82, recommendedHours: 3, actualHours: 3.5 },
  { courseId: 'cse360', courseName: 'Operating Systems', week: 'W3', score: 85, recommendedHours: 3, actualHours: 3 },
  { courseId: 'cse360', courseName: 'Operating Systems', week: 'W4', score: 79, recommendedHours: 4, actualHours: 3.5 },
  { courseId: 'cse360', courseName: 'Operating Systems', week: 'W5', score: 83, recommendedHours: 3, actualHours: 4 },
  { courseId: 'mat275', courseName: 'Linear Algebra', week: 'W1', score: 90, recommendedHours: 2, actualHours: 2 },
  { courseId: 'mat275', courseName: 'Linear Algebra', week: 'W2', score: 88, recommendedHours: 2, actualHours: 2.5 },
  { courseId: 'mat275', courseName: 'Linear Algebra', week: 'W3', score: 92, recommendedHours: 2, actualHours: 2 },
  { courseId: 'mat275', courseName: 'Linear Algebra', week: 'W4', score: 85, recommendedHours: 3, actualHours: 2 },
  { courseId: 'mat275', courseName: 'Linear Algebra', week: 'W5', score: 88, recommendedHours: 2, actualHours: 3 },
  { courseId: 'cse412', courseName: 'Databases', week: 'W1', score: 92, recommendedHours: 2, actualHours: 2 },
  { courseId: 'cse412', courseName: 'Databases', week: 'W2', score: 90, recommendedHours: 2, actualHours: 1.5 },
  { courseId: 'cse412', courseName: 'Databases', week: 'W3', score: 94, recommendedHours: 1.5, actualHours: 1.5 },
  { courseId: 'cse412', courseName: 'Databases', week: 'W4', score: 88, recommendedHours: 2, actualHours: 2 },
  { courseId: 'cse412', courseName: 'Databases', week: 'W5', score: 91, recommendedHours: 2, actualHours: 2 },
];

export const weeklyWorkload = [
  { day: 'Mon', hours: 3.5, threshold: 6 },
  { day: 'Tue', hours: 3.5, threshold: 6 },
  { day: 'Wed', hours: 3.5, threshold: 6 },
  { day: 'Thu', hours: 4.5, threshold: 6 },
  { day: 'Fri', hours: 3.5, threshold: 6 },
  { day: 'Sat', hours: 2, threshold: 6 },
  { day: 'Sun', hours: 1.5, threshold: 6 },
];

export const courseHoursDistribution = [
  { name: 'Algorithms', hours: 9.5, color: '#3B82F6' },
  { name: 'Operating Systems', hours: 5, color: '#8B5CF6' },
  { name: 'Linear Algebra', hours: 4, color: '#F59E0B' },
  { name: 'Databases', hours: 3.5, color: '#22C55E' },
];

export function getCourseColorClass(color: string): string {
  const map: Record<string, string> = {
    algorithms: 'study-block-algorithms',
    os: 'study-block-os',
    math: 'study-block-math',
    databases: 'study-block-databases',
  };
  return map[color] || 'study-block-algorithms';
}

export function getDifficultyClass(d: string): string {
  const map: Record<string, string> = {
    high: 'difficulty-high',
    medium: 'difficulty-medium',
    low: 'difficulty-low',
  };
  return map[d] || 'difficulty-low';
}
