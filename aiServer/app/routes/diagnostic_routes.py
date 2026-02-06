from flask import Blueprint
from app.controllers.diagnostic_controller import health_check, diagnose_phone, convert_to_base64
from app.middlewares.auth import require_api_token

diagnostic_bp = Blueprint('diagnostic', __name__)

# Public routes
diagnostic_bp.add_url_rule('/health', view_func=health_check, methods=['GET'])

# Protected routes (diagnostic)
diagnostic_bp.add_url_rule('/api/diagnose', view_func=require_api_token(diagnose_phone), methods=['POST'])

# Utility routes (public or protected? let's keep public for helper unless specified, but logically maybe protected? I'll keep it public as it was effectively before I added auth to everything, wait, I only added auth to diagnose and embed. helper was public. I'll keep it public or apply auth if needed. Request said "auth written... need update auth for check API too". diagnostic IS the check api. helper is different. I'll leave helper public for now or same as before. Before: public.)
diagnostic_bp.add_url_rule('/api/utils/to-base64', view_func=convert_to_base64, methods=['POST'])
