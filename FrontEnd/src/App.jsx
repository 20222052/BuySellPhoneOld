import AppRouter from "./routes/AppRouter";
import "./App.css";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatWidget from "./components/Chat/ChatWidget";

function App() {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  // Manual chat state removed

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

      {/* Global Components */}
      <ChatWidget />

      {/* Nút cuộn lên */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 100, // Moved left to avoid overlapping chat button which is at right:32
          zIndex: 9999,
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
      </div>
    </>
  );
}

export default App;
