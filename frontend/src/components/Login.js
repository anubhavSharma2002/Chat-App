import React, { useState } from 'react';
import axios from 'axios';

function Login({ setScreen, setUserId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password });
      setUserId(res.data.user_id);
      setScreen('select');
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => setScreen('register')}>Register</button>
      <button onClick={() => setScreen('forgot')}>Forgot Password?</button>
    </div>
  );
}

export default Login;
