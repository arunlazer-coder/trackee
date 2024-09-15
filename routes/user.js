const userController = require('../controllers/user')
const auth = require('../middlewares/auth')
const router = require('express').Router()
const {registerVal, loginVal} = require('../middlewares/validation')
router.post('/upsert', registerVal, userController.upsert)
router.get('/list', userController.list)
router.get('/profile', auth,userController.profile)
router.get('/dashboard', auth,userController.dashboard)
router.post('/login',loginVal, userController.login)
router.post('/otpVerify',auth, userController.otpVerify)
router.get('/stack',auth, userController.stack)

module.exports = {
    userRoute:router
}