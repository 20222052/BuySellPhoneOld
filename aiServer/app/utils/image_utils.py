import base64
import io
from PIL import Image

def decode_image(image_data):
    """
    Decode base64 image data to PIL Image
    Args:
        image_data (str): Base64 string (with or without prefix)
    Returns:
        PIL.Image: Converted image
    """
    try:
        # Clean base64 string
        if ',' in image_data:
            image_data = image_data.split(',')[1]
            
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        return image
    except Exception as e:
        print(f"[ERROR] Failed to decode image: {e}")
        return None
