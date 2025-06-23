const express= require('express');
const router= express.Router();

var table = require('../lib/table');

router.get('/', (req,res)=>{
    table.home(req,res)
});

router.get('/view/:tableName', (req, res) => {
    table.view_table(req, res)
});

module.exports = router;