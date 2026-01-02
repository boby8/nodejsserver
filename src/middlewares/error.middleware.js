export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: err.message || "Something went wrong",
  });
};

