"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  ChevronDown,
  ChevronUp,
  UserCheck,
  X,
} from "lucide-react";

const colorPalette = {
  primary: ["#ffb300", "#ffc233", "#ffd166", "#ffdf99", "#ffedcc"],
  success: "#ffb300",
  warning: "#ffd166",
  danger: "#ffc233",
  info: "#60a5fa",
  neutral: "#8b949e",
  accent1: "#0ea5e9",
  accent2: "#14b8a6",
  accent3: "#3b82f6",
  accent4: "#a855f7",
  accent5: "#ec4899",
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeDirection?: "up" | "down";
};

type AnalyticsData = {
  num_of_resumes: number;
  num_of_candidates: number;
  average_screening_score: string;
  day_wise_parse_count: {
    date: string;
    count: string;
  }[];
  outcome: {
    num_of_candidates_on_hold: number;
    num_of_candidates_rejected: string;
    num_of_candidates_selected: string;
  };
  candidate_count_by_job: {
    job_id: number;
    job_title: string;
    candidate_count: string;
  }[];
  candidate_count_by_skill: {
    skill_name: string;
    candidate_count: string;
  }[];
};

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

export default function RecruiterDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/recruiter-analytics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch recruiter analytics data");
        }
        const data = await res.json();
        setAnalyticsData(data.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-[var(--text-secondary)]">No data available</div>
      </div>
    );
  }

  // Format data for charts
  const screeningOutcomeData = [
    {
      name: "Selected",
      value: parseInt(analyticsData.outcome.num_of_candidates_selected),
      color: colorPalette.success,
    },
    {
      name: "Rejected",
      value: parseInt(analyticsData.outcome.num_of_candidates_rejected),
      color: colorPalette.danger,
    },
    {
      name: "On Hold",
      value: analyticsData.outcome.num_of_candidates_on_hold,
      color: colorPalette.warning,
    },
  ];

  const resumesParsedData = analyticsData.day_wise_parse_count.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: parseInt(item.count),
  }));

  const jobDistributionData = analyticsData.candidate_count_by_job.map(
    (job, index) => ({
      name: job.job_title.length > 20 
        ? `${job.job_title.substring(0, 20)}...` 
        : job.job_title,
      fullName: job.job_title,
      value: parseInt(job.candidate_count),
      color: colorPalette.primary[index % colorPalette.primary.length],
    })
  );

  const topSkillsData = analyticsData.candidate_count_by_skill
    .slice(0, 10)
    .map((skill) => ({
      name: skill.skill_name,
      count: parseInt(skill.candidate_count),
    }));

  const chartTitle = "text-[var(--text-primary)] font-semibold text-lg mb-4";

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text-primary)]">
      <main className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Recruiter Dashboard
          <div className="h-1 w-24 bg-[var(--accent)] rounded-full mb-4 mt-2"></div>
        </h1>

        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Resumes"
            value={analyticsData.num_of_resumes}
            icon={<FileText size={24} className="text-[var(--accent)]" />}
          />
          <StatCard
            title="My Candidates"
            value={analyticsData.num_of_candidates}
            icon={<Users size={24} className="text-[var(--accent)]" />}
          />
          <StatCard
            title="Candidates Rejected"
            value={analyticsData.outcome.num_of_candidates_rejected}
            icon={<X size={24} className="text-red-400" />}
          />
          <StatCard
            title="Avg. Screening Score"
            value={`${parseFloat(analyticsData.average_screening_score).toFixed(1)}%`}
            icon={<UserCheck size={24} className="text-[var(--accent)]" />}
          />
        </div>

        {/* Row 1: Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resumes Parsed Over Time */}
          <div className="bg-[var(--surface)] p-8 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>My Resumes Parsed Over Time</h2>
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
                        offset="100%"
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
            <h2 className={chartTitle}>My Candidate Screening Outcomes</h2>
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
                      backgroundColor: "var(--accent)",
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
          {/* Top Skills */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>Top Skills in My Candidates</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSkillsData}
                  layout="vertical"
                  margin={{ left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                    width={100}
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
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    fill="var(--accent)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Job-wise Candidate Distribution */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>My Job-wise Candidate Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {jobDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--accent)",
                      borderColor: "var(--border)",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px var(--shadow)",
                    }}
                    labelStyle={{ color: "white" }}
                    formatter={(value, name, props) => [
                      `${value} candidates`,
                      props.payload.fullName,
                    ]}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    formatter={(value, entry, index) => 
                      jobDistributionData[index].fullName
                    }
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