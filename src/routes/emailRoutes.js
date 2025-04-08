const express = require("express");
const {
  configureSMTP,
  sendBulkEmails,
} = require("../controllers/emailController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const apiLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
});

router.post("/configure-smtp", apiLimiter, configureSMTP);
router.post("/send-bulk-emails", apiLimiter, sendBulkEmails);

module.exports = router;
