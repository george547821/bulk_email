const { createTransporter } = require("../config/smtp");

const checkSMTP = async (req, res) => {
  try {
    const { host, port, userName, password, secure } = req.body;

    if (!host || !port || !userName || !password) {
      return res.status(400).json({
        message: "Missing required SMTP configuration fields",
        details: "host, port, userName, and password are required",
      });
    }

    if (isNaN(port) || port < 1 || port > 65535) {
      return res.status(400).json({
        message: "Invalid port number",
        details: "Port must be a number between 1 and 65535",
      });
    }

    const transporter = createTransporter({
      host,
      port,
      userName,
      password,
      secure,
    });

    try {
      await transporter.verify();
    } catch (verifyError) {
      return res.status(401).json({
        message: "SMTP verification failed",
        error: verifyError.message,
        details: "Please check your SMTP credentials and server settings",
      });
    }

    res.json({
      message: "SMTP configured successfully",
      config: { host, port, secure, userName },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to configure SMTP",
      error: error.message,
      details: "An unexpected error occurred while configuring SMTP",
    });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { name, to, subject, body, attachments, server } = req.body;

    if (!body && !to && !server) {
      return res.status(400).json({
        message: "All the required fields are not sent",
        details: "Please make sure body, to and server",
      });
    }

    const transporter = createTransporter({
      host: server.host,
      port: server.port,
      userName: server.userName,
      password: server.password,
      secure: server.secure,
    });

    transporter.sendMail({
      from: name
        ? `${name} <${transporter.options.auth.user}>`
        : transporter.options.auth.user,
      to,
      subject,
      html: body,
      attachments,
    });

    return res.status(200).json({
      message: "Email sent successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error sending emails",
      error: error.message,
      details: "An unexpected error occurred while sending emails",
    });
  }
};

module.exports = {
  checkSMTP,
  sendEmail,
};
