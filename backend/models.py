from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(120), nullable=False)
    receiver = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text)
    image_url = db.Column(db.String)
    public_id = db.Column(db.String)  # ✅ Must be nullable
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

