import React, { useState } from 'react';
import { api } from '../api';

function ForgotPassword({ setScreen }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleReset();
  };

  return (
    <div className="form-container">
      <h2>Forgot Password</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} />
      <button onClick={handleReset}>Reset Password</button>
      <button onClick={() => setScreen('login')}>Back to Login</button>
    </div>
  );
}

export default ForgotPassword;
// ANubhav