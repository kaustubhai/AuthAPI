const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const emailer = require("../utils/mailConfig");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, pin } = req.body;
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });
      if (
        !email.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
      )
        return res.status(400).json({ msg: "Invalid Mail Provided" });
      if (password.length < 8)
        return res
          .status(400)
          .json({ msg: "Password should be of 8 characters atleast" });
      if (pin.match(/[^0-9]/g))
        return res.status(400).json({ msg: "Pin should consist only numbers" });
      if (pin.length !== 4)
        return res.status(400).json({ msg: "Pin should be exactly 4 length" });
      user = new User({ name, email, password, pin });
      user.password = await bcrypt.hash(user.password, 8);
      user.pin = await bcrypt.hash(user.pin, 4);
      await user.save();
      res.json({ msg: "User Created. Login!" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  googleLogin: async (req, res) => {
    try {
      const { tokenId } = req.body;
      const response = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email_verified, email } = response.payload;
      if (email_verified) {
        const user = await models.User.findOne({ email }).select("-password");
        if (user) {
          const token = await user.generateToken();
          res.cookie("token", token, { httpOnly: true }).json(token);
        } else {
          const newUser = new models.User({
            name: response.payload.name,
            email: response.payload.email,
            password: response.payload.email + process.env.JWT_SECRET,
          });
          newUser.password = await bcrypt.hash(user.password, 8);
          await newUser.save();
          res.json({ msg: "User Created. Login!" });
        }
      } else return res.json(false, "Please verify your Google account");
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        error: "Something went wrong",
      });
    }
  },

  loginWithPin: async (req, res) => {
    try {
      const { email, pin } = req.body;
      let user = await User.findOne({ email });
      if (user.length === 0)
        return res.status(400).json({ msg: "No User Founded" });
      if (!user.pin)
        return res.status(400).json({ msg: "Pin not associated with account" });
      if (!(await bcrypt.compare(pin, user.pin)))
        return res.status(400).json({ msg: "Pin Mismatched" });
      const token = await user.generateToken();
      res.cookie("token", token, { httpOnly: true }).json(token);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  loginWithPassword: async (req, res) => {
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "No User Founded" });
      if (!(await bcrypt.compare(password, user.password)))
        return res.status(400).json({ msg: "Password Mismatched" });
      const token = await user.generateToken();
      res.cookie("token", token, { httpOnly: true }).json(token);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  forgotPasswordRequest: async (req, res) => {
    try {
      const { email } = req.body;
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "No User Founded" });
      const payload = {
        password: user.password,
      };
      const token = jwt.sign(payload, user.password, {
        expiresIn: 3600,
      });
      emailer({
        to: email,
        body: `
                <h2 style="font-style: arial; font-size: 2em">Greetings from Admin</h2>
                <h3 style="font-style: arial; font-size: 1.2em">
                Seems like you forgot your password, use <a href="http://localhost:3000/reset/password/${token}" target="_blank">this link</a> to reset it.
                </h3>
                <code style="color: red; font-size: 1em">Do not share this code with anyone else</code>
            `,
      });
      res.json("Mail sent!");
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  },

  resetPassword: async (req, res) => {
    let tokenValid = true;
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      const token = req.params.requestId;
      jwt.verify(token, user.password, (err) => {
        if (err) {
          tokenValid = false;
          return res.status(400).json({ msg: "Token Expired" });
        }
      });
      if (tokenValid) {
        const passwordHashed = await bcrypt.hash(password, 8);
        user.password = passwordHashed;
        await user.save();
        res.json({ msg: "Password Changed Succesfully" });
      }
    } catch (error) {
      console.log(error);
      if (tokenValid) res.status(500).json({ msg: "Internal Server Error" });
    }
  },
};
