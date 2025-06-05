// frontend/src/App.js
import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';

function App() {
  const [screen, setScreen] = useState('login');
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');

  const handleLogin = (id) => {
    setUserId(id);
    setScreen('userselect');
  };

  const handleChatStart = (partnerId) => {
    setChatWith(partnerId);
    setScreen('chat');
  };

  return (
    <div className="app-container">
      {screen === 'login' && (
        <Login
          onLogin={handleLogin}
          onSwitch={() => setScreen('register')}
          onForgot={() => setScreen('forgot')}
        />
      )}
      {screen === 'register' && (
        <Register onRegister={() => setScreen('login')} />
      )}
      {screen === 'forgot' && (
        <ForgotPassword onBack={() => setScreen('login')} />
      )}
      {screen === 'userselect' && (
        <UserSelect onChatStart={handleChatStart} userId={userId} />
      )}
      {screen === 'chat' && (
        <ChatBox sender={userId} receiver={chatWith} onBack={() => setScreen('userselect')} />
      )}
    </div>
  );
}

export default App;
