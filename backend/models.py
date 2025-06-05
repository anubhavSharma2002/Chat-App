from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(100), nullable=False)
    receiver = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # New fields for media support
    media_type = db.Column(db.String(10), nullable=True)  # 'image', 'video' or None
    media_url = db.Column(db.Text, nullable=True)  # base64 string or URL

    def __repr__(self):
        return f"<Message {self.id} from {self.sender} to {self.receiver}>"
