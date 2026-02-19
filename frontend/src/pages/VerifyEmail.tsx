import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "../services/authApi";
import "./VerifyEmail.css";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !token ? "error" : "loading"
  );
  const [message, setMessage] = useState(
    !token ? "No verification token in the link." : ""
  );

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        <h2>Verify your email</h2>
        {status === "loading" && <p className="verify-message">Verifying...</p>}
        {status === "success" && (
          <>
            <p className="verify-message success">{message}</p>
            <Link to="/" className="btn btn-primary">
              Go to login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="verify-message error">{message}</p>
            <Link to="/" className="btn btn-primary">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
