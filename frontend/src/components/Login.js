import React, { useState } from 'react';
import { api } from '../api';

function Login({ setScreen, setUserId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('userId', res.data.user_id);
      setUserId(res.data.user_id);
      setScreen('select');
    } catch {
      alert('Login failed');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="form-container">
      <h1 className="heading">Baat Karo Na</h1>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => setScreen('register')}>Register</button>
      <button onClick={() => setScreen('forgot')}>Forgot Password?</button>
    </div>
  );
}

export default Login;
