const express = require('express')
const router = express.Router()

const ProductController = require('../controllers/Products')

router.route('/')
    .get(ProductController.getAllProduct)
    .post(ProductController.addProduct)
router.route('/:id')
    .get(ProductController.getProductById)
    .put(ProductController.updateProduct)
    .delete(ProductController.deleteProduct)
    
module.exports = router