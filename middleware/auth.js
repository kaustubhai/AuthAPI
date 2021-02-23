const jwt = require('jsonwebtoken')
const User = require('../model/user')

module.exports = function (req, res, next) {
    const token = req.cookies.token

    if (!token)
        return res.status(401).json({ msg: "Unathorised Access" })
    try {
        const decoded = jwt.verify(token, process.env.SECURITY_KEY)
        const user = User.findById(decoded.user)
        if (!user)
            return res.status(401).json({msg: "No user founded"})
        req.user = decoded.user
        next()
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Token is not Valid" })
    }
}