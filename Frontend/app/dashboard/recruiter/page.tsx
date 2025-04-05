"use client";
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  UserCheck,
} from "lucide-react";

// Sample data for the charts
const candidateTrendsData = [
  { name: "Jan 1", candidates: 8 },
  { name: "Jan 2", candidates: 12 },
  { name: "Jan 3", candidates: 10 },
  { name: "Jan 4", candidates: 15 },
  { name: "Jan 5", candidates: 18 },
  { name: "Jan 6", candidates: 14 },
  { name: "Jan 7", candidates: 16 },
  { name: "Jan 8", candidates: 19 },
  { name: "Jan 9", candidates: 22 },
  { name: "Jan 10", candidates: 17 },
  { name: "Jan 11", candidates: 25 },
  { name: "Jan 12", candidates: 21 },
  { name: "Jan 13", candidates: 18 },
  { name: "Jan 14", candidates: 24 },
];

const candidateSourceData = [
  { name: "LinkedIn", value: 40 },
  { name: "Job Board", value: 25 },
  { name: "Referral", value: 20 },
  { name: "Company Site", value: 10 },
  { name: "Other", value: 5 },
];

const screeningStatusData = [
  { name: "Passed", count: 68 },
  { name: "Failed", count: 42 },
  { name: "No Show", count: 15 },
  { name: "Rescheduled", count: 25 },
];

const COLORS = [
  "var(--accent)",
  "var(--accent-hover)",
  "#ffd066",
  "#ffde99",
  "#ffeccc",
];
const SCREENING_COLORS = ["#4ade80", "#ef4444", "#8b5cf6", "#3b82f6"];

// Type definitions
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeDirection?: "up" | "down";
};

type TimeframeOptions = "day" | "week" | "month";

export default function RecruiterDashboard() {
  const [timeframe, setTimeframe] = useState<TimeframeOptions>("week");

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon,
    change,
    changeDirection,
  }: StatCardProps) => (
    <div className="bg-[var(--surface)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">
            {title}
          </h3>
          <div className="flex items-baseline">
            <h2 className="text-[var(--text-primary)] text-2xl font-bold">
              {value}
            </h2>
            {change !== undefined && (
              <span
                className={`ml-2 text-sm ${
                  changeDirection === "up" ? "text-green-400" : "text-red-400"
                } flex items-center`}
              >
                {changeDirection === "up" ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-2 bg-[var(--blue-highlight)] rounded-lg">{icon}</div>
      </div>
    </div>
  );

  // Chart titles style
  const chartTitle = "text-[var(--text-primary)] font-medium text-lg mb-4";

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text-primary)]">
      <main className="container mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Open Jobs"
            value="42"
            icon={<Briefcase size={24} className="text-[var(--accent)]" />}
            change={3.5}
            changeDirection="up"
          />
          <StatCard
            title="Active Candidates"
            value="187"
            icon={<Users size={24} className="text-[var(--accent)]" />}
            change={8.2}
            changeDirection="up"
          />
          <StatCard
            title="Scheduled Interviews"
            value="28"
            icon={<Calendar size={24} className="text-[var(--accent)]" />}
            change={5.7}
            changeDirection="up"
          />
          <StatCard
            title="Screening Success Rate"
            value="62%"
            icon={<UserCheck size={24} className="text-[var(--accent)]" />}
            change={2.1}
            changeDirection="down"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className={chartTitle}>Candidate Trends</h2>
              <div className="flex bg-[var(--surface-lighter)] rounded-lg overflow-hidden">
                <button
                  className={`px-3 py-1 text-sm ${
                    timeframe === "day"
                      ? "bg-[var(--accent)] text-[var(--dark-bg)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                  onClick={() => setTimeframe("day")}
                >
                  Day
                </button>
                <button
                  className={`px-3 py-1 text-sm ${
                    timeframe === "week"
                      ? "bg-[var(--accent)] text-[var(--dark-bg)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                  onClick={() => setTimeframe("week")}
                >
                  Week
                </button>
                <button
                  className={`px-3 py-1 text-sm ${
                    timeframe === "month"
                      ? "bg-[var(--accent)] text-[var(--dark-bg)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                  onClick={() => setTimeframe("month")}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={candidateTrendsData}>
                  <defs>
                    <linearGradient
                      id="colorCandidates"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--accent)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="candidates"
                    stroke="var(--accent)"
                    fillOpacity={1}
                    fill="url(#colorCandidates)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
            <h2 className={chartTitle}>Candidate Sources</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={candidateSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {candidateSourceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-[var(--surface)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
            <h2 className={chartTitle}>Screening Results</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={screeningStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  <Bar dataKey="count">
                    {screeningStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={SCREENING_COLORS[index % SCREENING_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-lg shadow-lg border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className={chartTitle}>
                Upcoming Interviews{" "}
                <span className="text-[var(--accent)]">(8)</span>
              </h2>
              <button className="px-3 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--dark-bg)] rounded text-sm transition-colors duration-300">
                View All
              </button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[var(--surface-lighter)] rounded-full flex items-center justify-center text-[var(--accent)]">
                      {["AJ", "ML", "TW", "KP"][item - 1]}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">
                        {
                          [
                            "Alex Johnson",
                            "Maria Lopez",
                            "Thomas Wright",
                            "Kelly Patterson",
                          ][item - 1]
                        }
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {
                          [
                            "Senior Developer • Today, 2:00 PM",
                            "UX Designer • Tomorrow, 10:30 AM",
                            "Project Manager • Tomorrow, 3:15 PM",
                            "Marketing Specialist • Apr 6, 11:00 AM",
                          ][item - 1]
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 px-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded text-xs transition-colors duration-300">
                      View
                    </button>
                    <button className="p-1 px-3 bg-[var(--surface-lighter)] hover:bg-[var(--border)] rounded text-xs transition-colors duration-300">
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
