from functools import wraps
from flask import request, jsonify
from app.config import Config

def require_api_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip auth if no token is configured
        if not Config.AI_SERVER_ACCESS_TOKEN:
             return jsonify({'error': 'Server misconfiguration: No Access Token set'}), 500

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Missing Authorization Header'}), 401

        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
             return jsonify({'error': 'Invalid Authorization Header format. Expected: Bearer <token>'}), 401

        token = parts[1]
        
        if token != Config.AI_SERVER_ACCESS_TOKEN:
            return jsonify({'error': 'Invalid API Token'}), 401

        return f(*args, **kwargs)
    return decorated_function
