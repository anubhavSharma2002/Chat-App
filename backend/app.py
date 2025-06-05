import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from models import db  # Unbound SQLAlchemy instance
from auth import auth_bp  # Authentication blueprint
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)

# App configuration
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Enable CORS for your frontend
CORS(app, supports_credentials=True, origins=["https://baatkarona.vercel.app"])

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# Bind SQLAlchemy to the app
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

# Create database tables inside app context
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return "✅ Chat App Backend is Running"

# Run app (Render uses PORT from environment)
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
