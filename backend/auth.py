from flask import Blueprint, request, jsonify
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask import make_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['OPTIONS'])
def register_options():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "https://baatkarona.vercel.app")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "User already exists"}), 400

    password_hash = generate_password_hash(password)
    new_user = User(email=email, password_hash=password_hash)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": True, "message": "Registered successfully"})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({"success": True, "user_id": user.email})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user:
        # Placeholder: add real reset logic
        return jsonify({"success": True, "message": "Password reset not implemented"})
    return jsonify({"success": False, "message": "User not found"}), 404

@auth_bp.route('/check-user', methods=['POST'])
def check_user():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    return jsonify({"exists": bool(user)})
