from transformers import BlipProcessor, BlipForConditionalGeneration
import torch

class AIService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            cls._instance.initialized = False
            cls._instance.processor = None
            cls._instance.model = None
            cls._instance.device = None
        return cls._instance

    def initialize(self):
        """Initialize the AI model if not already initialized"""
        if self.initialized:
            return
        
        print("=" * 70)
        print("INITIALIZING AI SERVICE")
        print("=" * 70)
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[INFO] Using device: {self.device.upper()}")
        
        try:
            print("[INFO] Loading BLIP model...")
            self.processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
            self.model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
            self.model.to(self.device)
            
            self.initialized = True
            print("[SUCCESS] Model loaded and ready!")
            print("=" * 70)
        except Exception as e:
            print(f"[ERROR] Failed to load model: {e}")
            raise e

    def analyze_image(self, image, prompt=None):
        """
        Analyze an image using the loaded model
        Args:
            image (PIL.Image): The image to analyze
            prompt (str, optional): The prompt to guide generation
        Returns:
            str: Generated caption
        """
        if not self.initialized:
            raise Exception("AI Model not initialized. Call initialize() first.")
        
        try:
            if prompt:
                inputs = self.processor(image, text=prompt, return_tensors="pt").to(self.device)
            else:
                inputs = self.processor(image, return_tensors="pt").to(self.device)
                
            output = self.model.generate(**inputs, max_new_tokens=50)
            caption = self.processor.decode(output[0], skip_special_tokens=True)
            return caption
        except Exception as e:
            print(f"[ERROR] Analysis failed: {e}")
            return ""

    def get_status(self):
        return {
            'initialized': self.initialized,
            'device': self.device,
            'model_loaded': self.model is not None
        }

# Global instance
ai_service = AIService()
