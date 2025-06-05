from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from models import db, Message
from auth import auth_bp
import os

# For emoji suggestion ML
from transformers import pipeline

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, supports_credentials=True)

db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")
app.register_blueprint(auth_bp, url_prefix='/auth')

# Initialize emoji sentiment pipeline once
emoji_suggester = pipeline("sentiment-analysis")

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

    chat_history = []
    for m in messages:
        # Include media type and URL if present
        chat_history.append({
            'sender': m.sender,
            'message': m.message,
            'timestamp': m.timestamp.isoformat(),
            'media_type': getattr(m, 'media_type', None),
            'media_url': getattr(m, 'media_url', None),
        })

    emit('chat_history', chat_history, to=room)

@socketio.on('send_message')
def handle_message(data):
    sender = data['sender']
    receiver = data['receiver']
    message = data.get('message', None)
    media_type = data.get('media_type', None)  # 'image' or 'video' or None
    media_url = data.get('media_url', None)    # base64 string or URL

    room = get_room_name(sender, receiver)

    # Store message with optional media
    new_msg = Message(
        sender=sender,
        receiver=receiver,
        message=message if message else '',
    )
    # Add media attributes to Message model dynamically or extend model
    if media_type:
        new_msg.media_type = media_type
        new_msg.media_url = media_url

    db.session.add(new_msg)
    db.session.commit()

    emit('receive_message', {
        'sender': sender,
        'message': message,
        'timestamp': new_msg.timestamp.isoformat(),
        'media_type': media_type,
        'media_url': media_url,
    }, to=room, broadcast=True, include_self=False)

# New API endpoint: Suggest emojis based on message text
@app.route('/api/emoji_suggest', methods=['POST'])
def emoji_suggest():
    data = request.json
    text = data.get('text', '')
    if not text.strip():
        return jsonify({'emojis': []})

    # Use sentiment analysis to detect emotion and map to emojis
    results = emoji_suggester(text)
    # Example: results like [{'label': 'POSITIVE', 'score': 0.99}]
    label = results[0]['label'].upper()

    # Basic mapping of sentiment label to emojis (expand as needed)
    emoji_map = {
        'POSITIVE': ['😊', '😄', '👍'],
        'NEGATIVE': ['😞', '😠', '😢'],
        'NEUTRAL': ['😐', '😶'],
    }

    emojis = emoji_map.get(label, ['🙂'])
    return jsonify({'emojis': emojis})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5050))
    socketio.run(app, host='0.0.0.0', port=port)
