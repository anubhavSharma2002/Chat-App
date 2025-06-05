from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
import os

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Replace with a strong key in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for your frontend domain (update with your Vercel domain if changed)
CORS(app, origins=["https://baatkarona.vercel.app"], supports_credentials=True)

# Initialize DB and SocketIO
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Import and register blueprints
from auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/auth')

# Create DB tables at app startup
with app.app_context():
    db.create_all()

# Run the app on the correct host and port for Render.com
if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
