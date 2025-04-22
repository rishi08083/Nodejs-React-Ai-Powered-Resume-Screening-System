"use client";
import { useState, useEffect, useCallback } from "react";
import { useData } from "../lib/dataContext";

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToDataChange, refreshData, lastUpdated, setLoading } = useData();
  
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setLoading("jobs", true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/job/view`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs data");
      }
      
      const data = await response.json();
      setJobs(data.data);
    } catch (err) {
      setError(err.message || "An error occurred while fetching jobs");
    } finally {
      setIsLoading(false);
      setLoading("jobs", false);
    }
  }, [setLoading]);
  
  useEffect(() => {
    fetchJobs();
    
    // Subscribe to jobs data changes
    const unsubscribe = subscribeToDataChange("jobs", () => {
      fetchJobs();
    });
    
    return unsubscribe;
  }, [fetchJobs, subscribeToDataChange, lastUpdated.jobs]);
  
  const refreshJobs = () => {
    refreshData("jobs");
  };
  
  return { jobs, isLoading, error, refreshJobs };
};