from llama_cpp import Llama
from huggingface_hub import hf_hub_download
from app.models.chat_models import ChatRequest, ChatResponse
import os

class ChatService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChatService, cls).__new__(cls)
            cls._instance.initialized = False
            cls._instance.model = None
        return cls._instance

    def initialize(self):
        if self.initialized:
            return

        print("=" * 70)
        print("INITIALIZING CHAT SERVICE (Qwen2.5-1.5B GGUF)")
        print("=" * 70)

        try:
            repo_id = "Qwen/Qwen2.5-1.5B-Instruct-GGUF"
            filename = "qwen2.5-1.5b-instruct-q4_k_m.gguf"
            
            print(f"[INFO] Downloading/Loading GGUF model: {filename}...")
            model_path = hf_hub_download(repo_id=repo_id, filename=filename)
            print(f"[INFO] Model path: {model_path}")

            # Initialize Llama model
            # n_ctx=4096 (context window), n_gpu_layers=0 (CPU only), verbose=False (less logs)
            self.model = Llama(
                model_path=model_path,
                n_ctx=4096,
                n_gpu_layers=-1, 
                verbose=True
            )
            
            self.initialized = True
            print("[SUCCESS] Chat model (GGUF) loaded!")
            print("=" * 70)
        except Exception as e:
            print(f"[ERROR] Failed to load chat model: {e}")
            print("[WARN] Chat functionality will be unavailable.")

    def generate_response(self, request: ChatRequest) -> ChatResponse:
        if not self.initialized:
            print("[INFO] Lazy loading Chat Model on first request...")
            self.initialize()
            if not self.initialized:
                raise Exception("Chat Model failed to initialize.")
        
        try:
            # Construct messages for Qwen
            messages = request.messages
            
            output = self.model.create_chat_completion(
                messages=messages,
                max_tokens=512,
                temperature=0.7,
                stream=False
            )
            
            response_text = output['choices'][0]['message']['content']
            
            return ChatResponse(response=response_text)
        except Exception as e:
            print(f"[ERROR] Chat generation failed: {e}")
            raise e

chat_service = ChatService()
