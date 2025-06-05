from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from flask_cors import cross_origin

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@cross_origin(supports_credentials=True)
def register():
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Invalid input'}), 400

        # ❗ Run inside app context only
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({'message': 'User already exists'}), 400

        hashed_password = generate_password_hash(data['password'], method='sha256')
        new_user = User(username=data['username'], password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        print("🔥 Register Error:", str(e))
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/login', methods=['POST'])
@cross_origin(supports_credentials=True)
def login():
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Invalid input'}), 400

        user = User.query.filter_by(username=data['username']).first()
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401

        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

    except Exception as e:
        print("🔥 Login Error:", str(e))
        return jsonify({'error': 'Internal server error'}), 500
