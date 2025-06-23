const express= require('express');
var router= express.Router()

var anal= require('../lib/anal')

router.get('/customer', (req, res) => {
    anal.customer(req, res);
});

module.exports = router;