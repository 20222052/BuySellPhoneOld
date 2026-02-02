from flask import Flask
from flask_cors import CORS
from app.services.ai_service import ai_service
from app.controllers.diagnostic_controller import diagnostic_bp
from app.controllers.chat_controller import chat_bp
from app.controllers.embedding_controller import embedding_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Register Blueprints
    app.register_blueprint(diagnostic_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(embedding_bp)
    
    # Initialize AI Model (Lazy load or eager load)
    # We'll do it here to ensure it's ready
    with app.app_context():
        try:
            # ai_service.initialize()
            
            # Initialize new services
            # Note: These might fail if models are not downloaded or GPU OOM
            from app.services.chat_service import chat_service
            from app.services.embedding_service import embedding_service
            
            # We initialize them but wrapped in try-catch blocks inside their own init methods?
            # Actually the existing code has a try-catch for ai_service.
            # Let's add them here.
            embedding_service.initialize()
            # chat_service.initialize() # Lazy load on request
        except Exception as e:
            print(f"[WARN] AI Model initialization postponed or failed: {e}")
    
    return app
