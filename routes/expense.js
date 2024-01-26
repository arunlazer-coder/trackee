const expenseController = require('../controllers/expense')
const router = require('express').Router()
const {expenseVal} = require('../middlewares/validation')
const auth = require('../middlewares/auth')

router.post('/upsert', auth, expenseVal, expenseController.upsert)
router.get('/list', auth, expenseController.list)
router.delete('/delete', auth, expenseController.destroy)

module.exports = {expenseRouter:router}