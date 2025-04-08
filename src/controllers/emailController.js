const { createTransporter } = require("../config/smtp");
const { validateEmails } = require("../utils/validators");

// Function to process attachments
const processAttachments = (attachments) => {
  if (!attachments || !Array.isArray(attachments)) {
    return [];
  }

  return attachments.map((attachment) => {
    if (attachment.content instanceof Uint8Array) {
      return {
        ...attachment,
        content: Buffer.from(attachment.content),
      };
    }
    return attachment;
  });
};

const configureSMTP = async (req, res) => {
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

    req.app.locals.emailTransporter = transporter;

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

const sendBulkEmails = async (req, res) => {
  try {
    const {
      name,
      emails,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
      metaData,
    } = req.body;
    const transporter = req.app.locals.emailTransporter;

    // Check if SMTP is configured
    if (!transporter) {
      return res.status(400).json({
        message: "SMTP not configured",
        details: "Please configure SMTP settings before sending emails",
      });
    }

    // Validate required fields
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        message: "Invalid emails array",
        details: "Please provide a non-empty array of email addresses",
      });
    }

    if (!subject) {
      return res.status(400).json({
        message: "Subject is required",
        details: "Please provide an email subject",
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        message: "Email content is required",
        details: "Please provide either text or HTML content",
      });
    }

    try {
      validateEmails(emails);
      if (cc) validateEmails(Array.isArray(cc) ? cc : [cc]);
      if (bcc) validateEmails(Array.isArray(bcc) ? bcc : [bcc]);
    } catch (validationError) {
      return res.status(400).json({
        message: "Email validation failed",
        error: validationError.message,
        details: "Please check the email addresses provided",
      });
    }

    const processedAttachments = processAttachments(attachments);

    const results = await Promise.allSettled(
      emails.map((email) => {
        const mailOptions = {
          from: name
            ? `${name} <${transporter.options.auth.user}>`
            : transporter.options.auth.user,
          to: email,
          cc,
          bcc,
          subject,
          text,
          html,
          attachments: processedAttachments,
        };
        return transporter
          .sendMail(mailOptions)
          .then((result) => ({ email, result }))
          .catch((error) => Promise.reject({ email, error }));
      })
    );

    const successfulEmails = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value.email);

    const failedEmails = results
      .filter((r) => r.status === "rejected")
      .map((r) => r.reason.email);

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => ({
        email: r.reason.email,
        error: r.reason.error.response || r.reason.error.message,
      }));
    return res.status(200).json({
      message:
        successfulEmails.length === 0
          ? "Failed to send any emails"
          : failedEmails.length > 0
          ? "Some emails were sent successfully"
          : "All emails sent successfully",
      success: successfulEmails.length,
      failed: failedEmails.length,
      successfulEmails: successfulEmails || [],
      failedEmails: failedEmails || [],
      errors: errors || [],
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
  configureSMTP,
  sendBulkEmails,
};
