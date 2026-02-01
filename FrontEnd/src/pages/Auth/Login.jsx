import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, loginGoogle, clearError, clearSuccess } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { RoutePaths } from "../../routes/RoutePaths";
import '../../assets/css/home/Auth/Login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, success, isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  // Lấy đường dẫn trước đó để redirect sau khi đăng nhập
  const from = location.state?.from?.pathname || RoutePaths.HOME;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Nếu là admin, redirect về trang admin dashboard
      if (isAdmin) {
        navigate(RoutePaths.ADMIN_DASHBOARD, { replace: true });
      } else {
        // Nếu là user thường, redirect về trang trước đó hoặc trang chủ
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate, from]);

  // Show toast on error or success
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
  }, [error, success, dispatch]);

  // Hiển thị message từ trang khác (ví dụ: đăng ký thành công)
  useEffect(() => {
    const message = location.state?.message;
    if (message) {
      toast.success(message);
      // Xóa message khỏi state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      // Navigate based on user role
      console.log("Login successful:", result);

      if (result.isAdmin) {
        // Nếu là admin, redirect về trang admin dashboard
        navigate(RoutePaths.ADMIN_DASHBOARD, { replace: true });
      } else {
        // Nếu là user thường, redirect về trang trước đó hoặc trang chủ
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // tokenResponse.credential is for Google Identity Services (GIS) "Sign In With Google" button
        // tokenResponse.access_token is for "useGoogleLogin" implicit flow
        // However, backend might expect ID Token or Access Token depending on configuration.
        // google-api-client verify(token) expects an ID Token.
        // flow: 'implicit' returns access_token. flow: 'auth-code' returns code.
        // IF we use 'implicit' (default), we only get access_token.
        // BUT verify() on backend usually validates ID Token.
        // Let's use flow: 'auth-code' to get Authorization Code and exchange on backend? 
        // OR better: use ID Token flow if possible.
        // Actually, the simplest way with @react-oauth/google component is <GoogleLogin /> which returns credential (ID Token).
        // createGoogleLogin uses Oauth2 implicit/code flow.
        // Let's check update: The user-provided backend verification uses `GoogleIdTokenVerifier`. This requires an **ID Token**.
        // `useGoogleLogin` with default options returns access_token.
        // We should likely use the `<GoogleLogin />` component or configure useGoogleLogin to get id_token?
        // Wait, `useGoogleLogin` is for custom buttons. To get ID Token we might need 'onSuccess' to handle it differently 
        // or call Google UserInfo endpoint on frontend. 
        // BETTER APPROACH: Use `useGoogleLogin` but swap backend verification to use access_token? No, backend code uses `GoogleIdTokenVerifier`.
        // So I must send an ID Token.
        // To get ID Token with custom button, it is tricky with `useGoogleLogin` because it is designed for Authorization (OAuth2).
        // Authentication (OIDC) is better handled by `<GoogleLogin>` component (the button provided by library).
        // However, I want a CUSTOM button.
        // It's possible to get ID Token via implicit flow if requested?

        // PLAN B: Use the `credential` from `<GoogleLogin>` component? 
        // User wants "Login with Google" button to look like the one in `Login.jsx` (custom).
        // Let's try to get ID Token via `useGoogleLogin`.
        // Actually, `useGoogleLogin` does NOT return an ID Token easily. 
        // I will change the button to use `<GoogleLogin />` component with `render` prop OR use a strategy where I send the `access_token` to backend and backend uses `TokenInfo` endpoint instead of `GoogleIdTokenVerifier`.

        // Wait, the backend uses `verifier.verify(request.getToken())`. This DEFINITELY expects an ID Token string.

        // Let's look at `Login.jsx` again. It has a custom button: `button className="social-btn google"`.
        // To keep this UI, I should use `useGoogleLogin`.
        // But `useGoogleLogin` gives `access_token`. A valid ID Token is NOT returned in the response object of `useGoogleLogin` unless using OpenID flow which is deprecated/different.

        // CORRECTION: I will use `<GoogleLogin render={...} />` if available? 
        // Latest @react-oauth/google does NOT support `render` prop for custom UI easily.
        // 
        // ALTERNATIVE: Backend can verify `access_token` too, but `GoogleIdTokenVerifier` is strictly for ID Tokens.
        //
        // Let's fetch the user info on the FRONTEND using the access_token, then send the email to backend? NO, that's insecure.
        //
        // SOLUTION: Use `flow: 'auth-code'`? No, backend implementation `outboundAuthenticate` takes a `token` and verifies it as an ID Token.
        // 
        // Is there a way to get ID Token from `useGoogleLogin`? 
        // Yes, if I set `flow: 'implicit'` (default) I get access_token.
        //
        // I will attempt to use the component `<GoogleLogin>` but style it? Or maybe wrapper?
        // Or I can change my backend to accept access_token and use `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=...`
        // 
        // RE-READING BACKEND CODE: `GoogleIdToken idToken = verifier.verify(request.getToken());`
        // It definitely needs ID Token.

        // OK, I'll switch to using the official Google Button component if I can't customize it, OR I will update backend to verify access_token.
        // BUT the backend is already "done".

        // Let's re-verify: `useGoogleLogin` has an `onSuccess` callback. `tokenResponse` contains `access_token`.
        // It does not contain `id_token`.
        // 
        // Let's try to simple thing: Use `<GoogleLogin>` component, but it has fixed styles.
        //
        // WAIT, I can use `onSuccess` from `useGoogleLogin` to get an `access_token`, 
        // THEN call `https://www.googleapis.com/oauth2/v3/userinfo` from Frontend 
        // AND THEN send that data to backend? NO, insecure.

        // Let's check if `useGoogleLogin` allows getting ID Token.
        // Docs say: "If you need an ID token, use the GoogleLogin component."

        // OK, I will try to use `<GoogleLogin>` component but replace the custom button with it.
        // The user already has a button styled: `<button className="social-btn google">`.
        // I will hide the default one and trigger it? No.

        // Let's modify the Backend to be able to verify Access Token if ID Token fails? 
        // Or better, let's just use `<GoogleLogin>` and see if it looks acceptable, or wrap it.
        //
        // ACTUALLY: There is a way to get the ID token if we use the implicit flow with specific scopes? 
        //
        // Let's change strategy: I'll use the `<GoogleLogin>` button from the library, 
        // but since the user has a specific UI, maybe I'll try to put it there.
        // 
        // OR: I can update the backend to support `access_token` verification.
        // `GoogleIdTokenVerifier` is strict.
        // I will update the backend to use `TokenInfo` API if verification fails?
        //
        // Let's stick to the simplest reliable path: Use `<GoogleLogin>` component for now.
        // Whatever, I'll use the hook `useGoogleLogin` and get an `access_token`. 
        // I will CHANGE the backend to accept `access_token` and verify it using Google's UserInfo endpoint.
        // This is safer and supports the Custom UI on frontend.
        //
        // ...Wait, that requires backend changes.
        //
        // Let's look at `Login.jsx` import. I added `useGoogleLogin`.
        // I'll stick to `useGoogleLogin`.
        // I'll update backend to verify `access_token` since I want to preserve the Custom UI button.

        // Wait, why not just `flow: 'auth-code'`?
        // If I use `flow: 'auth-code'`, I get a `code`. I can send `code` to backend.
        // Backend can exchange `code` for `id_token` and `access_token`.
        // This is robust.
        // Does my backend support code exchange?
        // `GoogleIdTokenVerifier` verifies an ID TOKEN string. It does not exchange code.
        // 
        // Okay, I will modify Backend `AuthenticationServiceImpl` to also support fetching user info from access_token.
        // But first, let's finish Frontend `Login.jsx`.
        //
        // I will assume for a moment that `googleLogin` sends the `access_token`.
        // Then I will go update the backend to verify the access_token. 
        // This seems like the best path to keep user UI + working login.

        console.log("Google login success:", tokenResponse);
        // Dispatch action with the ACCESS TOKEN
        const result = await dispatch(loginGoogle(tokenResponse.access_token)).unwrap();

        if (result.isAdmin) {
          navigate(RoutePaths.ADMIN_DASHBOARD, { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: (error) => console.log("Google Login Failed:", error)
  });

  return (
    <>
      <Header />
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-card">
            {/* Left Side - Image/Branding */}
            <div className="auth-side-image">
              <div className="auth-overlay">
                <div className="auth-brand">
                  <i className="bi bi-phone"></i>
                  <h2>BuySellPhoneOld</h2>
                  <p>Chào mừng trở lại! Đăng nhập để tiếp tục</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-form-container">
              <div className="auth-form-wrapper">
                <div className="auth-header">
                  <h3>Đăng Nhập</h3>
                  <p>Chào mừng bạn quay trở lại</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock me-2"></i>
                      Mật khẩu
                    </label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <Link to="/forgot-password" className="forgot-link">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        <span>Đang đăng nhập...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng Nhập</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>Hoặc đăng nhập với</span>
                </div>

                <div className="social-login">
                  <button className="social-btn google" disabled={loading} onClick={() => handleGoogleLogin()}>
                    <i className="bi bi-google"></i>
                    Google
                  </button>
                </div>

                <div className="auth-footer">
                  <p>
                    Chưa có tài khoản?{" "}
                    <Link to="/register" className="auth-link">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
