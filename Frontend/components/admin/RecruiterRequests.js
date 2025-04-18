"use client";

import { useEffect, useState } from "react";
import {
  fetchRecruiterRequests,
  acceptRecruiterRequest,
  rejectRecruiterRequest,
} from "../../api-services/recruiterService";

export default function RecruiterRequests() {
  const [requests, setRequests] = useState([]); // All recruiter requests
  const [filter, setFilter] = useState("pending"); // Current filter: pending, accepted, rejected
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [message, setMessage] = useState(""); // Message to display in the UI
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering

  useEffect(() => {
    // Fetch recruiter requests when the component loads
    const getRequests = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRecruiterRequests();
        // console.log("Fetched recruiter requests:", data.data.users);
        setRequests(data.data.users); // Assuming API returns all requests
      } catch (error) {
        console.error("Error fetching recruiter requests:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getRequests();
  }, []);

  const handleAccept = async (email) => {
    setActionInProgress(email);
    try {
      const response = await acceptRecruiterRequest(email);
      if (response.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req.email === email ? { ...req, is_active: "accepted" } : req
          )
        );
        setMessage("Recruiter request accepted successfully!");
      } else {
        setMessage("Failed to accept the recruiter request.");
      }
    } catch (error) {
      console.error("Error accepting recruiter request:", error);
      setMessage("An error occurred while accepting the request.");
    } finally {
      setActionInProgress(null);
      clearMessageAfterDelay();
    }
  };

  const handleReject = async (email) => {
    setActionInProgress(email);
    try {
      const response = await rejectRecruiterRequest(email);
      if (response.ok) {
        setRequests((prev) =>
          prev.map((req) =>
            req.email === email ? { ...req, is_active: "rejected" } : req
          )
        );
        setMessage("Recruiter request rejected successfully!");
      } else {
        setMessage("Failed to reject the recruiter request.");
      }
    } catch (error) {
      console.error("Error rejecting recruiter request:", error);
      setMessage("An error occurred while rejecting the request.");
    } finally {
      setActionInProgress(null);
      clearMessageAfterDelay();
    }
  };

  // Clear the message after 3 seconds
  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  // Filter requests based on the selected filter and search term
  const filteredRequests = requests.filter(
    (req) =>
      req.is_active === filter &&
      (req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Display Message */}
          {message && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 text-center">
              {message}
            </div>
          )}

          {/* Filter Buttons and Search Bar */}
          <div className="flex justify-between items-center p-4">
            {/* Filter Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Requested
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "accepted"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "rejected"
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Rejected
              </button>
            </div>

            {/* Search Bar */}
            <div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : filteredRequests.length > 0 ? (
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.email}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {request.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {request.email}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {filter === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {filter === "accepted" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReject(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {filter === "rejected" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAccept(request.email)}
                              disabled={actionInProgress === request.email}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                No {filter} requests found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
