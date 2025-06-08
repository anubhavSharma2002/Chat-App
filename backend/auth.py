from flask import Blueprint, request, jsonify, make_response
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

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
    try:
        data = request.get_json()
        email = data.get('phone')  # phone number as 'email'
        password = data.get('password')
        name = data.get('name')

        if not email or not password:
            return jsonify({"success": False, "message": "Phone number and password required"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"success": False, "message": "User already exists"}), 400

        password_hash = generate_password_hash(str(password))
        new_user = User(email=email, password_hash=password_hash, name=name)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"success": True, "message": "Registered successfully"})

    except Exception as e:
        return jsonify({"success": False, "message": "Internal server error"}), 500

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
        return jsonify({"success": True, "message": "Password reset not implemented"})
    return jsonify({"success": False, "message": "User not found"}), 404

@auth_bp.route('/check-user', methods=['POST'])
def check_user():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    return jsonify({"exists": bool(user)})

@auth_bp.route('/valid-users', methods=['POST'])
def get_valid_users():
    data = request.get_json()
    emails = data.get('emails', [])
    valid_users = User.query.filter(User.email.in_(emails)).all()
    return jsonify([
        {"email": user.email, "name": user.name}
        for user in valid_users
    ])

@auth_bp.route('/remove-recent-chat', methods=['POST'])
def remove_recent_chat():
    data = request.get_json()
    user_email = data.get('user_email')
    target_email = data.get('target_email')

    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.recent_chats and target_email in user.recent_chats:
        user.recent_chats.remove(target_email)
        db.session.commit()

    return jsonify({"success": True})
