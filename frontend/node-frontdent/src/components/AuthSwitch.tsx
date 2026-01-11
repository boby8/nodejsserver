interface AuthSwitchProps {
  isSignup: boolean;
  onToggle: () => void;
}

export const AuthSwitch = ({ isSignup, onToggle }: AuthSwitchProps) => {
  return (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      {isSignup ? (
        <>
          Already have an account?{" "}
          <button
            onClick={onToggle}
            className="btn btn-secondary"
            style={{ marginLeft: "0.5rem" }}
          >
            Login
          </button>
        </>
      ) : (
        <>
          Don't have an account?{" "}
          <button
            onClick={onToggle}
            className="btn btn-secondary"
            style={{ marginLeft: "0.5rem" }}
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
};
