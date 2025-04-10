"use client";
import React, { useState, useEffect } from "react";
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
  Legend,
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
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import axios from "axios";

// Define a consistent color palette that better aligns with our theme variables
const colorPalette = {
  // Primary colors that work with both light and dark modes
  primary: ["#ffb300", "#ffc233", "#ffd166", "#ffdf99", "#ffedcc"],
  // Status colors
  success: "#4ade80",
  warning: "#ffb300",
  danger: "#f87171",
  info: "#60a5fa",
  neutral: "#8b949e",
  // Additional colors for variety
  accent1: "#0ea5e9",
  accent2: "#14b8a6",
  accent3: "#3b82f6",
  accent4: "#a855f7",
  accent5: "#ec4899",
};

// Sample data
const screeningOutcomeData = [
  { name: "Shortlisted", value: 120, color: colorPalette.success },
  { name: "Rejected", value: 85, color: colorPalette.danger },
  { name: "On Hold", value: 45, color: colorPalette.warning },
  { name: "Needs Review", value: 30, color: colorPalette.accent4 },
];

const resumesParsedData = [
  { date: "Mar 1", count: 5 },
  { date: "Mar 2", count: 8 },
  { date: "Mar 3", count: 12 },
  { date: "Mar 4", count: 15 },
  { date: "Mar 5", count: 10 },
  { date: "Mar 6", count: 18 },
  { date: "Mar 7", count: 20 },
  { date: "Mar 8", count: 25 },
  { date: "Mar 9", count: 22 },
  { date: "Mar 10", count: 28 },
];

const topSkillsData = [
  { name: "JavaScript", count: 85 },
  { name: "Python", count: 65 },
  { name: "React", count: 55 },
  { name: "SQL", count: 48 },
  { name: "Java", count: 42 },
  { name: "Node.js", count: 38 },
  { name: "Docker", count: 25 },
];

const jobDistributionData = [
  { name: "Frontend Developer", value: 35, color: colorPalette.primary[0] },
  { name: "Backend Developer", value: 42, color: colorPalette.primary[1] },
  { name: "Data Scientist", value: 28, color: colorPalette.primary[2] },
  { name: "DevOps Engineer", value: 20, color: colorPalette.primary[3] },
  { name: "Product Manager", value: 15, color: colorPalette.primary[4] },
];

const scoreDistributionData = [
  { range: "0-20", count: 15 },
  { range: "21-40", count: 28 },
  { range: "41-60", count: 42 },
  { range: "61-80", count: 65 },
  { range: "81-100", count: 20 },
];

// Type definitions
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeDirection?: "up" | "down";
};

type TimeframeOptions = "week" | "month" | "year";

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState<TimeframeOptions>("month");
  const [dashboardData, setDashboardData] = useState({
    totalResumes: 280,
    shortlisted: 120,
    rejected: 85,
    avgScore: 68,
  });

  // Add actual API call here when ready
  useEffect(() => {
    // Example API call structure
    // const fetchDashboardData = async () => {
    //   try {
    //     const response = await axios.get('/api/admin/dashboard-stats');
    //     setDashboardData(response.data);
    //   } catch (error) {
    //     console.error('Error fetching dashboard data:', error);
    //   }
    // };
    // fetchDashboardData();
  }, []);

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon,
    change,
    changeDirection,
  }: StatCardProps) => (
    <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-2">
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
        <div className="p-3 bg-[var(--blue-highlight)] rounded-lg">{icon}</div>
      </div>
    </div>
  );

  // Chart titles style
  const chartTitle = "text-[var(--text-primary)] font-semibold text-lg mb-4";

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text-primary)]">
      <main className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Admin Dashboard (Coming Soon)
          <div className="h-1 w-24 bg-[var(--accent)] rounded-full mb-4 mt-2"></div>
        </h1>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Resumes Uploaded"
            value={dashboardData.totalResumes}
            icon={<FileText size={24} className="text-[var(--accent)]" />}
            change={12.5}
            changeDirection="up"
          />
          <StatCard
            title="Candidates Shortlisted"
            value={dashboardData.shortlisted}
            icon={<CheckCircle size={24} className="text-green-400" />}
            change={8.3}
            changeDirection="up"
          />
          <StatCard
            title="Candidates Rejected"
            value={dashboardData.rejected}
            icon={<X size={24} className="text-red-400" />}
            change={3.1}
            changeDirection="down"
          />
          <StatCard
            title="Avg. Screening Score"
            value={`${dashboardData.avgScore}%`}
            icon={<UserCheck size={24} className="text-[var(--accent)]" />}
            change={2.4}
            changeDirection="up"
          />
        </div>

        {/* Row 1: Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resumes Parsed Over Time */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className={chartTitle}>Resumes Parsed Over Time</h2>
              <div className="flex bg-[var(--surface-lighter)] rounded-lg overflow-hidden">
                <button
                  className={`px-4 py-2 text-sm transition-colors ${
                    timeframe === "week"
                      ? "bg-[var(--accent)] text-[var(--bg)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => setTimeframe("week")}
                >
                  Week
                </button>
                <button
                  className={`px-4 py-2 text-sm transition-colors ${
                    timeframe === "month"
                      ? "bg-[var(--accent)] text-[var(--bg)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => setTimeframe("month")}
                >
                  Month
                </button>
                <button
                  className={`px-4 py-2 text-sm transition-colors ${
                    timeframe === "year"
                      ? "bg-[var(--accent)] text-[var(--bg)] font-medium"
                      : "text-[var(--text-secondary)] hover:bg-[var(--accent-hover)] hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => setTimeframe("year")}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resumesParsedData}>
                  <defs>
                    <linearGradient
                      id="colorParsed"
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px var(--shadow)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    formatter={(value) => [`${value} resumes`, "Count"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--accent)"
                    fillOpacity={1}
                    fill="url(#colorParsed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Candidate Screening Outcome */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>Candidate Screening Outcome</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={screeningOutcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {screeningOutcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px var(--shadow)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          

          {/* Screening Score Distribution */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>Screening Score Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="range"
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px var(--shadow)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    formatter={(value) => [`${value} candidates`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                    {scoreDistributionData.map((entry, index) => {
                      // Create a gradient from danger to success
                      const colors = [
                        colorPalette.danger,
                        "#f0a050", // custom orange
                        colorPalette.warning,
                        "#7ac142", // light green
                        colorPalette.success,
                      ];
                      return (
                        <Cell key={`cell-${index}`} fill={colors[index]} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Job-wise Candidate Distribution */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] col-span-1 lg:col-span-3 xl:col-span-1 transition-all hover:shadow-lg">
            <h2 className={chartTitle}>Job-wise Candidate Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${(percent * 100).toFixed(0)}% ${name}`
                    }
                  >
                    {jobDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px var(--shadow)",
                    }}
                    labelStyle={{ color: "var(--text-primary)" }}
                    formatter={(value, name, props) => [
                      `${value} candidates`,
                      props.payload.name,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
}
