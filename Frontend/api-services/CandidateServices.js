const BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Use the base URL from environment variables

/**
 * Fetches the list of jobs.
 * @returns {Promise<Array>} - The list of jobs.
 */
export const fetchJobs = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/job/view`);
    console.log("Response:", response); // Log the response for debugging

    if (!response.ok) {
      // redirect to login page if not authenticated
      if (response.status === 401) {
        window.location.href = "/login"; // Redirect to login page
      }
      throw new Error("Failed to fetch jobs.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

/**
 * Fetches the list of candidates for a specific job.
 * @param {string} jobId - The ID of the job.
 * @returns {Promise<Array>} - The list of candidates.
 */
export const fetchCandidates = async (jobId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/candidates/list/${jobId}`);
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"; // Redirect to login page
      } else {
        throw new Error("Failed to fetch candidates.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw error;
  }
};

/**
 * Checks the compatibility of a candidate.
 * @param {string} candidateId - The ID of the candidate.
 * @returns {Promise<Object>} - The compatibility response.
 */
export const checkCandidateCompatibility = async (candidateId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/checkCompatibility?candidateId=${candidateId}`
    );
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login"; // Redirect to login page
      } else {
        throw new Error("Failed to check compatibility.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error checking compatibility:", error);
    throw error;
  }
};
