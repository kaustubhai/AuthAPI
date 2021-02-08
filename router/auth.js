const authController = require('../controller/AuthController')
const express = require("express")
const Router = express.Router()

Router.post('/register', authController.register)
Router.post('/login', authController.loginWithPin)
Router.post('/login/password', authController.loginWithPassword)
Router.post('/login/forgotPassword', authController.forgotPasswordRequest)
Router.post('/login/:requestId', authController.resetPassword)

module.exports = Router