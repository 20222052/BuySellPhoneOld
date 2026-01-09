import AppRouter from "./routes/AppRouter";
import "./App.css";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AppRouter />
      {/* Nút cuộn lên và nút chat */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {showScrollBtn && (
          <button
            onClick={handleScrollTop}
            style={{
              background: "linear-gradient(135deg, #e45464, #d70018)",
              color: "#fff",
              border: "none",
              borderRadius: 50,
              width: 48,
              height: 48,
              boxShadow: "0 4px 16px rgba(215,0,24,0.15)",
              cursor: "pointer",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.3s",
            }}
            title="Cuộn lên đầu trang"
          >
            <i className="bi bi-arrow-up" />
          </button>
        )}
        <button
          onClick={() => setShowChatBox((v) => !v)}
          style={{
            background: "#fff",
            color: "#d70018",
            border: "2px solid #e45464",
            borderRadius: 50,
            width: 48,
            height: 48,
            boxShadow: "0 4px 16px rgba(215,0,24,0.10)",
            cursor: "pointer",
            fontSize: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.3s",
          }}
          title="Chat chăm sóc khách hàng"
        >
          <i className="bi bi-chat-dots" />
        </button>
      </div>
      {/* Box chat popup */}
      {showChatBox && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 32,
            zIndex: 9999,
            width: 320,
            maxWidth: "90vw",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(215,0,24,0.15)",
            border: "2px solid #e45464",
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "#d70018",
              }}
            >
              Chăm sóc khách hàng
            </span>
            <button
              onClick={() => setShowChatBox(false)}
              style={{
                background: "none",
                border: "none",
                color: "#d70018",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#333",
              marginBottom: 12,
            }}
          >
            Xin chào! Bạn cần hỗ trợ gì? Hãy gửi tin nhắn cho chúng tôi.
          </div>
          <textarea
            style={{
              width: "100%",
              borderRadius: 8,
              border: "1px solid #e45464",
              padding: 8,
              minHeight: 60,
              marginBottom: 8,
            }}
            placeholder="Nhập nội dung..."
          />
          <button
            style={{
              background: "linear-gradient(135deg, #e45464, #d70018)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Gửi
          </button>
        </div>
      )}
    </>
  );
}

export default App;
