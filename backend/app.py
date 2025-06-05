from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from models import db, Message  # Assuming Message model has image_url and timestamp
from auth import auth_bp
import eventlet

eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['UPLOAD_FOLDER'] = 'uploads'

# Enable CORS for your frontend domain with credentials support
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["https://baatkarona.vercel.app"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
        "supports_credentials": True
    }
})

socketio = SocketIO(app, cors_allowed_origins=["https://baatkarona.vercel.app"])

db.init_app(app)

# Ensure uploads directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # To avoid overwriting, you may want to add a unique prefix here, e.g. timestamp
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'url': f'/uploads/{filename}'}), 200

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

@app.route('/reset-db')
def reset_db():
    db.drop_all()
    db.create_all()
    return "Database reset successfully"

# Register the auth blueprint at /auth
app.register_blueprint(auth_bp, url_prefix='/auth')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
