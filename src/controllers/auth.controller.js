import * as userService from "../services/user.service.js";

// SIGNUP
export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const user = await userService.createUser({ email, password });
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    if (err.message === "User already exists") {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await userService.loginUser({ email, password });
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
};

