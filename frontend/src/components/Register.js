import React, { useState } from 'react';
import { api } from '../api';

function Register({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const isValidPhone = (number) => /^[6-9]\d{9}$/.test(number);

  const handleRegister = async () => {
    if (!isValidPhone(phone)) {
      alert('Enter a valid 10-digit phone number starting with 6-9');
      return;
    }

    try {
      const res = await api.post('/auth/register', { email: phone, password });
      alert(res.data.message);
      onLogin();
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <input
        placeholder="Phone Number"
        onChange={e => setPhone(e.target.value)}
        onKeyDown={handleKey}
        maxLength={10}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        onKeyDown={handleKey}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={onLogin}>Go to Login</button>
    </div>
  );
}

export default Register;
