const express = require('express')
const router = express.Router()
const CustomerController = require('../controllers/Customers')

router.route('/')
    .get(CustomerController.getAllCustomer)
    .post(CustomerController.addCustomer)
router.route('/:id')
    .get(CustomerController.getCustomerById)
    .put(CustomerController.updateCustomer)
    .delete(CustomerController.deleteCustomer)

module.exports = router