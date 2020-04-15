const express = require('express')
const router = express.Router()

router.get('/', (req,res) =>{
    res.json({
        "Author": "Fadhel Muhammad",
        "Github": "https://github.com/fdhlmhd",
        "Project": "TryOut-Online-Orderr"
    })
})

module.exports = router