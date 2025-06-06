import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';
import EmojiSpinner from './components/EmojiSpinner'; // ✅ Make sure path is correct

function App() {
  const [screen, setScreen] = useState('login');
  const [userId, setUserId] = useState('');
  const [chatWith, setChatWith] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Spinner loading state

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
      setScreen('userselect');
    }
  }, []);

  const transitionScreen = (nextScreen) => {
    setLoading(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setLoading(false);
    }, 1000); // 1-second spinner animation
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
