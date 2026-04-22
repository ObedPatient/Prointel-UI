import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "INVARAGE", value: 1.2, color: "#f59e0b" },
  { name: "Rwanda…", value: 0.4, color: "#ef4444" },
  { name: "Skol", value: 0.8, color: "#ef4444" },
];

export default function WastageChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground">Wastage Rate by Job</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-4">
        Actual vs 1% target — jobs above target in amber
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 1.4]}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Wastage"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <ReferenceLine
              y={1}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: "Target 1%", position: "right", fontSize: 10, fill: "#ef4444" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
