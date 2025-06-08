import React, { useState } from 'react';
import UserSelect from './UserSelect';
import ChatBox from './ChatBox';
import './MainChat.css';

export default function MainChat({ userId, onLogout }) {
  const [chatWith, setChatWith] = useState(null);

  return (
    <div className="main-chat-container">
      <div className="user-list-pane">
        <UserSelect
          userId={userId}
          setChatWith={setChatWith}
          onLogout={onLogout}
          setScreen={() => {}}
        />
      </div>
      <div className="chat-pane">
        {chatWith ? (
          <ChatBox sender={userId} receiver={chatWith} onBack={() => setChatWith(null)} />
        ) : (
          <div className="placeholder">Select a contact to start chatting</div>
        )}
      </div>
    </div>
  );
}
