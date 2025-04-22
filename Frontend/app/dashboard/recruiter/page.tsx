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
  FileText,
  ChevronDown,
  ChevronUp,
  ChartNoAxesCombined,
  UserX,
  UserCheck,
  RefreshCw,
} from "lucide-react";

import { withRole } from "../../../components/withRole";
import { useTheme } from "../../../lib/themeContext";
import { useAnalytics } from "../../../hooks";

const colorPalette = {
  primary: ["#ffb300", "#ffc233", "#ffd166", "#ffdf99", "#ffedcc"],
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#60a5fa",
  neutral: {
    light: ["#7886C7", "#67AE6E", "#f87171", "#1e40af", "#1e40af"],
    dark: ["#7886C7", "#67AE6E", "#f87171", "#1e40af","#FFA725"],
  },
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
  top_skills: {
    skill_name: string;
    candidate_count: string;
  }[];
  num_of_resumes: number;
  num_recommended_candidates: number;
  num_of_candidates: number;
  average_screening_score: string;
  day_wise_parse_count: {
    date: string;
    count: string;
  }[];
  outcome: {
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

function RecruiterDashboard() {
  const { theme } = useTheme();

  const { analyticsData, isLoading, error, refreshAnalytics } = useAnalytics();

  const handleRefresh = () => {
    refreshAnalytics();
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/recruiter-analytics`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       if (!res.ok) {
  //         throw new Error("Failed to fetch analytics data");
  //       }
  //       const data = await res.json();
  //       setAnalyticsData(data.data);
  //     } catch (err) {
  //       setError(
  //         err instanceof Error ? err.message : "An unknown error occurred"
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  if (isLoading) {
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

  // Add your new validation check right here, before data processing starts
  if (
    !analyticsData.day_wise_parse_count ||
    !analyticsData.candidate_count_by_job ||
    !analyticsData.top_skills
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4">
            <FileText size={48} className="text-[var(--text-secondary)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Dashboard Data Unavailable
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            Please upload candidate resumes to view analytics and insights.
          </p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const screeningOutcomeData = [
    {
      name: "Endorsed",
      value:
        parseInt(analyticsData.outcome?.num_of_candidates_selected || "0") || 0,
      color: colorPalette.success,
    },
    {
      name: "Not Endorsed",
      value:
        parseInt(analyticsData.outcome?.num_of_candidates_rejected || "0") || 0,
      color: colorPalette.danger,
    },
  ];

  const resumesParsedData = analyticsData.day_wise_parse_count
    ? analyticsData.day_wise_parse_count.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: parseInt(item.count),
      }))
    : [];


  const jobDistributionData = analyticsData.candidate_count_by_job
    ? analyticsData.candidate_count_by_job.map(
        (job: any, index: number) => {
          // Use theme value from context instead of accessing DOM
          const isDarkTheme = theme === "dark";
          const colorArray = isDarkTheme
            ? colorPalette.neutral.light
            : colorPalette.neutral.dark;

          return {
            name: job.job_title,
            value: parseInt(job.candidate_count),
            color: colorArray[index % colorArray.length],
          };
        })
    : [];

  // For topSkillsData
  const topSkillsData = analyticsData.top_skills
    ? analyticsData.top_skills.map((skill) => ({
        name: skill.skill_name,
        count: parseInt(skill.candidate_count),
      }))
    : [];

  const scoreDistributionData = [
    { range: "0-20", count: Math.floor(Math.random() * 20) + 5 },
    { range: "21-40", count: Math.floor(Math.random() * 20) + 10 },
    { range: "41-60", count: Math.floor(Math.random() * 20) + 15 },
    { range: "61-80", count: Math.floor(Math.random() * 20) + 20 },
    { range: "81-100", count: Math.floor(Math.random() * 20) + 10 },
  ];

  const chartTitle = "text-[var(--text-primary)] font-semibold text-lg mb-4";

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text-primary)]">
      <main className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Dashboard
          <div className="h-1 w-24 bg-[var(--accent)] rounded-full mb-4 mt-2"></div>
        </h1>
        {/* KPI Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={
              analyticsData.num_of_candidates === 1
                ? `Total Candidate`
                : `Total Candidates`
            }
            value={analyticsData.num_of_candidates}
            icon={<Users size={24} className="text-[var(--accent)]" />}
            //change={12.5}
            changeDirection="up"
          />
          <StatCard
            title="Candidate Endorsed"
            value={analyticsData.num_recommended_candidates || 0}
            icon={<UserCheck size={24} className="text-green-400" />}
            // change={8.3}
            changeDirection="up"
          />

          <StatCard
            title="Candidate Not Endorsed"
            value={analyticsData.outcome?.num_of_candidates_rejected || "0"}
            icon={<UserX size={24} className="text-red-400" />}
            // change={3.1}
            changeDirection="down"
          />

          <StatCard
            title="Average Screening Score"
            value={`${parseFloat(analyticsData.average_screening_score || "0").toFixed(1)}%`}
            icon={
              <ChartNoAxesCombined size={24} className="text-[var(--accent)]" />
            }
            // change={2.4}
            changeDirection="up"
          />
        </div>
        {/* Row 1: Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resumes Parsed Over Time */}
          <div className="bg-[var(--surface)] p-8 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg overflow-hidden">
            <h2 className={chartTitle}>Resumes Parsed Over Time</h2>
            <div className="h-72 mt-4">
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
                    axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg)",
                      borderColor: "var(--accent)",
                      borderWidth: "2px",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      padding: "10px",
                    }}
                    labelStyle={{
                      color: "var(--accent)",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                    itemStyle={{ color: "var(--text-primary)" }}
                    formatter={(value) => [`${value} resumes`, "Count"]}
                    cursor={{
                      stroke: "var(--accent)",
                      strokeWidth: 1,
                      strokeDasharray: "5 5",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorParsed)"
                    activeDot={{
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                      r: 6,
                      fill: "var(--accent)",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Candidate Screening Outcome */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg overflow-hidden">
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
                    stroke="var(--surface)"
                    strokeWidth={2}
                  >
                    {screeningOutcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className="custom-tooltip"
                            style={{
                              backgroundColor: "var(--surface)",
                              border: `2px solid ${data.color}`,
                              padding: "10px 15px",
                              borderRadius: "8px",
                              boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
                            }}
                          >
                            <p
                              className="label"
                              style={{
                                color: data.color,
                                fontWeight: "bold",
                                marginBottom: "5px",
                              }}
                            >
                              {data.name}
                            </p>
                            <p
                              className="value"
                              style={{
                                color: "var(--text-primary)",
                                fontSize: "16px",
                              }}
                            >
                              {data.value}
                            </p>
                            <p
                              className="percentage"
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "12px",
                                marginTop: "5px",
                              }}
                            >
                              {(
                                (data.value /
                                  (analyticsData.num_of_candidates || 1)) *
                                100
                              ).toFixed(2)}
                              %
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      fontSize: "12px",
                      paddingTop: "20px",
                      fontWeight: "bold",
                    }}
                    iconType="circle"
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job-wise Candidate Distribution */}
          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>Job-wise Candidate Distribution</h2>
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
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className="custom-tooltip"
                            style={{
                              backgroundColor: "var(--surface)",
                              border: `2px solid ${data.color}`,
                              padding: "10px 15px",
                              borderRadius: "8px",
                              boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
                            }}
                          >
                            <p
                              style={{
                                color: data.color,
                                fontWeight: "bold",
                                marginBottom: "5px",
                              }}
                            >
                              {data.name}
                            </p>
                            <p
                              style={{
                                color: "var(--text-primary)",
                                fontSize: "16px",
                              }}
                            >
                              {data.value}
                            </p>
                            <p
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "12px",
                                marginTop: "5px",
                              }}
                            >
                              {(
                                (data.value /
                                  jobDistributionData.reduce(
                                    (sum, item) => sum + item.value,
                                    0
                                  )) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
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

          <div className="bg-[var(--surface)] p-6 rounded-xl shadow-md border border-[var(--border)] transition-all hover:shadow-lg">
            <h2 className={chartTitle}>Top Skills Among Candidates</h2>
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
                    formatter={(value) => [`${value}`, "Count"]}
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
        </div>
      </main>
    </div>
  );
}

export default withRole(RecruiterDashboard, ["recruiter"]);
