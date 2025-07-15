import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditProfile({ loggedInUser, setLoggedInUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Lấy thông tin user hiện tại
    fetch(`http://localhost:8081/api/user/${userId}`)
      .then(res => res.json())
      .then(data => setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        location: data.location || "",
        description: data.description || "",
        occupation: data.occupation || "",
      }));
  }, [userId]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`http://localhost:8081/api/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("Profile updated!");
      // Cập nhật lại thông tin user đăng nhập nếu cần
      setLoggedInUser(u => ({ ...u, ...form }));
      setTimeout(() => navigate(`/users/${userId}`), 1000);
    } else {
      setMessage("Update failed!");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First name"
          style={{ width: "100%", marginBottom: 8 }}
          required
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last name"
          style={{ width: "100%", marginBottom: 8 }}
          required
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location"
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          name="occupation"
          value={form.occupation}
          onChange={handleChange}
          placeholder="Occupation"
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button type="submit" style={{ width: "100%" }}>Save</button>
      </form>
      {message && <p style={{ color: message === "Profile updated!" ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default EditProfile;