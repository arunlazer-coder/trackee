const accountController = require('../controllers/account')
const router = require('express').Router()

const auth = require('../middlewares/auth')

router.get('/list', auth, accountController.list)
router.post('/upsert', auth, accountController.upsert)
router.delete('/delete', auth, accountController.destroy)

module.exports = {accountRouter:router}