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
  Settings,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  Bell,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Sample data for the charts
const applicationTrendsData = [
  { name: "Jan 1", applications: 12 },
  { name: "Jan 2", applications: 19 },
  { name: "Jan 3", applications: 15 },
  { name: "Jan 4", applications: 25 },
  { name: "Jan 5", applications: 32 },
  { name: "Jan 6", applications: 28 },
  { name: "Jan 7", applications: 20 },
  { name: "Jan 8", applications: 24 },
  { name: "Jan 9", applications: 36 },
  { name: "Jan 10", applications: 30 },
  { name: "Jan 11", applications: 42 },
  { name: "Jan 12", applications: 35 },
  { name: "Jan 13", applications: 29 },
  { name: "Jan 14", applications: 38 },
];

const jobCategoriesData = [
  { name: "Technology", value: 35 },
  { name: "Marketing", value: 25 },
  { name: "Sales", value: 20 },
  { name: "Support", value: 15 },
  { name: "Other", value: 5 },
];

const timeToHireData = [
  { name: "Jan", time: 18 },
  { name: "Feb", time: 15 },
  { name: "Mar", time: 20 },
  { name: "Apr", time: 14 },
  { name: "May", time: 12 },
  { name: "Jun", time: 10 },
];

const COLORS = ["#ffb300", "#ffc133", "#ffd066", "#ffde99", "#ffeccc"];

// Type definitions
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeDirection?: "up" | "down";
};

type TimeframeOptions = "day" | "week" | "month";

export default function AdminDashboard() {
  const [timeframe, setTimeframe] = useState<TimeframeOptions>("week");

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon,
    change,
    changeDirection,
  }: StatCardProps) => (
    <div className="bg-gray-900 p-6 rounded-lg  shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-dark-text-secondary text-sm font-medium mb-1">
            {title}
          </h3>
          <div className="flex items-baseline">
            <h2 className="text-dark-text-primary text-2xl font-bold">
              {value}
            </h2>
            {change !== undefined && (
              <span
                className={`ml-2 text-sm ${changeDirection === "up" ? "text-yellow-400" : "text-red-400"} flex items-center`}
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
        <div className="p-2 bg-dark-blue-highlight rounded-lg">{icon}</div>
      </div>
    </div>
  );

  // Chart titles style
  const chartTitle = "text-dark-text-primary font-medium text-lg mb-4";

  return (
    <div className="bg-dark-bg min-h-screen text-dark-text-primary">
      <main className="container mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Job Listings"
            value="248"
            icon={<Briefcase size={24} className="text-dark-accent" />}
            change={5.8}
            changeDirection="up"
          />
          <StatCard
            title="Total Applications Received"
            value="3,845"
            icon={<FileText size={24} className="text-dark-accent" />}
            change={12.4}
            changeDirection="up"
          />
          <StatCard
            title="Total Hires"
            value="124"
            icon={<CheckCircle size={24} className="text-dark-accent" />}
            change={3.2}
            changeDirection="up"
          />
          <StatCard
            title="Recruiters Registered"
            value="86"
            icon={<Users size={24} className="text-dark-accent" />}
            change={8.1}
            changeDirection="up"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className={chartTitle}>Application Trends</h2>
              <div className="flex bg-dark-surface-lighter rounded-lg overflow-hidden ">
                <button
                  className={`px-3 py-1 text-sm ${timeframe === "day" ? "bg-dark-accent text-dark-bg" : "text-dark-text-secondary"}`}
                  onClick={() => setTimeframe("day")}
                >
                  Day
                </button>
                <button
                  className={`px-3 py-1 text-sm ${timeframe === "week" ? "bg-dark-accent text-dark-bg" : "text-dark-text-secondary"}`}
                  onClick={() => setTimeframe("week")}
                >
                  Week
                </button>
                <button
                  className={`px-3 py-1 text-sm ${timeframe === "month" ? "bg-dark-accent text-dark-bg" : "text-dark-text-secondary"}`}
                  onClick={() => setTimeframe("month")}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationTrendsData}>
                  <defs>
                    <linearGradient
                      id="colorApplications"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ffb300" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ffb300" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="name" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161b22",
                      borderColor: "#30363d",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#ffb300"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg  shadow-lg">
            <h2 className={chartTitle}>Job Categories</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobCategoriesData}
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
                    {jobCategoriesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161b22",
                      borderColor: "#30363d",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className={chartTitle}>
              Average Time to Hire{" "}
              <span className="text-dark-accent">(Days)</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeToHireData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="name" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161b22",
                      borderColor: "#30363d",
                    }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#ffb300"
                    strokeWidth={2}
                    dot={{ fill: "#ffb300", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className={chartTitle}>
                Pending Recruiter Requests{" "}
                <span className="text-dark-accent">(12)</span>
              </h2>
              <button className="px-3 py-1 bg-dark-accent hover:bg-dark-accent-hover text-dark-bg rounded text-sm transition-colors duration-300">
                View All
              </button>
            </div>
            <div className="divide-y divide-dark-border">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-dark-surface-lighter rounded-full flex items-center justify-center text-dark-accent">
                      {["JM", "SK", "RD", "PT"][item - 1]}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">
                        {
                          [
                            "Jane Morgan",
                            "Steve Kim",
                            "Rachel Davis",
                            "Peter Thompson",
                          ][item - 1]
                        }
                      </h3>
                      <p className="text-xs text-dark-text-secondary">
                        {
                          [
                            "TechCorp Inc.",
                            "Innovate Solutions",
                            "Design Masters",
                            "Global Reach",
                          ][item - 1]
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 px-3 bg-yellow-600 hover:bg-gray-700 rounded text-xs transition-colors duration-300">
                      Approve
                    </button>
                    <button className="p-1 px-3 bg-gray-600 hover:bg-gray-700 rounded text-xs transition-colors duration-300">
                      Deny
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
