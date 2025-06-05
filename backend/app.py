from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
from models import db, Message
from auth import auth_bp
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'pdf', 'docx'}

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, supports_credentials=True)
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")
app.register_blueprint(auth_bp, url_prefix='/auth')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_room_name(user1, user2):
    return "_".join(sorted([user1, user2]))

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    sender = request.form.get('sender')
    receiver = request.form.get('receiver')

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file_url = f'/static/uploads/{filename}'

        new_msg = Message(sender=sender, receiver=receiver, message=file_url)
        db.session.add(new_msg)
        db.session.commit()

        room = get_room_name(sender, receiver)
        socketio.emit('receive_message', {
            'sender': sender,
            'message': file_url,
            'timestamp': new_msg.timestamp.isoformat()
        }, to=room, broadcast=True, include_self=False)

        return jsonify({"success": True, "url": file_url})
    return jsonify({"success": False, "error": "Invalid file"}), 400

@app.route('/static/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Keep existing socketio events (join, send_message) as-is
# ...
