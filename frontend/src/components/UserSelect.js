import React, { useState } from 'react';
import { api } from '../api';

function UserSelect({ setChatWith, setScreen }) {
  const [otherId, setOtherId] = useState('');

  const handleStartChat = async () => {
    try {
      const res = await api.post('/auth/check-user', { email: otherId });
      if (res.data.exists) {
        setChatWith(otherId);
        setScreen('chat');
      } else {
        alert('User ID not found!');
      }
    } catch {
      alert('Server error. Try again.');
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleStartChat();
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setScreen('login');
  };

  return (
    <div className="form-container">
      <h2>Start Chat</h2>
      <input
        placeholder="Enter email of user to chat"
        onChange={e => setOtherId(e.target.value)}
        onKeyDown={handleKey}
      />
      <button onClick={handleStartChat}>Chat</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default UserSelect;