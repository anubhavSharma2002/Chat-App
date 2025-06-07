import React, { useState } from 'react';
import { api } from '../api';
import './Login.css';

function Login({ onLogin, onSwitch, onForgot }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const isValidPhone = (number) => /^[6-9]\d{9}$/.test(number);

  const handleLogin = async () => {
    if (!isValidPhone(phone)) {
      alert('Enter a valid 10-digit phone number starting with 6-9');
      return;
    }
    try {
      const res = await api.post('/auth/login', { email: phone, password });
      localStorage.setItem('userId', res.data.user_id);
      onLogin(res.data.user_id);
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
      <div className="button-group">
        <button onClick={handleLogin} className="login-btn">Login</button>
        <button onClick={onSwitch} className="register-btn">Register</button>
        <button onClick={onForgot} className="forgot-btn">Forgot Password?</button>
      </div>
    </div>
  );
}

export default Login;
