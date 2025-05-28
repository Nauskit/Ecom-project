const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.put("/changePassword", authController.changePassword);
router.post("/send-otp", authController.sendOTPHandler);
router.post("/verify-otp", authController.verifyOTPHandler);

module.exports = router;
