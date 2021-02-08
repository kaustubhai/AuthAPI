const User = require('../model/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const { findOne } = require('../model/user');

module.exports = {
    register: async (req, res) => {
        try {
            const { name, email, password, pin } = req.body;
            let user = await User.findOne({ email });
            if (user)
                return res.status(400).send("User already exists");
            if(!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
                return res.status(400).send("Invalid Mail Provided");
            if (password.length < 8)
                return res.status(400).send("Password should be of 8 characters atleast")
            if (pin.match(/[^0-9]/g))
                return res.status(400).send("Pin should consist only numbers")
            if (pin.length !== 4)
                return res.status(400).send("Pin should be exactly 4 length")
            user = new User({ name, email, password, pin });
            user.password = await bcrypt.hash(user.password, 8);
            user.pin = await bcrypt.hash(user.pin, 4);
            await user.save();
            res.json({ msg: "User Created. Login!" })
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Server Error")
        }
    },

    loginWithPin: async (req, res) => {
        try {
            const { email, pin } = req.body;
            let user = await User.findOne({ email });
            if (user.length === 0)
                return res.status(400).send("No User Founded");
            if (!await bcrypt.compare(pin, user.pin))
                return res.status(400).send("Pin Mismatched")
            const token = await user.generateToken()
            res.cookie('token', token, { httpOnly: true }).json(token)
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Server Error")
        }
    },

    loginWithPassword: async (req, res) => {
        try {
            const { email, password } = req.body;
            let user = await User.findOne({ email });
            if (!user)
                return res.status(400).send("No User Founded");
            if (!await bcrypt.compare(password, user.password))
                return res.status(400).send("Password Mismatched")
            const token = await user.generateToken()
                res.cookie('token', token, { httpOnly: true }).json(token)
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Server Error")
        }
    },

    forgotPasswordRequest: async (req, res) => {
        try {
            const { email } = req.body
            let user = await User.findOne({ email });
            if (!user)
                return res.status(400).send("No User Founded");
            const payload = {
                password: user.password
            }
            const token = jwt.sign(payload, user.password, {
                expiresIn: 3600
            })
            res.json(token)
        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Server Error")
        }
    },

    resetPassword: async (req, res) => {
        let tokenValid = true;
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })
            const token = req.params.requestId
            jwt.verify(token, user.password, (err) => {
                if(err){
                    tokenValid = false
                    return res.status(400).send("Token Expired")
                }
            })
            if(tokenValid){
                const passwordHashed = await bcrypt.hash(password, 8)
                user.password = passwordHashed;
                await user.save();
                res.json({ msg: "Password Changed Succesfully" })
            }
        } catch (error) {
            console.log(error)
            if(tokenValid)
                res.status(500).send("Internal Server Error")
        }
    }
}