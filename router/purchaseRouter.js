const express= require('express');
var router= express.Router()

var purchase = require('../lib/purchase');

router.get('/detail/:merId', (req, res) => {
    purchase.purchasedetail(req, res)
});

router.get('/', (req, res) => {
    purchase.purchase(req, res)
});

router.post('/create_process', (req, res) => {
    purchase.create_process(req, res)
});

router.get('/update_process/:purchaseId', (req, res) => {
    purchase.update_process(req, res)
});

router.get('/cart', (req, res) => {
    purchase.cart(req, res)
});

router.post('/cart_process', (req, res) => {
    purchase.cart_process(req, res)
})

router.post('/cart_create_process', (req, res) => {
    purchase.cart_create_process(req, res)
});

router.post('/cart_delete_process', (req, res) => {
    purchase.cart_delete_process(req, res)
});

module.exports = router;