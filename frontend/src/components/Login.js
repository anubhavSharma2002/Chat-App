import React, { useState } from 'react';
import { api } from '../api';

function Login({ setScreen, setUserId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('userId', res.data.userId);
      setUserId(res.data.userId);
      setScreen('select');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="fade-in">
      <h1>Baat Karo Na</h1>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => setScreen('register')}>Register</button>
      <button onClick={() => setScreen('forgot')}>Forgot Password</button>
    </div>
  );
}

export default Login;
