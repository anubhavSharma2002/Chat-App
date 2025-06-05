import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./ChatBox.css";

const socket = io("https://chat-app-4apm.onrender.com");

function ChatBox({ userId, chatWith, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.emit("join", { user1: userId, user2: chatWith });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [userId, chatWith]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      socket.emit("send_message", {
        sender: userId,
        receiver: chatWith,
        message: inputMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: userId,
          message: inputMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setInputMessage("");
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("sender", userId);
    formData.append("receiver", chatWith);

    const res = await fetch("https://chat-app-4apm.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      setMessages((prev) => [
        ...prev,
        {
          sender: userId,
          message: data.url,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setSelectedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const renderMessage = (msg) => {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(msg.message);
    const isVideo = /\.(mp4|mov)$/i.test(msg.message);
    const isFile = /\.(pdf|docx)$/i.test(msg.message);

    if (isImage) {
      return <img src={msg.message} alt="Media" className="chat-media" />;
    } else if (isVideo) {
      return <video controls className="chat-media"><source src={msg.message} /></video>;
    } else if (isFile) {
      return <a href={msg.message} target="_blank" rel="noopener noreferrer">📄 Download File</a>;
    }
    return <span>{msg.message}</span>;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">←</button>
        <h2>Baat Karo Na – Chat with {chatWith}</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${msg.sender === userId ? "sent" : "received"}`}
          >
            {renderMessage(msg)}
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          id="fileInput"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <button onClick={sendMessage}>Send</button>
        <button onClick={handleFileUpload}>📎</button>
      </div>
    </div>
  );
}

export default ChatBox;
