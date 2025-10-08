import React, { useEffect, useState } from "react";
import { User, Edit2 } from "lucide-react";
import ReceptionistNav from "./ReceptionistNav";
import { useNavigate } from "react-router-dom";

function ReceptionistProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`/receptionist/profile?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please try again.");
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(`/receptionist/profile?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setEditing(false);
        fetchProfile();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error updating profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <ReceptionistNav page="profile">
      <div className="container" style={{ marginTop: "100px", maxWidth: "600px" }}>
        <h2 className="fw-bold mb-4">
          <User size={32} className="me-2 text-primary" />
          My Profile
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={profile.name}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={profile.email}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={profile.phone}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Address</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={profile.address}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          {editing ? (
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success w-100">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => setEditing(true)}
            >
              <Edit2 size={16} className="me-1" />
              Edit Profile
            </button>
          )}
        </form>
      </div>
    </ReceptionistNav>
  );
}

export default ReceptionistProfile;
