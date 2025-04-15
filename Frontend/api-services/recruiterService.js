const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // Get the backend base URL from the environment variable

console.log(BASE_URL);

/**
 * Fetches all recruiter requests.
 * @returns {Promise<Array>} - The list of recruiter requests.
 */
export const fetchRecruiterRequests = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/view-recruiter-req`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
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
 * Fetches all recruiter requests.
 * @returns {Promise<Array>} - The list of accepted recruiters.
 */
export const fetchAcceptedRecruiters = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/view-accepted-recruiters`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch accepted recruiters.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching accepted recruiters:", error);
    throw error;
  }
};

/**
 * Fetches all recruiter requests.
 * @returns {Promise<Array>} - The list of accepted recruiters.
 */
export const fetchRejectedRecruiters = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/view-rejected-recruiters`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch rejected recruiters.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching rejected recruiters:", error);
    throw error;
  }
};

/**
 * Accepts a recruiter request.
 * @param {string} email - The email of the recruiter to accept.
 * @returns {Promise<Response>} - The API response.
 */
export const acceptRecruiterRequest = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/approve-recruiter-req`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return response;
  } catch (error) {
    console.error("Error accepting recruiter request:", error);
    throw error;
  }
};

/**
 * Rejects a recruiter request.
 * @param {string} email - The email of the recruiter to reject.
 * @returns {Promise<Response>} - The API response.
 */
export const rejectRecruiterRequest = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/reject-recruiter-req`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return response;
  } catch (error) {
    console.error("Error rejecting recruiter request:", error);
    throw error;
  }
};
/**
 * Registers a new recruiter.
 * @param {Object} formData - The registration data (name, email, password, etc.).
 * @returns {Promise<Object>} - The API response.
 */
export const fetchRecruiterRegister = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // console.log(response.errors.msg,"----------");
    console.log("respm", response);

    // if (!response.ok) {
    //   throw new Error("Failed to register recruiter.");
    // }

    return await response.json();
  } catch (error) {
    // console.log(response.errors.msg,"----------");
    console.error("Error registering recruiter:", error);
    // throw error;
  }
};
