"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Define types for our data structure
type DataTypes = 
  | "jobs" 
  | "candidates" 
  | "analytics" 
  | "parseResume" 
  | "screeningResults"
  | "rcd";

// Define the context shape
interface DataContextType {
  // Data change notification
  refreshData: (type: DataTypes) => void;
  subscribeToDataChange: (type: DataTypes, callback: () => void) => () => void;
  
  // Last updated timestamps for different data types
  lastUpdated: Record<DataTypes, Date | null>;
  
  // Utility methods
  invalidateCache: (type: DataTypes) => void;
  isLoading: Record<DataTypes, boolean>;
  setLoading: (type: DataTypes, loading: boolean) => void;
}

// Create the context with a default value
const DataContext = createContext<DataContextType | null>(null);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Track listeners for each data type
  const [listeners] = useState<Record<DataTypes, Set<() => void>>>({
    jobs: new Set(),
    candidates: new Set(),
    analytics: new Set(),
    parseResume: new Set(),
    screeningResults: new Set(),
    rcd: new Set()
  });

  // Track last updated timestamps
  const [lastUpdated, setLastUpdated] = useState<Record<DataTypes, Date | null>>({
    jobs: null,
    candidates: null,
    analytics: null,
    parseResume: null,
    screeningResults: null,
    rcd: null
  });

  // Track loading state for each data type
  const [isLoading, setIsLoading] = useState<Record<DataTypes, boolean>>({
    jobs: false,
    candidates: false,
    analytics: false,
    parseResume: false,
    screeningResults: false,
    rcd: false
  });

  // Notify all subscribers when data changes
  const refreshData = useCallback((type: DataTypes) => {
    // Update timestamp
    setLastUpdated(prev => ({
      ...prev,
      [type]: new Date()
    }));
    
    // Notify all subscribers
    listeners[type].forEach(callback => callback());
  }, [listeners]);

  // Allow components to subscribe to data changes
  const subscribeToDataChange = useCallback((type: DataTypes, callback: () => void) => {
    listeners[type].add(callback);
    
    // Return unsubscribe function
    return () => {
      listeners[type].delete(callback);
    };
  }, [listeners]);

  // Invalidate cached data (useful for forcing refetches)
  const invalidateCache = useCallback((type: DataTypes) => {
    // Update timestamp to trigger refetches
    setLastUpdated(prev => ({
      ...prev,
      [type]: new Date()
    }));
  }, []);

  // Update loading state for a specific data type
  const setLoading = useCallback((type: DataTypes, loading: boolean) => {
    setIsLoading(prev => ({
      ...prev,
      [type]: loading
    }));
  }, []);

  // Create the context value object
  const contextValue: DataContextType = {
    refreshData,
    subscribeToDataChange,
    lastUpdated,
    invalidateCache,
    isLoading,
    setLoading
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};