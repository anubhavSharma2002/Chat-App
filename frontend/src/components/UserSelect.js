import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { FaBook, FaTrashAlt } from 'react-icons/fa';
import './UserSelect.css';
import io from 'socket.io-client';

const socket = io('https://chat-app-4apm.onrender.com');

function UserSelect({ userId, setChatWith, setScreen, onLogout }) {
  const [otherId, setOtherId] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [contactNames, setContactNames] = useState({});

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    const names = JSON.parse(localStorage.getItem(`${userId}_contactNames`)) || {};
    setChatHistory(history);
    setContactNames(names);

    // For any unknown users in history, fetch their name from backend
    history.forEach(async (id) => {
      if (!names[id]) {
        try {
          const res = await api.get(`/user-info/${id}`);
          if (res.data.name) {
            const updatedNames = { ...names, [id]: res.data.name };
            setContactNames(updatedNames);
            localStorage.setItem(`${userId}_contactNames`, JSON.stringify(updatedNames));
          }
        } catch {
          // User not found or error - just ignore
        }
      }
    });

    socket.on('receive_message', (data) => {
      if (data.receiver === userId) {
        addToChatHistory(data.sender);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [userId]);

  const addToChatHistory = (chatUserId, name = '') => {
    let history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    let names = JSON.parse(localStorage.getItem(`${userId}_contactNames`)) || {};

    if (!history.includes(chatUserId)) {
      history.unshift(chatUserId);
      localStorage.setItem(`${userId}_chatHistory`, JSON.stringify(history));
    }

    if (name && !names[chatUserId]) {
      names[chatUserId] = name;
      localStorage.setItem(`${userId}_contactNames`, JSON.stringify(names));
    }

    setChatHistory([...new Set(history)]);
    setContactNames(names);
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
        const props = ['tel', 'name'];
        const opts = { multiple: false };
        const contacts = await navigator.contacts.select(props, opts);
        const contact = contacts[0];
        const phoneNumber = contact?.tel?.[0]?.replace(/\D/g, '').slice(-10);
        const name = contact?.name?.[0];

        if (phoneNumber && /^[6-9]\d{9}$/.test(phoneNumber)) {
          setOtherId(phoneNumber);
          addToChatHistory(phoneNumber, name || '');
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

  // New: Remove user from recent chats
  const handleDeleteChat = (id) => {
    let history = JSON.parse(localStorage.getItem(`${userId}_chatHistory`)) || [];
    let names = JSON.parse(localStorage.getItem(`${userId}_contactNames`)) || {};

    history = history.filter(item => item !== id);
    delete names[id];

    localStorage.setItem(`${userId}_chatHistory`, JSON.stringify(history));
    localStorage.setItem(`${userId}_contactNames`, JSON.stringify(names));

    setChatHistory(history);
    setContactNames(names);
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
                <th>Contact</th>
                <th>Action</th> {/* New header for delete */}
              </tr>
            </thead>
            <tbody>
              {chatHistory.map((id) => (
                <tr key={id}>
                  <td onClick={() => handleChatHistoryClick(id)} style={{ cursor: 'pointer' }}>
                    {contactNames[id] || id}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteChat(id)}
                      className="delete-btn"
                      title="Delete from recent chats"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
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
