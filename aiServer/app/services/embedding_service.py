from sentence_transformers import SentenceTransformer
from app.models.embedding_models import EmbeddingRequest, EmbeddingResponse
import torch

class EmbeddingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance.initialized = False
            cls._instance.model = None
            cls._instance.device = None
        return cls._instance

    def initialize(self):
        if self.initialized:
            return

        print("=" * 70)
        print("INITIALIZING EMBEDDING SERVICE")
        print("=" * 70)

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[INFO] Using device: {self.device.upper()}")

        try:
            print("[INFO] Loading Vietnamese Bi-Encoder...")
            self.model = SentenceTransformer('bkai-foundation-models/vietnamese-bi-encoder', device=self.device)
            self.initialized = True
            print("[SUCCESS] Embedding model loaded!")
            print("=" * 70)
        except Exception as e:
            print(f"[ERROR] Failed to load embedding model: {e}")
            raise e

    def generate_embedding(self, request: EmbeddingRequest) -> EmbeddingResponse:
        if not self.initialized:
            raise Exception("Embedding Model not initialized. Call initialize() first.")
        
        try:
            embedding = self.model.encode(request.text)
            return EmbeddingResponse(embedding=embedding.tolist())
        except Exception as e:
            print(f"[ERROR] Embedding generation failed: {e}")
            raise e

embedding_service = EmbeddingService()
