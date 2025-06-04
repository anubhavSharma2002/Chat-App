import React, { useState } from 'react';
import axios from 'axios';

function Register({ setScreen }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:5000/auth/register', { email, password });
      alert(res.data.message);
      setScreen('login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => setScreen('login')}>Go to Login</button>
    </div>
  );
}

export default Register;
