from app import create_app

app = create_app()

if __name__ == '__main__':
    print("\n[INFO] Starting AI Server (MVC Version)...")
    print(f"[INFO] Server running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)
