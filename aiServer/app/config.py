import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Server Configuration
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

    # AI Model Configuration
    BLIP_MODEL_ID = os.getenv('BLIP_MODEL_ID', 'Salesforce/blip-image-captioning-base')
    EMBEDDING_MODEL_ID = os.getenv('EMBEDDING_MODEL_ID', 'bkai-foundation-models/vietnamese-bi-encoder')
    
    # Security
    AI_SERVER_ACCESS_TOKEN = os.getenv('AI_SERVER_ACCESS_TOKEN')
