from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from models import db, Message
from auth import auth_bp
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
CORS(app, supports_credentials=True)

db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")
app.register_blueprint(auth_bp, url_prefix='/auth')

def get_room_name(user1, user2):
    return "_".join(sorted([user1, user2]))

@socketio.on('join')
def handle_join(data):
    user1 = data['user']
    user2 = data['other_user']
    room = get_room_name(user1, user2)
    join_room(room)

    messages = Message.query.filter(
        ((Message.sender == user1) & (Message.receiver == user2)) |
        ((Message.sender == user2) & (Message.receiver == user1))
    ).order_by(Message.timestamp).all()

    chat_history = [{'sender': m.sender, 'message': m.message, 'timestamp': m.timestamp.isoformat()} for m in messages]
    emit('chat_history', chat_history, to=room)

@socketio.on('send_message')
def handle_message(data):
    sender = data['sender']
    receiver = data['receiver']
    message = data['message']
    room = get_room_name(sender, receiver)

    new_msg = Message(sender=sender, receiver=receiver, message=message)
    db.session.add(new_msg)
    db.session.commit()

    emit('receive_message', {
        'sender': sender,
        'message': message,
        'timestamp': new_msg.timestamp.isoformat()
    }, to=room)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port)
