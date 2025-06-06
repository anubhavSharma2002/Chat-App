import React from 'react';
import './EmojiSpinner.css';

const EmojiSpinner = () => {
  const emojis = ['💬', '⌛', '💡', '⚡', '✨', '🔄', '🚀', '🌀'];

  return (
    <div className="emoji-spinner-container">
      <div className="emoji-spinner">
        {emojis.map((emoji, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.15}s` }}>
            {emoji}
          </span>
        ))}
      </div>
      <div className="loading-text">Loading Baat Karo Na...</div>
    </div>
  );
};

export default EmojiSpinner;
