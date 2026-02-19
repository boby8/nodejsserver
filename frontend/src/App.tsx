import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { AuthSwitch } from "./components/AuthSwitch";
import { Nav } from "./components/Nav";
import { CardsPage } from "./pages/CardsPage";
import { VerifyEmail } from "./pages/VerifyEmail";
import "./App.css";

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const location = useLocation();

  // Email verification link (no login required)
  if (location.pathname === "/verify-email") {
    return (
      <div className="app">
        <VerifyEmail />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        {showSignup ? <Signup /> : <Login />}
        <AuthSwitch
          isSignup={showSignup}
          onToggle={() => setShowSignup(!showSignup)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/cards" replace />} />
        <Route
          path="/cards"
          element={<CardsPage userEmail={user.email} onLogout={logout} />}
        />
      </Routes>
    </div>
  );
}

export default App;
