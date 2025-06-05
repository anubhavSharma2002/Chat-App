// ChatBox.js
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("https://baatkaro.onrender.com"); // your backend URL

const ChatBox = ({ userId, chatWith, onBack }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios
      .get(`/api/messages/${userId}/${chatWith}`)
      .then((response) => {
        setMessages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  }, [userId, chatWith]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (
        (data.senderId === userId && data.receiverId === chatWith) ||
        (data.senderId === chatWith && data.receiverId === userId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => socket.off("receive_message");
  }, [userId, chatWith]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      senderId: userId,
      receiverId: chatWith,
      content: message,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }),
    };

    socket.emit("send_message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleBack = () => {
    onBack();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chatbox-container">
      <h2 className="chat-header">Chat with: {chatWith}</h2>
      <div className="messages-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderId === userId ? "sent" : "received"}`}
          >
            <div>{msg.content}</div>
            <span className="timestamp">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-row">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="message-input"
        />
        <button onClick={sendMessage} className="send-button">Send</button>
        <button onClick={handleBack} className="back-button">Back</button>
      </div>
    </div>
  );
};

export default ChatBox;