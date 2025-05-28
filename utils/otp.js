const speakeasy = require("speakeasy");
const getsecret = require("getsecret");

const genarateOTP = () => {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    encoding: "base32",
    step: 300,
  });
};

//otp verify
const verifyOTP = (email, otp) => {
  const secret = getsecret(email);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: otp,
    step: 300,
    window: 1,
  });
};

module.exports = { genarateOTP, verifyOTP };
