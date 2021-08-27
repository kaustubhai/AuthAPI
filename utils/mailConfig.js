const nodemailer = require("nodemailer");

module.exports = (data) => {
  const { to, body } = data;
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL,
      pass: process.env.PASS,
    },
  });
  let mailOptions = {
    from: `"Admin" <${process.env.MAIL}>`,
    to,
    subject: "Reset password request",
    html: body,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
      return false;
    }
    return true;
  });
};
