const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const getsecret = require("getsecret");
const db = require("./db");

require("dotenv").config();

const SALT_ROUNDS = 10;
const app = express();
app.use(bodyParser.json());

//middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied!" });
    }
    next();
  };
};

//OTP genarate
const genarateOTP = () => {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: "base32",
    step: 120,
  });
};

//otp verify
const verifyOTP = (email, otp) => {
  const secret = getsecret(email);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
    step: 120,
  });
};

//send email option
async function sendOTPViaEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "email",
    auth: {
      user: "dummy@email.com",
      pass: "password",
    },
  });

  const mailOptions = {
    from: "dummy@email.com",
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error("error sending email:", err);
    throw err;
  }
}

//path send to email
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = genarateOTP();

  try {
    await sendOTPViaEmail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

//path verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const isValid = verifyOTP(email, otp);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  return res.status(200).json({ message: "OTP verification successful" });
});

//get path
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด", err);
      return res.status(500).json({ message: "Server error" });
    }
    return res.status(200).json(result);
  });
});

//path get:id
app.get("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const sql = "SELECT * FROM products WHERE id = ?";

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(result[0]);
  });
});

//product post
app.post("/products", (req, res) => {
  const { name, price, quantity, image_url } = req.body;

  if (!name || !price || !quantity || !image_url) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const sql =
    "INSERT INTO products (name, price, quantity, image_url) VALUES (?,?,?,?)";
  db.query(sql, [name, price, quantity, image_url], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด", err);
      return res.status(500).json({ message: "Server error" });
    }
    return res.status(201).json({ message: "Product inserted successfully!" });
  });
});

//path delete no async
app.delete("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const deleteProduct = "DELETE FROM products WHERE id = ?";

  db.query(deleteProduct, [productId], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(201).json({ message: "Product deleted successfully!" });
  });
});

//path login
app.post("/login", async (req, res) => {
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
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
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
});

//path register async
app.post("/register", async (req, res) => {
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
    if (err) {
      console.error("เกิดข้อผิดพลาด", err);
      return res.status(500).json({ message: "Server error" });
    }
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
});

//path re-username
app.put("/changePassword", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const updatePassword = "UPDATE users SET password = ? WHERE username = ?";
  db.query(updatePassword, [hashedPassword, username], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาด", err);
      return res.status(500).json({ message: "Server error" });
    }
    return res.status(201).json({ message: "Update successful" });
  });
});

app.listen(3000, () => {
  console.log("Server running on port: http://localhost:3000");
});
