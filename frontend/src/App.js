import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import UserSelect from './components/UserSelect';
import ChatBox from './components/ChatBox';

function App() {
  const [screen, setScreen] = useState('login');
  const [userId, setUserId] = useState(null);
  const [chatWith, setChatWith] = useState(null);

  if (screen === 'register') return <Register setScreen={setScreen} />;
  if (screen === 'forgot') return <ForgotPassword setScreen={setScreen} />;
  if (screen === 'login') return <Login setScreen={setScreen} setUserId={setUserId} />;
  if (screen === 'select') return <UserSelect setChatWith={setChatWith} setScreen={setScreen} />;
  if (screen === 'chat') return <ChatBox userId={userId} chatWith={chatWith} setScreen={setScreen} />;

  return null;
}

export default App;
