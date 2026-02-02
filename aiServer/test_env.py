from huggingface_hub import hf_hub_download
from llama_cpp import Llama

try:
    print("Testing GGUF Model Loading...")
    repo_id = "Qwen/Qwen2.5-1.5B-Instruct-GGUF"
    filename = "qwen2.5-1.5b-instruct-q4_k_m.gguf"
    
    print(f"Downloading {filename} from {repo_id}...")
    model_path = hf_hub_download(repo_id=repo_id, filename=filename)
    print(f"Model path: {model_path}")
    
    print("Loading Llama model...")
    llm = Llama(model_path=model_path, n_ctx=2048, verbose=True)
    print("SUCCESS: Model loaded.")
    
    print("Testing generation...")
    output = llm.create_chat_completion(
        messages=[{"role": "user", "content": "Hello!"}],
        max_tokens=50
    )
    print("Response:", output['choices'][0]['message']['content'])
    
except Exception as e:
    print(f"FAIL: {e}")
