# StudyFlow Adaptive

Build a modern web application prototype for a research project called:

Adaptive Study Scheduling System

The system is designed to help university students manage their academic workload using adaptive scheduling algorithms that adjust study plans based on assignments, deadlines, and performance signals.

This is a research prototype, so the focus is on a clean, intuitive interface that visualizes adaptive study plans rather than a fully functional backend.

Core Concept

Students input:

courses

assignments

deadlines

estimated difficulty

recent performance (quiz scores, grades)

The system generates an adaptive weekly study schedule that dynamically adjusts workload distribution.

The interface should help students see:

what to study

when to study

how workload changes over time

UI Design Style

Use a modern, clean student productivity design similar to:

Notion

Linear

Google Calendar

Todoist

Design characteristics:

minimalist layout

soft colors

rounded UI elements

responsive design

light mode

Color palette:

Primary: soft blue (#3B82F6)
Secondary: slate gray (#64748B)
Accent: green for completed tasks (#22C55E)
Warning: orange for approaching deadlines (#F59E0B)

Main Pages

1. Dashboard (Home)

Purpose: show student's current workload overview

Sections:

Top summary cards:

Upcoming Assignments

Study Hours Scheduled This Week

Courses Being Tracked

Workload Balance Score

Center section:

Weekly Adaptive Study Schedule

Calendar style layout showing:

Monday – Sunday study blocks.

Example:

Mon
2pm – Algorithms study
5pm – Data Structures homework

Tue
3pm – Linear Algebra review

Each block shows:

course name
task
estimated time

Right side panel:

Upcoming Deadlines

Example:

CSE340 Project – 3 days
Math Quiz – 5 days
Operating Systems Lab – 6 days

2. Courses Page

Shows all courses student is taking.

Each course card contains:

Course name
Instructor
Assignments count
Average performance
Workload difficulty indicator

Clicking a course opens:

Course detail page showing:

assignments

deadlines

performance metrics

recommended study sessions

3. Assignments Page

Table layout with:

Assignment Name
Course
Deadline
Difficulty
Estimated Hours
Status

Allow:

Add assignment
Edit assignment
Mark complete

Color code:

Green – completed
Yellow – upcoming
Red – urgent

4. Adaptive Study Plan Page

This page shows how the system distributes study time.

Two views:

Weekly Plan

Calendar grid with recommended study blocks.

Workload Distribution Chart

Graph showing hours allocated per course.

Example:

Algorithms — 6 hours
Operating Systems — 4 hours
Math — 3 hours

5. Performance Page

Shows how performance affects scheduling.

Graphs:

quiz score trends

assignment completion time

recommended study hours

Example:

"If performance drops in a course, the system increases recommended study time."

Adaptive Logic (Simulation)

For the prototype simulate logic like:

If assignment deadline < 3 days
→ increase study block priority

If performance < 70%
→ add additional review session

If workload > 6 hours/day
→ redistribute tasks across week

Components Needed

Create reusable UI components:

CourseCard

AssignmentTable

StudyBlock

DeadlineAlert

PerformanceChart

WorkloadGraph

Charts

Include charts using:

bar charts

line charts

workload distribution pie chart

Prototype Data

Prepopulate with example student data.

Courses:

Algorithms
Operating Systems
Linear Algebra
Databases

Example assignments:

Algorithms Project – difficulty high – due in 4 days
OS Lab – medium – due in 2 days
Math Quiz – low – due in 5 days

UX Goals

The system should make it easy for students to:

understand their workload

see recommended study sessions

anticipate deadlines

avoid cramming

Output

Create a working interactive UI prototype with:

navigation sidebar

dashboard

calendar view

assignment management

charts and analytics

Focus on visualizing adaptive scheduling, not implementing the full algorithm.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c6e31337-6e80-44f7-bf78-0775fcbf33b0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
