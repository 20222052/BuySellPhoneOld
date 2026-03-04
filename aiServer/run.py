from app import create_app
from app.config import Config

app = create_app()

if __name__ == '__main__':
    print("\n[INFO] Đang khởi chạy AI Server (Phiên bản MVC)...")
    print(f"[INFO] Máy chủ đang chạy tại http://{Config.HOST}:{Config.PORT}")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
