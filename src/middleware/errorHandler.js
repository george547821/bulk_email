const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({
      error: "Failed to connect to SMTP server. Verify host and port.",
    });
  }

  if (err.code === "EAUTH") {
    return res.status(500).json({
      error: "Invalid authentication credentials.",
    });
  }

  if (err.message === "SMTP not configured") {
    return res.status(500).json({
      error: "SMTP not configured. Use /api/configure-smtp first.",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
};

module.exports = errorHandler;
