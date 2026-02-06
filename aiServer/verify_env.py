from app.config import Config
import os

print(f"CWD: {os.getcwd()}")
print(f"Token from Config: '{Config.AI_SERVER_ACCESS_TOKEN}'")
if Config.AI_SERVER_ACCESS_TOKEN:
    print("SUCCESS: Token loaded.")
else:
    print("FAILURE: Token is None or Empty.")
