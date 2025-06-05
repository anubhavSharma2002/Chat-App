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

  const handleKey = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} />
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => setScreen('login')}>Go to Login</button>
    </div>
  );
}

export default Register;
