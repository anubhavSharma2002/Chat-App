import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { FaBook } from 'react-icons/fa';
import './UserSelect.css';

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

  const handleChatHistoryClick = (id) => {
    setChatWith(id);
    setScreen('chat');
  };

  return (
    <div className="user-select-container">
      <button className="logout-btn" onClick={onLogout}>Logout</button>
      <h2 className="heading">Start Chat</h2>
      <div className="input-row">
        <div className="input-icon-wrapper">
          <input
            placeholder="Enter 10-digit phone number"
            value={otherId}
            onChange={e => setOtherId(e.target.value)}
            onKeyDown={handleKey}
            maxLength={10}
          />
          <FaBook className="icon" onClick={handlePickContact} />
        </div>
        <button className="chat-btn" onClick={handleStartChat}>Chat</button>
      </div>

      {chatHistory.length > 0 && (
        <div className="chat-history-table">
          <h3>Recent Chats</h3>
          <table>
            <thead>
              <tr>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {chatHistory.map((id) => (
                <tr key={id} onClick={() => handleChatHistoryClick(id)}>
                  <td>{id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserSelect;
