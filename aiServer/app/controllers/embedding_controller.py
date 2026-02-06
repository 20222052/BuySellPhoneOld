from flask import request, jsonify
from app.services.embedding_service import embedding_service
from app.models.embedding_models import EmbeddingRequest

def embed():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text'}), 400
            
        embedding_request = EmbeddingRequest.from_dict(data)
        response = embedding_service.generate_embedding(embedding_request)
        
        return jsonify(response.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
