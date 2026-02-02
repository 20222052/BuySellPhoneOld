import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_embedding():
    print("\n[TEST] Testing Embedding API...")
    url = f"{BASE_URL}/api/embed"
    payload = {"text": "Điện thoại Samsung Galaxy S24 Ultra"}
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            embedding = data.get('embedding')
            model = data.get('model')
            print(f"[PASS] Embedding received. Model: {model}")
            print(f"       Embedding length: {len(embedding) if embedding else 0}")
        else:
            print(f"[FAIL] Status Code: {response.status_code}")
            print(f"       Response: {response.text}")
    except Exception as e:
        print(f"[ERROR] Could not connect to server: {e}")

def test_chat():
    print("\n[TEST] Testing Chat API...")
    url = f"{BASE_URL}/api/chat"
    payload = {
        "messages": [
            {"role": "system", "content": "Bạn là trợ lý AI hữu ích."},
            {"role": "user", "content": "Xin chào, bạn có thể giúp gì cho tôi?"}
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            answer = data.get('response')
            print(f"[PASS] Chat response received:")
            print(f"       AI: {answer}")
        else:
            print(f"[FAIL] Status Code: {response.status_code}")
            print(f"       Response: {response.text}")
    except Exception as e:
        print(f"[ERROR] Could not connect to server: {e}")

if __name__ == "__main__":
    print("Ensure the Flask server is running on port 5000 before executing this script.")
    test_embedding()
    test_chat()
