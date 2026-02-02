import torch
import sys
try:
    print(f"Torch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    
    import bitsandbytes as bnb
    print(f"BitsAndBytes version: {bnb.__version__}")
    
    # Check if we can load 4-bit on CPU
    if not torch.cuda.is_available():
        print("WARNING: CUDA not available. BitsAndBytes 4-bit typically requires CUDA.")
    
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
