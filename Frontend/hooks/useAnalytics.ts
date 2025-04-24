"use client";
import { useState, useEffect, useCallback } from "react";
import { useData } from "../lib/dataContext";

export const useAnalytics = (recruiterId?: string) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToDataChange, refreshData, lastUpdated, setLoading } = useData();
  
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setLoading("analytics", true);
    setError(null);
    
    try {
      const endpoint = recruiterId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/recruiter?recruiterId=${recruiterId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/recruiter-analytics`;
        
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      
      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (err) {
      setError(err.message || "An error occurred while fetching analytics");
    } finally {
      setIsLoading(false);
      setLoading("analytics", false);
    }
  }, [recruiterId, setLoading]);
  
  useEffect(() => {
    fetchAnalytics();
    
    // Subscribe to analytics data changes
    const unsubscribe = subscribeToDataChange("analytics", () => {
      fetchAnalytics();
    });
    
    return unsubscribe;
  }, [fetchAnalytics, subscribeToDataChange, lastUpdated.analytics]);
  
  const refreshAnalytics = () => {
    refreshData("analytics");
  };
  
  return { analyticsData, isLoading, error, refreshAnalytics };
};