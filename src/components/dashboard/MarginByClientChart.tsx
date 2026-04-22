import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "INVARAGE", margin: 32, color: "#3b82f6" },
  { name: "Rwanda Mountain", margin: 28, color: "#1e3a5f" },
  { name: "Skol Brewery", margin: 18, color: "#f59e0b" },
  { name: "Sulfo Rwanda", margin: 24, color: "#16a34a" },
];

export default function MarginByClientChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Margin by Client</h3>
      <p className="mt-0.5 mb-4 text-[11px] text-muted-foreground">
        Gross margin percentage by major account
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={20}>
            <CartesianGrid stroke="hsl(220 13% 91%)" strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value: number) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              width={110}
            />
            <Tooltip formatter={(value) => [`${value}%`, "Margin"]} />
            <Bar dataKey="margin" radius={[0, 4, 4, 0]}>
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
