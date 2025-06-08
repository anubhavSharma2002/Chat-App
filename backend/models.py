from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(10), unique=True, nullable=False)  # 📱 Use phone instead of email
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    recent_chats = db.Column(JSON, default=[])

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(120), nullable=False)
    receiver = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
