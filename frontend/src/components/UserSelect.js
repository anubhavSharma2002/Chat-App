import React, { useState } from 'react';
import axios from 'axios';

function UserSelect({ setChatWith, setScreen }) {
  const [otherId, setOtherId] = useState('');

  const handleStartChat = async () => {
    try {
      const res = await axios.post('http://localhost:5000/auth/check-user', { email: otherId });
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

  return (
    <div>
      <h2>Start Chat</h2>
      <input placeholder="Enter email of user to chat" onChange={e => setOtherId(e.target.value)} />
      <button onClick={handleStartChat}>Chat</button>
      <button onClick={() => setScreen('login')}>Logout</button>
    </div>
  );
}

export default UserSelect;
