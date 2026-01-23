from flask import Flask
from flask_cors import CORS
from app.services.ai_service import ai_service
from app.controllers.diagnostic_controller import diagnostic_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Register Blueprints
    app.register_blueprint(diagnostic_bp)
    
    # Initialize AI Model (Lazy load or eager load)
    # We'll do it here to ensure it's ready
    with app.app_context():
        try:
            ai_service.initialize()
        except Exception as e:
            print(f"[WARN] AI Model initialization postponed or failed: {e}")
    
    return app
