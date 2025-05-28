const db = require("../db");
const { genarateOTP, verifyOTP } = require("../utils/otp");
const sendOTPViaEmail = require("../utils/mailer");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required!" });
  }

  try {
    const sql = "SELECT * FROM users WHERE username = ?";
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [username], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, result[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("เกิดข้อผิดพลาด", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  let role = req.body.role;
  if (!role) {
    role = "user"; // กำหนด default ถ้า role ไม่ส่งมา
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and Password are required!" });
  }

  const checkUsernameSql = "SELECT * FROM users WHERE username = ?";
  db.query(checkUsernameSql, [username], (err, result) => {
    if (err) return reject(err);
    resolve(result);

    if (result.length > 0) {
      return res.status(400).json({ message: "Username is already taken!" });
    }
  });

  const createAccout =
    "INSERT INTO users (username,password,email,role) VALUES (?,?,?,?)";
  db.query(
    createAccout,
    [username, hashedPassword, email, role],
    (err, result) => {
      if (err) {
        console.error("เกิดข้อผิดพลาด", err);
        return res.status(500).json({ message: "Server error" });
      }

      return res.status(201).json({ message: "Register Successfully!" });
    }
  );
};

exports.changePassword = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username or Passwrod are require!" });

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const updatePassword = "UPDATE users SET password = ? WHERE username = ?";
    db.query(updatePassword, [hashedPassword, username], (err, result) => {
      if (err) return res.status(500).json({ message: " server error" });
      return res.status(201).json({ message: "Update successful" });
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

//OTP,Email

exports.sendOTPHandler = async (req, res) => {
  const { email } = req.body;
  const otp = genarateOTP();

  try {
    await sendOTPViaEmail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

//path verify OTP
exports.verifyOTPHandler = (req, res) => {
  const { email, otp } = req.body;
  const isValid = verifyOTP(email, otp);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  return res.status(200).json({ message: "OTP verification successful" });
};
