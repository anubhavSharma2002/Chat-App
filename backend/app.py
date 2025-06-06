import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import cloudinary
import cloudinary.uploader
import uuid
import time

from models import db, Message
from auth import auth_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

# ✅ PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://chat_app_db_4lkr_user:QAmEWmOHpGElG2C0fZiVU67ZNeu1ZMhc@dpg-d11575ali9vc738dfifg-a/chat_app_db_4lkr'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Cloudinary configuration
cloudinary.config(
    cloud_name='dwxi8oubd',
    api_key='737445128586493',
    api_secret='iyUN0_tytlInZ0oE5z1dxSRLwlc',
    secure=True
)

# ✅ Enable CORS for frontend
CORS(app, supports_credentials=True)

# ✅ Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=["https://baatkarona.vercel.app"])

# ✅ Initialize SQLAlchemy
db.init_app(app)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ Image Upload Route
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            unique_id = str(uuid.uuid4())  # Unique public ID for each file
            upload_result = cloudinary.uploader.upload(
                file,
                public_id=unique_id,
                resource_type="image"
            )
            secure_url = upload_result['secure_url']
            return jsonify({'url': secure_url}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

def get_room_name(user1, user2):
    return '_'.join(sorted([user1, user2]))

@socketio.on('join')
def on_join(data):
    room = get_room_name(data['sender'], data['receiver'])
    join_room(room)

@socketio.on('send_message')
def handle_message(data):
    sender = data['sender']
    receiver = data['receiver']
    message = data.get('message', '')
    image_url = data.get('image_url', '')
    room = get_room_name(sender, receiver)

    new_msg = Message(sender=sender, receiver=receiver, message=message, image_url=image_url)
    db.session.add(new_msg)
    db.session.commit()

    emit('receive_message', {
        'sender': sender,
        'message': message,
        'image_url': image_url,
        'timestamp': new_msg.timestamp.isoformat()
    }, to=room, broadcast=True, include_self=False)

@app.route('/messages/<sender>/<receiver>', methods=['GET'])
def get_messages(sender, receiver):
    messages = Message.query.filter(
        ((Message.sender == sender) & (Message.receiver == receiver)) |
        ((Message.sender == receiver) & (Message.receiver == sender))
    ).order_by(Message.timestamp).all()

    return jsonify([
        {
            "sender": msg.sender,
            "receiver": msg.receiver,
            "message": msg.message,
            "image_url": msg.image_url,
            "timestamp": msg.timestamp.isoformat()
        } for msg in messages
    ])

# ✅ Auth Blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')

# ❌ DO NOT enable this in production
@app.route('/reset-db')
def reset_db():
    db.drop_all()
    db.create_all()
    return "Database reset successfully"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))
