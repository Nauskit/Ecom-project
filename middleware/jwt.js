const jwt = require("jsonwebtoken");

const SCRET_KEY = process.env.SCRET_KEY;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SCRET_KEY,
    { expiresIn: "1h" }
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader.replace("Bearer", "").trim();

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(token, SCRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { authenticateToken, generateToken };
