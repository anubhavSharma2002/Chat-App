// socket.js
import { io } from 'socket.io-client';

const socket = io('https://chat-app-4apm.onrender.com', {
  transports: ['websocket'],
  reconnectionAttempts: 5
});

export default socket;
