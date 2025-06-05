import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';
import './App.css';

function App() {
  const [screen, setScreen] = useState('loading');
  const [userId, setUserId] = useState(null);
  const [chatWith, setChatWith] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userId');
    setTimeout(() => {
      if (storedUser) {
        setUserId(storedUser);
        setScreen('select');
      } else {
        setScreen('login');
      }
    }, 1000); // simulate loading delay
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case 'login': return <Login setScreen={setScreen} setUserId={setUserId} />;
      case 'register': return <Register setScreen={setScreen} />;
      case 'forgot': return <ForgotPassword setScreen={setScreen} />;
      case 'select': return <UserSelect setChatWith={setChatWith} setScreen={setScreen} />;
      case 'chat': return <ChatBox userId={userId} chatWith={chatWith} setScreen={setScreen} />;
      default: return <div className="spinner"></div>;
    }
  };

  return <div className="app-container fade-in">{renderScreen()}</div>;
}

export default App;
