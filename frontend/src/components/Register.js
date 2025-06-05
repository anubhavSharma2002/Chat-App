import React, { useState } from 'react';
import { api } from '../api';

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

  return (
    <div className="fade-in">
      <h2>Create Account</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleRegister()}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleRegister()}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => setScreen('login')}>Back to Login</button>
    </div>
  );
}

export default Register;
