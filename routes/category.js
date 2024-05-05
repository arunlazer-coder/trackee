const categoryController = require('../controllers/category')
const router = require('express').Router()
const auth = require('../middlewares/auth')

router.get('/list', auth, categoryController.list)
router.post('/upsert', auth, categoryController.upsert)
router.delete('/delete', auth, categoryController.destroy)

module.exports = {categoryRouter:router}