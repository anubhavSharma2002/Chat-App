import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from werkzeug.utils import secure_filename
from models import db
from auth import auth_bp  # Blueprint for auth routes

app = Flask(__name__)

# Configurations
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')

# Create the uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Enable CORS for frontend domain with credentials
CORS(app, supports_credentials=True, origins=["https://baatkarona.vercel.app"])

# Enable SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize SQLAlchemy
db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

# Health check route
@app.route('/')
def index():
    return "✅ Chat App Backend Running"

# Create tables inside app context
with app.app_context():
    db.create_all()

# Main execution for local/dev
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render uses $PORT env var
    socketio.run(app, host='0.0.0.0', port=port)
