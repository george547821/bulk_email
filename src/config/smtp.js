const nodemailer = require("nodemailer");

function createTransporter(config) {
  const { host, port, userName, password, secure } = config;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: userName, pass: password },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true,
    debug: true,
    maxConnections: 10,
    maxMessages: 100,
  });
}

module.exports = { createTransporter };
