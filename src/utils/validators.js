const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmails = (emails) => {
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    throw new Error("Invalid email list");
  }

  if (!emails.every((email) => emailRegex.test(email))) {
    throw new Error("Invalid email address format in recipients list");
  }

  return true;
};

const validateSMTPConfig = ({ host, port, userName, password, secure }) => {
  if (!host || !port || typeof port !== "number" || port <= 0 || port > 65535) {
    throw new Error("Invalid host or port configuration");
  }

  if (!userName || !emailRegex.test(userName)) {
    throw new Error("Invalid username format");
  }

  if (!password || typeof secure !== "boolean") {
    throw new Error("Invalid password or secure configuration");
  }

  return true;
};

module.exports = {
  validateEmails,
  validateSMTPConfig,
};
