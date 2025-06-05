# app.py

import os
import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS
from models import db, Message, User
from auth import auth_bp

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration for SQLite and SQLAlchemy
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize DB and register auth blueprint
db.init_app(app)
app.register_blueprint(auth_bp)

# Initialize SocketIO with async_mode set for eventlet
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Store online users
online_users = {}

@app.before_first_request
def create_tables():
    db.create_all()

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")
    for user_id, sid in list(online_users.items()):
        if sid == request.sid:
            del online_users[user_id]
            print(f"User {user_id} disconnected")

@socketio.on('join')
def handle_join(data):
    user_id = data.get("user_id")
    if user_id:
        online_users[user_id] = request.sid
        print(f"User {user_id} joined with SID {request.sid}")

@socketio.on('send_message')
def handle_send_message(data):
    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    message = data.get("message")

    if not all([sender_id, receiver_id, message]):
        return

    new_message = Message(sender_id=sender_id, receiver_id=receiver_id, content=message)
    db.session.add(new_message)
    db.session.commit()

    # Check if receiver is online
    receiver_sid = online_users.get(receiver_id)
    if receiver_sid:
        emit('receive_message', {
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message": message
        }, room=receiver_sid)
    else:
        print(f"User {receiver_id} is offline. Message stored.")

# Required to allow health check from Render
@app.route('/')
def index():
    return "Chat server is running."

# -------------------------
# DEPLOYMENT-READY ENTRYPOINT
# -------------------------

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render sets PORT dynamically
    socketio.run(app, host='0.0.0.0', port=port)
