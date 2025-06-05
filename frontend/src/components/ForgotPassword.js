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

  return (
    <div className="fade-in">
      <h2>Forgot Password</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleReset()}
      />
      <button onClick={handleReset}>Reset Password</button>
      <button onClick={() => setScreen('login')}>Back to Login</button>
    </div>
  );
}

export default ForgotPassword;
