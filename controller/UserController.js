const User = require('../model/user')
const bcrypt = require('bcryptjs')

module.exports = {
    getUser: async (req, res) => {
        try {
            const user = await User.findById(req.user)
            res.json({
                name: user.name,
                email: user.email
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Internal Server Error"})
        }
    },
    updateName: async (req, res) => {
        try {
            const { name } = req.body
            const user = await User.findById(req.user)
            user.name = name
            await user.save()
            res.json({msg: "Name Updated Succesfully"})
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Internal Server Error"})
        }
    },
    updateEmail: async (req, res) => {
        try {
            const { email } = req.body
            const user = await User.findById(req.user)
            user.email = email
            await user.save()
            res.json({msg: "Email Updated Succesfully"})
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Internal Server Error"})
        }
    },
    resetPin: async (req, res) => {
        try {
            const { newPin, password } = req.body;
            const user = await User.findById(req.user)
            if (!await bcrypt.compare(password, user.password))
                return res.status(400).json({msg: "Invalid Password"});
            const hashed = await bcrypt.hash(newPin, 4);
            user.pin = hashed
            await user.save();
            res.json({msg: "Pin Updated"})
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Internal Server Error"})
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { password, newPassword } = req.body;
            const user = await User.findById(req.user)
            if (!await bcrypt.compare(password, user.password))
                return res.status(400).json({msg: "Invalid Password"});
            const hashed = await bcrypt.hash(newPassword, 8);
            user.password = hashed
            await user.save();
            res.json({msg: "Password Updated"})
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Internal Server Error"})
        }
    },
    logoutUser: async (req, res) => {
        try {
            res.clearCookie('token')
            res.json({msg: "User logged out"})
        } catch (error) {
            console.log(error)
            res.status(500).json({msg: "Internal Server Error"})
        }
    }
}