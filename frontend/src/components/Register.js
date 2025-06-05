import React, { useState } from 'react';
import axios from 'axios';

function Register({ goToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://chat-app-4apm.onrender.com/auth/register',
        { username, password },
        { withCredentials: true }
      );
      alert(res.data.message);
      goToLogin();
    } catch (err) {
      console.error("Register Error:", err);
      if (err.response) {
        alert(err.response.data.message || "Registration failed");
      } else {
        alert("Network error or server down");
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Register</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
