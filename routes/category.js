const categoryController = require('../controllers/category')
const router = require('express').Router()
router.get('/list', categoryController.list)
router.post('/upsert', categoryController.upsert)
router.delete('/delete', categoryController.destroy)

module.exports = {categoryRouter:router}