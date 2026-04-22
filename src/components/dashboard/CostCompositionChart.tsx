import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Raw Materials", value: 42, color: "#3b82f6" },
  { name: "Labour", value: 24, color: "#16a34a" },
  { name: "Overheads", value: 14, color: "#f59e0b" },
  { name: "Packaging", value: 12, color: "#f97316" },
  { name: "Transport", value: 8, color: "#64748b" },
];

export default function CostCompositionChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = data[activeIndex];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">Cost Composition</h3>
      <p className="mt-0.5 mb-4 text-[11px] text-muted-foreground">
        Share of production cost by category
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={3}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  stroke={index === activeIndex ? entry.color : "transparent"}
                  strokeWidth={index === activeIndex ? 3 : 0}
                  fillOpacity={index === activeIndex ? 1 : 0.75}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [`${value}%`, item.payload.name]}
              contentStyle={{ borderRadius: 10, borderColor: "hsl(220 13% 91%)" }}
            />
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              className="fill-muted-foreground text-[11px] font-medium"
            >
              {activeItem.name}
            </text>
            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              className="fill-foreground text-base font-semibold"
            >
              {activeItem.value}%
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {data.map((entry, index) => (
          <button
            key={entry.name}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition-colors ${
              index === activeIndex ? "bg-secondary text-foreground" : ""
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-medium text-foreground/80">{entry.value}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
