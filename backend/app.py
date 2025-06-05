import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from models import db  # Import unbound db
from auth import auth_bp  # Blueprint
from werkzeug.utils import secure_filename

app = Flask(__name__)

# 🔐 Configuration
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')

# ✅ Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ✅ Setup CORS globally to handle all routes + preflight requests properly
CORS(app, resources={r"/auth/*": {"origins": "https://baatkarona.vercel.app"}}, supports_credentials=True)

# ✅ Setup SocketIO
socketio = SocketIO(app, cors_allowed_origins="https://baatkarona.vercel.app")

# ✅ Initialize DB
db.init_app(app)

# ✅ Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

# ✅ Create tables inside app context
with app.app_context():
    db.create_all()

# ✅ Root endpoint
@app.route('/')
def index():
    return "Chat App Backend Running"

# ✅ Run server
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
