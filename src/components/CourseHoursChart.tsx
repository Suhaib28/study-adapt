import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CourseHoursProps {
  data: { name: string; hours: number; color: string }[];
}

export function CourseHoursChart({ data }: CourseHoursProps) {
  return (
    <div className="shadow-card rounded-xl bg-card p-5">
      <h3 className="label-text mb-4">Hours per Course</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 5, left: 10, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} unit="h" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215,25%,27%)' }} axisLine={false} tickLine={false} width={100} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={24}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
