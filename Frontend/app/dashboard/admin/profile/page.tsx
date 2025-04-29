"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../lib/auth";
import toastService from "../../../../utils/toastService";
import { useToastInit } from "../../../../hooks/useToastInit";

import { withRole } from "../../../../components/withRole";

function Profile() {
  useToastInit();
  const router = useRouter();
  const { user, checkAuth, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });
  const [originalData, setOriginalData] = useState({ name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordChangeConfirmed, setIsPasswordChangeConfirmed] =
    useState(false);

  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    isFormValid: false,
    isProfileFormValid: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
      setOriginalData({ name: user.name, email: user.email });
    }
  }, [user]);

  const hasChanges =
    formData.name !== originalData.name ||
    formData.email !== originalData.email;

  const validateProfileForm = () => {
    const { name, email } = formData;
    let nameError = "";
    let emailError = "";
    let isValid = true;

    const trimmedName = name.trim().replace(/\s+/g, " ");
    const nameRegex = /^[A-Za-z]+( [A-Za-z]+)?$/;

    if (!trimmedName) {
      nameError = "Name is required.";
      isValid = false;
    } else if (!nameRegex.test(trimmedName)) {
      nameError =
        "Name must contain only alphabets and a single space between first and last name.";
      isValid = false;
    } else if (trimmedName.length < 2) {
      nameError = "Name must be at least 2 characters long.";
      isValid = false;
    } else if (trimmedName.length > 50) {
      nameError = "Name must be less than 50 characters long.";
      isValid = false;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9._-]){0,48}[a-zA-Z0-9]@([a-zA-Z0-9]([a-zA-Z0-9-]){0,48}[a-zA-Z0-9]\.){1,2}[a-zA-Z]{2,6}$/;

    if (!trimmedEmail) {
      emailError = "Email is required.";
      isValid = false;
    } else if (trimmedEmail.length < 8) {
      emailError = "Email must be at least 8 characters long.";
      isValid = false;
    } else if (trimmedEmail.length > 100) {
      emailError = "Email must be less than 100 characters long.";
      isValid = false;
    } else if (/\.{2,}/.test(trimmedEmail)) {
      emailError = "Email cannot contain consecutive dots.";
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      emailError = "Please enter a valid email address.";
      isValid = false;
    } else if (/[^a-zA-Z0-9.@_-]/.test(trimmedEmail)) {
      emailError = "Email can only contain letters, numbers, and . @ _ -";
      isValid = false;
    } else if (
      /^[^a-zA-Z0-9]/.test(trimmedEmail) ||
      /[^a-zA-Z0-9]$/.test(trimmedEmail.split("@")[0])
    ) {
      emailError = "Email username must start and end with a letter or number.";
      isValid = false;
    }

    // Additional checks for domain
    const domainPart = trimmedEmail.split("@")[1];
    if (domainPart) {
      if (
        !/^[a-zA-Z0-9]/.test(domainPart) ||
        !/[a-zA-Z0-9]$/.test(domainPart)
      ) {
        emailError = "Domain must start and end with a letter or number.";
        isValid = false;
      } else if (domainPart.split(".").some((part) => part.length < 2)) {
        emailError = "Each domain part must be at least 2 characters long.";
        isValid = false;
      } else if (domainPart.split(".").length > 3) {
        emailError = "Email domain cannot have more than 2 dots.";
        isValid = false;
      }
    }

    setValidationErrors((prev) => ({
      ...prev,
      name: nameError,
      email: emailError,
      isProfileFormValid: isValid && hasChanges,
    }));
  };

  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = formData;
    let newPasswordError = "";
    let confirmPasswordError = "";
    let isValid = true;

    if (newPassword.length < 8) {
      newPasswordError = "Password must be at least 8 characters.";
      isValid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
      newPasswordError = "Password must include at least one uppercase letter.";
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      newPasswordError =
        "Password must include at least one special character.";
      isValid = false;
    } else if (newPassword === currentPassword) {
      newPasswordError =
        "New password must be different from current password.";
      isValid = false;
    }

    if (confirmPassword !== newPassword) {
      confirmPasswordError = "Passwords do not match.";
      isValid = false;
    }

    setValidationErrors((prev) => ({
      ...prev,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
      isFormValid: isValid,
    }));
  };

  useEffect(() => {
    if (changePasswordMode) {
      validatePasswordForm();
    }
    if (editMode) {
      validateProfileForm();
    }
  }, [
    formData.newPassword,
    formData.confirmPassword,
    formData.currentPassword,
    formData.name,
    formData.email,
    hasChanges,
  ]);

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
      if (response.ok) {
        toastService.success("Profile updated successfully!");
        setUser(data.data.user);
        setOriginalData({ name: formData.name, email: formData.email });
        setEditMode(false);
      } else {
        toastService.error(data.error?.details || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toastService.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toastService.error("Passwords do not match");
      setIsLogoutModalOpen(false);
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
      if (response.ok) {
        toastService.success("Password changed successfully. Please log in again.");
        setUser(null);
        localStorage.removeItem("token");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toastService.error(data.error?.details || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toastService.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setIsLogoutModalOpen(false);
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

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-initials">{getInitials(formData.name)}</span>
        </div>
        <div className="profile-header-info">
          <h1>{formData.name}</h1>
          <p className="user-role">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </p>
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
                {validationErrors.name && (
                  <p className="error-text">{validationErrors.name}</p>
                )}
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
                {validationErrors.email && (
                  <p className="error-text">{validationErrors.email}</p>
                )}
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={user.role} disabled readOnly />
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
                  disabled={!validationErrors.isProfileFormValid || loading}
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
                <span className="detail-value">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
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

          {isLogoutModalOpen && (
            <div className="logout-modal-overlay">
              <div className="logout-modal">
                <h2>Confirm Password Change</h2>
                <p>You will be logged out. Continue?</p>
                <div className="logout-modal-buttons">
                  <button
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmLogout}
                    className="logout-confirm-button"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
          {!changePasswordMode && (
            <div className="security-info">
              <p className="text-sm text-[var(--text-secondary)] font-medium">
                <strong>Note: </strong> Updating your account password will
                enhance security, and you will be logged out automatically after
                the update.
              </p>
            </div>
          )}

          {changePasswordMode && (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={formData.showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <span
                    className="toggle-password-inside"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        showCurrentPassword: !prev.showCurrentPassword,
                      }))
                    }
                  >
                    {formData.showCurrentPassword ? "Hide" : "Show"}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={formData.showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <span
                    className="toggle-password-inside"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        showNewPassword: !prev.showNewPassword,
                      }))
                    }
                  >
                    {formData.showNewPassword ? "Hide" : "Show"}
                  </span>
                </div>
                {validationErrors.newPassword && (
                  <p className="error-text">{validationErrors.newPassword}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={formData.showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <span
                    className="toggle-password-inside"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        showConfirmPassword: !prev.showConfirmPassword,
                      }))
                    }
                  >
                    {formData.showConfirmPassword ? "Hide" : "Show"}
                  </span>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="error-text">
                    {validationErrors.confirmPassword}
                  </p>
                )}
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
                      showCurrentPassword: false,
                      showNewPassword: false,
                      showConfirmPassword: false,
                    }));
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading || !validationErrors.isFormValid}
                >
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

export default withRole(Profile, ['admin']);