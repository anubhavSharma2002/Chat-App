import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserSelect.css';

const UserSelect = ({
  contactNames,
  chatHistory,
  setSelectedUser,
  setChatHistory,
}) => {
  const navigate = useNavigate();

  const handleChatHistoryClick = (id) => {
    setSelectedUser(id);
    navigate(`/chat/${id}`);
  };

  const handlePickContact = () => {
    navigate('/pick-user');
  };

  return (
    <div className="user-select-container">
      {/* Header */}
      <div className="header">
        <h2>WhatsApp</h2>
        <div className="header-icons">
          <span className="material-icons">qr_code_scanner</span>
          <span className="material-icons">camera_alt</span>
          <span className="material-icons">more_vert</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className="active-tab">All</button>
        <button>Unread</button>
        <button>Favourites</button>
        <button>Groups</button>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {chatHistory.map((id) => (
          <div
            className="chat-item"
            key={id}
            onClick={() => handleChatHistoryClick(id)}
          >
            <div className="chat-avatar">
              <div className="circle-avatar">
                {contactNames[id]?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
            <div className="chat-details">
              <div className="chat-name">{contactNames[id] || id}</div>
              <div className="chat-preview">Tap to chat</div>
            </div>
            <div className="chat-meta">
              <div className="chat-time">Now</div>
              <div className="chat-unread">1</div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fab" onClick={handlePickContact}>+</div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">Chats</div>
        <div className="nav-item">Updates</div>
        <div className="nav-item">Communities</div>
        <div className="nav-item">Calls</div>
      </div>
    </div>
  );
};

export default UserSelect;
