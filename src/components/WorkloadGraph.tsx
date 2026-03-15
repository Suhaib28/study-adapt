import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface WorkloadGraphProps {
  data: { day: string; hours: number; threshold: number }[];
}

export function WorkloadGraph({ data }: WorkloadGraphProps) {
  return (
    <div className="shadow-card rounded-xl bg-card p-5">
      <h3 className="label-text mb-4">Workload Density</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} unit="h" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <ReferenceLine y={6} stroke="#EF4444" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: '6h limit', position: 'right', fontSize: 10, fill: '#EF4444' }} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#workloadGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
