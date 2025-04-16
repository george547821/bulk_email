const express = require("express");
const { checkSMTP, sendEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/check", checkSMTP);
router.post("/send-email", sendEmail);

module.exports = router;
