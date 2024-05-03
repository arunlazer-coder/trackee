const accountController = require('../controllers/account')
const router = require('express').Router()
router.get('/list', accountController.list)
router.post('/upsert', accountController.upsert)
router.delete('/delete', accountController.destroy)

module.exports = {accountRouter:router}