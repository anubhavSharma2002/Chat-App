import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';
import EmojiSpinner from './components/EmojiSpinner';

function App() {
  const [screen, setScreen] = useState('login');
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
      setScreen('userselect');
      window.history.pushState({ screen: 'userselect' }, 'userselect');
    }

    const handlePopState = (event) => {
      const prevScreen = event.state?.screen;
      if (prevScreen) {
        setScreen(prevScreen);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const transitionScreen = (nextScreen) => {
    setLoading(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setLoading(false);
      window.history.pushState({ screen: nextScreen }, nextScreen);
    }, 1000);
  };

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    transitionScreen('userselect');
  };

  const handleLogout = () => {
    setUserId('');
    setChatWith('');
    localStorage.removeItem('userId');
    transitionScreen('login');
  };

  const handleChatStart = (partnerId) => {
    setChatWith(partnerId);
    transitionScreen('chat');
  };

  return (
    <div className="app-container">
      {loading ? (
        <EmojiSpinner />
      ) : (
        <>
          {screen === 'login' && (
            <Login
              onLogin={handleLogin}
              onSwitch={() => transitionScreen('register')}
              onForgot={() => transitionScreen('forgot')}
            />
          )}
          {screen === 'register' && (
            <Register
              onLogin={() => transitionScreen('login')}
            />
          )}
          {screen === 'forgot' && (
            <ForgotPassword
              onBack={() => transitionScreen('login')}
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
              onBack={() => transitionScreen('userselect')}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
