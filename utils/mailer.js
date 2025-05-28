const nodemailer = require("nodemailer");

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

module.exports = sendOTPViaEmail;
