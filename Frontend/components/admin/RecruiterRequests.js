"use client";

import { useEffect, useState } from "react";
// import { fetchRecruiterRequests, acceptRecruiterRequest, rejectRecruiterRequest } from "../../../api-services/recruiterService"; // Import service functions

export default function RecruiterRequests() {
  const [requests, setRequests] = useState([]); // State to store recruiter requests
  const [message, setMessage] = useState(""); // State to display messages


  useEffect(() => {
    const data = [
      { id: "1", name: "John Doe", email: "john.doe@example.com", company: "TechCorp" },
      { id: "2", name: "Jane Smith", email: "jane.smith@example.com", company: "Innovate Inc." },
    ];
    setRequests(data);
  //   // Fetch recruiter requests when the component loads
  //   const getRequests = async () => {
  //     try {
  //       const data = await fetchRecruiterRequests();
  //       // setRequests(data);
  //       // currenty this is the demo data 
        
  //     } catch (error) {
  //       console.error("Error fetching recruiter requests:", error);
  //       setMessage("Failed to fetch recruiter requests.");
  //     }
  //   };

    // getRequests();
  }, []);

  const handleAccept = async (requestId) => {
    // try {
      // const response = await acceptRecruiterRequest(requestId);
      // if (response.ok) {
        setMessage("Request accepted successfully!");
        setRequests(requests.filter((req) => req.id !== requestId)); // Remove the accepted request from the list
      // } else {
        // setMessage("Failed to accept the request.");
      // }
    // } catch (error) {
      // console.error("Error accepting recruiter request:", error);
      // setMessage("An error occurred while accepting the request.");
    // }
  };

  const handleReject = async (requestId) => {
  //   try {
  //     const response = await rejectRecruiterRequest(requestId);
  //     if (response.ok) {
        setMessage("Request rejected successfully!");
        setRequests(requests.filter((req) => req.id !== requestId)); // Remove the rejected request from the list
  //     } else {
  //       setMessage("Failed to reject the request.");
  //     }
  //   } catch (error) {
  //     console.error("Error rejecting recruiter request:", error);
  //     setMessage("An error occurred while rejecting the request.");
  //   }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* <h1 className="text-2xl font-bold mb-4">Recruiter Requests</h1> */}
      {message && (
        <div className={`mb-4 text-center font-medium ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
      {requests.length > 0 ? (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id} className="p-4 border rounded-lg shadow-md bg-white">
              <p><strong>Name:</strong> {request.name}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <div className="mt-2 flex space-x-4">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recruiter requests found.</p>
      )}
    </div>
  );
}