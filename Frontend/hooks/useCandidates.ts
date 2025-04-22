"use client";
import { useState, useEffect, useCallback } from "react";
import { useData } from "../lib/dataContext";

export const useCandidates = (jobId?: string) => {
  const [candidates, setcandidates] = useState([]);
  const [originalCandidates, setOriginalCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribeToDataChange, refreshData, lastUpdated, setLoading } = useData();
  
  const fetchCandidates = useCallback(async () => {
    if (!jobId) {
      setcandidates([]);
      setOriginalCandidates([]);
      setIsLoading(false);
      setError(null); // Clear any previous errors
      return;
    }
    
    setIsLoading(true);
    setLoading("candidates", true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/candidates/list/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch candidates data: ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data.candidates)) {
        setcandidates(data.data.candidates);
        setOriginalCandidates(data.data.candidates);
      } else {
        console.log("No candidates found or invalid response structure:", data);
        setcandidates([]);
        setOriginalCandidates([]);
      }
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError(err.message || "An error occurred while fetching candidates");
      setcandidates([]);
      setOriginalCandidates([]);
    } finally {
      setIsLoading(false);
      setLoading("candidates", false);
    }
  }, [jobId, setLoading]);
  
  useEffect(() => {
    fetchCandidates();
    
    // Subscribe to candidates data changes
    const unsubscribe = subscribeToDataChange("candidates", () => {
      fetchCandidates();
    });
    
    return unsubscribe;
  }, [fetchCandidates, subscribeToDataChange, lastUpdated.candidates]);
  
  const refreshCandidates = () => {
    refreshData("candidates");
  };
  
  return { candidates, originalCandidates, isLoading, error, refreshCandidates, setcandidates, setOriginalCandidates };
};