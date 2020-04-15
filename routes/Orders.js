const express = require('express')
const router = express.Router()

const OrderController = require('../controllers/Orders')

router.route('/')
    .get(OrderController.getAllOrder)
    .post(OrderController.addOrder)
router.route('/:id')
    .get(OrderController.getOrderById)
    .put(OrderController.updateOrder)
    .delete(OrderController.deleteOrder)
    
module.exports = router