const userController = require('../controller/UserController')
const auth = require('../middleware/auth')
const express = require('express')
const Router = express.Router()

Router.get('/', auth, userController.getUser)
Router.patch('/updateName', auth, userController.updateName)
Router.patch('/updateEmail', auth, userController.updateEmail)
Router.patch('/reset/pin', auth, userController.resetPin)
Router.patch('/reset/password', auth, userController.resetPassword)
Router.post('/logout', auth, userController.logoutUser)

module.exports = Router