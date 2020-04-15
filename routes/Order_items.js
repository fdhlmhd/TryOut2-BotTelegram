const express = require('express')
const router = express.Router()

const OrderController = require('../controllers/Order_items')

router.route('/:id')
    .get(OrderController.getOrderDetailById)

module.exports = router