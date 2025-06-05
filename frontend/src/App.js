import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';
import './App.css';

function App() {
  const [screen, setScreen] = useState('login');
  const [userId, setUserId] = useState(null);
  const [chatWith, setChatWith] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('userId');
    if (storedUser) {
      setUserId(storedUser);
      setScreen('select');
    }
  }, []);

  const handleScreenChange = (targetScreen) => {
    setLoading(true);
    setTimeout(() => {
      setScreen(targetScreen);
      setLoading(false);
    }, 500); // Add a short delay to show loader
  };

  return (
    <div className="app-container">
      {loading && <div className="loader"></div>}
      {!loading && (
        <>
          {screen === 'register' && <Register setScreen={handleScreenChange} />}
          {screen === 'forgot' && <ForgotPassword setScreen={handleScreenChange} />}
          {screen === 'login' && (
            <Login setScreen={handleScreenChange} setUserId={setUserId} />
          )}
          {screen === 'select' && (
            <UserSelect setChatWith={setChatWith} setScreen={handleScreenChange} />
          )}
          {screen === 'chat' && (
            <ChatBox userId={userId} chatWith={chatWith} setScreen={handleScreenChange} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
