from flask import Blueprint, request, jsonify
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data['email']
    password = data['password']
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "User already exists"}), 400
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": True, "message": "Registered successfully"})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if user:
        return jsonify({"success": True, "user_id": user.email})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user:
        return jsonify({"success": True, "message": "Password reset logic not implemented"})
    return jsonify({"success": False, "message": "User not found"}), 404

@auth_bp.route('/check-user', methods=['POST'])
def check_user():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    return jsonify({"exists": bool(user)})
