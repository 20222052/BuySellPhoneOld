import requests
import json
import time
import sys

BASE_URL = "http://localhost:5000"

def test_embed():
    print("Testing /api/embed...")
    try:
        payload = {"text": "Xin chào"}
        response = requests.post(f"{BASE_URL}/api/embed", json=payload)
        if response.status_code == 200:
            data = response.json()
            if 'embedding' in data and isinstance(data['embedding'], list):
                print("PASS: /api/embed returned a vector.")
            else:
                print(f"FAIL: /api/embed response format incorrect: {data.keys()}")
        else:
            print(f"FAIL: /api/embed status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

def test_chat():
    print("Testing /api/chat...")
    try:
        payload = {"messages": [{"role": "user", "content": "Xin chào, bạn là ai?"}]}
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        if response.status_code == 200:
            data = response.json()
            # Expecting 'response' key based on test_api.py, but user said verify "câu trả lời tiếng Việt mạch lạc"
            # We will print the response to verify manually as well.
            print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            if 'response' in data:
                 print("PASS: /api/chat returned a response.")
            else:
                 print("FAIL: /api/chat response missing 'response' key.")
        else:
            print(f"FAIL: /api/chat status code {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    print(f"Waiting for server at {BASE_URL}...")
    max_retries = 30
    for i in range(max_retries):
        try:
            resp = requests.get(BASE_URL)
            # 404 is fine (means server is up but root not found)
            # or check /api/embed which checks method
            print("Server is up!")
            break
        except requests.exceptions.ConnectionError:
            print(f"Server not ready, retrying ({i+1}/{max_retries})...")
            time.sleep(10)
    else:
        print("Server failed to start in time.")
        sys.exit(1)

    print("Starting tests...")
    test_embed()
    test_chat()
