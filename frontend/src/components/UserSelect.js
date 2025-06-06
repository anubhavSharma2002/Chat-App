import React, { useEffect, useState } from 'react';
import { api } from '../api';

function UserSelect({ userId, setChatWith, setScreen, onLogout }) {
  const [otherId, setOtherId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    setChatHistory(history);
  }, [userId]);

  const addToChatHistory = (chatUserId) => {
    let history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    if (!history.includes(chatUserId)) {
      history.push(chatUserId);
      localStorage.setItem(`${userId}_chatHistory`, JSON.stringify(history));
      setChatHistory(history);
    }
  };

  const handleStartChat = async () => {
    if (!/^[6-9]\d{9}$/.test(otherId)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    try {
      const res = await api.post('/auth/check-user', { email: otherId });
      if (res.data.exists) {
        addToChatHistory(otherId);
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

  const handleChatHistoryClick = (id) => {
    setChatWith(id);
    setScreen('chat');
  };

  const handlePickContact = async () => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['tel'];
        const opts = { multiple: false };
        const contacts = await navigator.contacts.select(props, opts);
        const phoneNumber = contacts[0]?.tel?.[0]?.replace(/\D/g, '').slice(-10);
        if (phoneNumber && /^[6-9]\d{9}$/.test(phoneNumber)) {
          setOtherId(phoneNumber);
        } else {
          alert('Selected contact does not have a valid 10-digit mobile number.');
        }
      } catch (err) {
        alert('Permission denied or error selecting contact.');
      }
    } else {
      alert('Contact Picker API not supported on this device.');
    }
  };

  return (
    <div className="form-container">
      <h2>Start Chat</h2>

      {chatHistory.length > 0 && (
        <>
          <h3>Recent Chats</h3>
          <ul className="chat-history-list">
            {chatHistory.map((id) => (
              <li
                key={id}
                onClick={() => handleChatHistoryClick(id)}
                className="chat-history-item"
              >
                {id}
              </li>
            ))}
          </ul>
        </>
      )}

      <input
        placeholder="Enter 10-digit phone number"
        value={otherId}
        onChange={e => setOtherId(e.target.value)}
        onKeyDown={handleKey}
        maxLength={10}
      />
      <button onClick={handleStartChat}>Chat</button>
      <button onClick={handlePickContact}>Pick from Contacts</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default UserSelect;
