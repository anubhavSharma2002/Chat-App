import React, { useState, useEffect } from 'react';
import './UserSelect.css';

function UserSelect({ userId, onSelect, logout }) {
  const [chatWith, setChatWith] = useState('');
  const [savedUsers, setSavedUsers] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedChatUsers') || '[]');
    setSavedUsers(saved);
  }, []);

  const handleSelect = () => {
    if (!chatWith) return;
    if (!savedUsers.includes(chatWith)) {
      const newSaved = [...savedUsers, chatWith];
      localStorage.setItem('savedChatUsers', JSON.stringify(newSaved));
      setSavedUsers(newSaved);
    }
    onSelect(chatWith);
  };

  return (
    <div className="user-select-container">
      <h2>Select User to Chat With</h2>

      <input
        type="text"
        placeholder="Enter User ID"
        value={chatWith}
        onChange={(e) => setChatWith(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSelect();
        }}
      />

      <button onClick={handleSelect}>Chat</button>

      {savedUsers.length > 0 && (
        <div className="saved-users">
          <h3>Previously Chatted With:</h3>
          <ul>
            {savedUsers.map((user, i) => (
              <li key={i}>
                <button
                  onClick={() => {
                    setChatWith(user);
                    onSelect(user);
                  }}
                >
                  {user}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Logout Button */}
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default UserSelect;
