import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';
import './App.css';

function App() {
  const [screen, setScreen] = useState("loading");
  const [userId, setUserId] = useState(null);
  const [chatUserId, setChatUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setScreen("userSelect");
    } else {
      setScreen("login");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    setScreen("login");
  };

  const renderScreen = () => {
    switch (screen) {
      case "login":
        return <Login setScreen={setScreen} setUserId={setUserId} />;
      case "register":
        return <Register setScreen={setScreen} />;
      case "forgotPassword":
        return <ForgotPassword setScreen={setScreen} />;
      case "userSelect":
        return (
          <UserSelect
            setScreen={setScreen}
            userId={userId}
            setChatUserId={setChatUserId}
            logout={logout}
          />
        );
      case "chat":
        return (
          <ChatBox
            setScreen={setScreen}
            userId={userId}
            chatUserId={chatUserId}
            logout={logout}
          />
        );
      default:
        return <div className="loader">Loading...</div>;
    }
  };

  return (
    <div className="App">
      <h1 className="app-title">Baat Karo Na</h1>
      {renderScreen()}
    </div>
  );
}

export default App;