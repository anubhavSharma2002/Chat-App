import React, { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import UserSelect from "./UserSelect";
import ChatBox from "./ChatBox";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("login");
  const [userId, setUserId] = useState(null);
  const [chatWith, setChatWith] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("userId");
    if (savedUser) {
      setUserId(savedUser);
      setScreen("userselect");
    }
  }, []);

  const handleLogin = (id) => {
    localStorage.setItem("userId", id);
    setUserId(id);
    setScreen("userselect");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    setScreen("login");
  };

  return (
    <div className="App">
      {screen === "login" && <Login onLogin={handleLogin} onSwitch={() => setScreen("register")} />}
      {screen === "register" && <Register onRegister={handleLogin} onSwitch={() => setScreen("login")} />}
      {screen === "forgot" && <ForgotPassword onBack={() => setScreen("login")} />}
      {screen === "userselect" && (
        <UserSelect
          userId={userId}
          onChatWith={(id) => {
            setChatWith(id);
            setScreen("chat");
          }}
          onLogout={handleLogout}
        />
      )}
      {screen === "chat" && (
        <ChatBox
          userId={userId}
          otherUserId={chatWith}
          onBack={() => setScreen("userselect")}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
