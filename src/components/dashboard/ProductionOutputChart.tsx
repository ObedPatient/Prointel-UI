import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "INVARAGE Indu…", produced: 4800, defective: 200 },
  { name: "Rwanda Mount…", produced: 3200, defective: 150 },
  { name: "Skol Brewery …", produced: 6500, defective: 400 },
  { name: "Su Po Rwanda…", produced: 2800, defective: 100 },
  { name: "Yen mso Rwan…", produced: 8200, defective: 350 },
];

export default function ProductionOutputChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground">Production Output by Job</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-4">
        Ordered bars by units produced
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={24} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            <Bar dataKey="produced" fill="#1e3a5f" name="produced" radius={[3, 3, 0, 0]} />
            <Bar dataKey="defective" fill="#ef4444" name="defective" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
