from flask import Blueprint
from app.controllers.embedding_controller import embed
from app.middlewares.auth import require_api_token

embedding_bp = Blueprint('embedding', __name__)

# Protected routes
embedding_bp.add_url_rule('/api/embed', view_func=require_api_token(embed), methods=['POST'])
