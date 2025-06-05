import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from models import db
from auth import auth_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

CORS(app, origins=["https://baatkarona.vercel.app"], supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="https://baatkarona.vercel.app")

db.init_app(app)
app.register_blueprint(auth_bp, url_prefix='/auth')

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return "Chat App Backend Running"

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
