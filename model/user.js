const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign(
    { user: user._id.toString() },
    process.env.SECURITY_KEY,
    {
      expiresIn: 36000,
    }
  );

  return token;
};

const user = mongoose.model("User", UserSchema);
module.exports = user;
