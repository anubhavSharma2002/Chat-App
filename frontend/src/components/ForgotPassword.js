import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword({ setScreen }) {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/auth/forgot-password', { email });
      alert(res.data.message);
    } catch {
      alert('User not found');
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <input placeholder="Enter your email" onChange={e => setEmail(e.target.value)} />
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={() => setScreen('login')}>Back</button>
    </div>
  );
}

export default ForgotPassword;
