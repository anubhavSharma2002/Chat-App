import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
      setScreen('userselect');
    }
  }, []);

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    setScreen('userselect');
  };

  const handleLogout = () => {
    setUserId('');
    setChatWith('');
    localStorage.removeItem('userId');
    setScreen('login');
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
        <Register
          onLogin={() => setScreen('login')}
        />
      )}
      {screen === 'forgot' && (
        <ForgotPassword
          onBack={() => setScreen('login')}
        />
      )}
      {screen === 'userselect' && (
        <UserSelect
          userId={userId}
          setChatWith={handleChatStart}
          setScreen={setScreen}
          onLogout={handleLogout}
        />
      )}
      {screen === 'chat' && (
        <ChatBox
          sender={userId}
          receiver={chatWith}
          onBack={() => setScreen('userselect')}
        />
      )}
    </div>
  );
}

export default App;
