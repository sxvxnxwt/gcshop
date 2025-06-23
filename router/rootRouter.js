const express= require('express');
const router= express.Router();

var root = require('../lib/root');

router.get('/', (req,res)=>{
    root.home(req,res)
})

router.get('/category/:categ', (req, res) => {
    root.categoryview(req, res)
})

router.post('/search', (req, res) => {
    root.search(req, res)
})

router.get('/detail/:merId', (req, res) => {
    root.detail(req, res)
})

router.get('/cartview', (req, res) => {
    root.cartview(req, res)
});

router.get('/cartupdate/:cartId', (req, res) => {
    root.cartupdate(req, res)
});

router.post('/cartupdate_process', (req, res) => {
    root.cartupdate_process(req, res)
});

router.get('/cartdelete_process/:cartId', (req, res) => {
    root.cartdelete_process(req, res)
});

router.get('/purchaseview', (req, res) => {
    root.purchaseview(req, res)
});

router.get('/purchaseupdate/:purchaseId', (req, res) => {
    root.purchaseupdate(req, res)
});

router.post('/purchaseupdate_process', (req, res) => {
    root.purchaseupdate_process(req, res)
});

router.get('/purchasedelete_process/:purchaseId', (req, res) => {
    root.purchasedelete_process(req, res)
});

module.exports = router;