import { NavLink } from "react-router-dom";

export const Nav = () => {
  return (
    <nav className="app-nav">
      <NavLink
        to="/cards"
        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        end
      >
        Cards
      </NavLink>
    </nav>
  );
};
