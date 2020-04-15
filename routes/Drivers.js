const express = require('express')
const router = express.Router()
const DriverController = require('../controllers/Drivers')

router.route('/')
    .get(DriverController.getAllDriver)
    .post(DriverController.addDriver)
router.route('/:id')
    .get(DriverController.getDriverById)
    .put(DriverController.updateDriver)
    .delete(DriverController.deleteDriver)

module.exports = router