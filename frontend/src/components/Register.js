import React, { useState } from 'react';
import { api } from '../api';
import './Register.css';

function Register({ setScreen }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const res = await api.post('/auth/register', { email, password });
      alert(res.data.message);
      setScreen('login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => setScreen('login')}>Go to Login</button>
    </div>
  );
}

export default Register;
