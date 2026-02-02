from flask import Blueprint, request, jsonify
from app.services.chat_service import chat_service
from app.models.chat_models import ChatRequest

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        if not data or 'messages' not in data:
            return jsonify({'error': 'Missing messages'}), 400
            
        chat_request = ChatRequest.from_dict(data)
        response = chat_service.generate_response(chat_request)
        
        return jsonify(response.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
