const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL; // Get the backend base URL from the environment variable

console.log(BASE_URL);

/**
 * Fetches all recruiter requests.
 * @returns {Promise<Array>} - The list of recruiter requests.
 */
export const fetchRecruiterRequests = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/recruiter/requests`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recruiter requests.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recruiter requests:", error);
    throw error;
  }
};

/**
 * Accepts a recruiter request.
 * @param {string} requestId - The ID of the recruiter request to accept.
 * @returns {Promise<Response>} - The API response.
 */
export const acceptRecruiterRequest = async (requestId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/recruiter/accept/${requestId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to accept recruiter request.");
    }

    return response;
  } catch (error) {
    console.error("Error accepting recruiter request:", error);
    throw error;
  }
};

/**
 * Rejects a recruiter request.
 * @param {string} requestId - The ID of the recruiter request to reject.
 * @returns {Promise<Response>} - The API response.
 */
export const rejectRecruiterRequest = async (requestId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/recruiter/reject/${requestId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to reject recruiter request.");
    }

    return response;
  } catch (error) {
    console.error("Error rejecting recruiter request:", error);
    throw error;
  }
};