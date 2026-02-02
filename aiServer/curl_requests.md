# AI Server - Postman/CURL Commands

Copy the following commands and import them into Postman (Import -> Raw Text) or run them in your terminal.

## 1. Test Embedding API
**Endpoint:** `POST /api/embed`  
**Description:** Converts text into a vector embedding.

```bash
curl --location 'http://localhost:5000/api/embed' \
--header 'Content-Type: application/json' \
--data '{
    "text": "Xin chào, kiểm tra embedding"
}'
```

## 2. Test Chat API
**Endpoint:** `POST /api/chat`  
**Description:** Sends a message history to the Qwen model and gets a response.

```bash
curl --location 'http://localhost:5000/api/chat' \
--header 'Content-Type: application/json' \
--data '{
    "messages": [
        {
            "role": "system",
            "content": "Bạn là trợ lý AI hữu ích."
        },
        {
            "role": "user",
            "content": "Xin chào, bạn là ai?"
        }
    ]
}'
```

> **Note:** The Chat API request might time out initially if the server is still downloading the 5GB model.
