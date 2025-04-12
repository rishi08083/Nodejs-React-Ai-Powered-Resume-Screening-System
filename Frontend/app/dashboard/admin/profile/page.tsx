"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const router = useRouter();
  const { user, checkAuth, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [originalData, setOriginalData] = useState({ name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [joinedDate, setJoinedDate] = useState("");

  // Debugging logs
  useEffect(() => {
    console.log("useEffect triggered. Current user:", user);

    if (user) {
      console.log("User createdAt value:", user.createdAt);

      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));

      setOriginalData({ name: user.name, email: user.email });

      if (user.createdAt) {
        const formattedDate = new Date(user.createdAt).toLocaleDateString();
        setJoinedDate(formattedDate);
        console.log("Formatted joinedDate:", formattedDate);
      } else {
        console.warn("createdAt is missing from user object");
      }
    }
  }, [user]);

  const hasChanges =
    formData.name !== originalData.name ||
    formData.email !== originalData.email;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
          }),
        }
      );

      const data = await response.json();
      console.log("Update profile response:", data);

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setUser(data.data.user);
        setOriginalData({ name: formData.name, email: formData.email });
        setEditMode(false);
      } else {
        toast.error(data.error?.details || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !window.confirm(
        "Are you sure you want to change your password? You will be logged out."
      )
    ) {
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();
      console.log("Change password response:", data);

      if (response.ok) {
        toast.success("Password changed successfully. Please log in again.");
        setUser(null);
        localStorage.removeItem("token");

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast.error(data.error?.details || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "U";
  };

  if (!user) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-initials">{getInitials(formData.name)}</span>
        </div>
        <div className="profile-header-info">
          <h1>{formData.name}</h1>
          <p className="user-role">{user.role}</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <h2>Profile Details</h2>
            {!editMode && (
              <button className="btn-edit" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={user.role} disabled readOnly />
              </div>
              <div className="form-group">
                <label>Joined Date</label>
                <input type="text" value={joinedDate} disabled readOnly />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setEditMode(false);
                    setFormData((prev) => ({
                      ...prev,
                      name: user.name,
                      email: user.email,
                    }));
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={!hasChanges || loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{formData.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{formData.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{user.role}</span>
              </div>
              <div className="detail-item">
                <strong>Joined Date:</strong>{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </div>
            </div>
          )}
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2>Security</h2>
            {!changePasswordMode && (
              <button
                className="btn-edit"
                onClick={() => setChangePasswordMode(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {!changePasswordMode && (
            <div className="security-info">
              <p className="text-sm text-gray-600">
                You can change your account password here for security purposes.
                Once updated, you’ll be logged out automatically.
              </p>
            </div>
          )}

          {changePasswordMode && (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setChangePasswordMode(false);
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    }));
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
