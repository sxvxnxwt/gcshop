const db = require('./db');
var util = require('../util/util');
var sanitizeHtml = require('sanitize-html'); 

function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if(req.session.is_logined){ 
        name = req.session.name;
        login = true;
        cls = req.session.cls ;
    }
    return {name,login,cls}
}

function check() {
    var checkYN = document.querySelectorAll('input[name="check_yn"]:checked').length
    if(checkYN){
        return true;
    } else{
        return false;
    }
}

module.exports = {
    purchasedetail: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var merId = parseInt(req.params.merId);

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select * from product where mer_id = ${merId};`
        var sql4 = `select * from person where name = '${name}';`

        db.query(sql1 + sql2 + sql3 + sql4, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'purchaseDetail.ejs',
                cod: results[0],
                boardtypes: results[1],
                mer: results[2],
                person: results[3]
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        })
    },

    create_process: (req, res) => {
        var post = req.body;

        var sntzedLoginid = sanitizeHtml(post.loginid);
        var sntzedMerid = parseInt(sanitizeHtml(post.mer_id));
        var sntzedPrice = parseInt(sanitizeHtml(post.price));
        var sntzedQty = parseInt(sanitizeHtml(post.qty));

        var date = util.dateOfEightDigit();
        var total = parseInt(sntzedPrice * sntzedQty);

        db.query('INSERT INTO purchase (loginid, mer_id, date, price, point, qty, payYN, cancel, refund, total) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [sntzedLoginid, sntzedMerid, date, sntzedPrice, 0, sntzedQty, 'Y', 'N', 'N', total], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/purchase');
                    res.end();
                }
        );
    },

    purchase: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select t.image as image, t.name as name, p.price as price, p.qty as qty, p.total as total, 
                        p.date as date, p.cancel as cancel, p.loginid as loginid, l.name as personname, p.purchase_id as purchase_id
                        from purchase p inner join person l on p.loginid = l.loginid
                        inner join product t on p.mer_id = t.mer_id where l.name = '${name}'; `

        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'purchase.ejs',
                cod: results[0],
                boardtypes: results[1],
                mer: results[2]
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        })
    },

    update_process: (req, res) => {
        var purchase_id = parseInt(req.params.purchaseId);
        var cancel = 'Y';

        db.query('UPDATE purchase SET cancel = ? where purchase_id = ?', 
                [cancel, purchase_id], (error, result) => {
                    if(error){
                        console.log(error)
                    }

                    res.redirect('/purchase');
                    res.end();
                }
        );
    },

    cart: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select l.name as personname, p.image as image, p.name as productname,
                        p.price as price, c.date as date, p.mer_id as mer_id, c.cart_id as cart_id
                            from cart c inner join product p on c.mer_id = p.mer_id
                            inner join person l on c.loginid = l.loginid
                                where l.name = '${name}';`
        var sql4 = `select * from person where name='${name}';`
        
        db.query(sql1 + sql2 +sql3 + sql4, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'cart.ejs',
                cod: results[0],
                boardtypes: results[1],
                cart: results[2],
                l: results[3]
            };

            res.render('mainFrame', context, (err,html) => {
                if(err){
                    console.log(err);
                }
                res.end(html)
            });
        });
    },

    cart_process: (req, res) => {
        var post = req.body

        var mer_id = parseInt(sanitizeHtml(post.mer_id))
        var loginid = sanitizeHtml(post.loginid)
        var date = util.dateOfEightDigit();

        var sql1 = `select * from cart where loginid = '${loginid}' and mer_id = ${mer_id};`

        db.query(sql1, (error, result) => {
            if(result.length === 0) {
                db.query('INSERT INTO cart (loginid, mer_id, date) VALUES(?, ?, ?)', 
                    [loginid, mer_id, date], (error, result) => {
                        if(error){
                            throw error;
                        }

                        res.redirect('/purchase/cart');
                        res.end();
                });
            } else {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(`<script type='text/javascript' charset='utf-8'>alert("장바구니에 이미 있는 제품입니다.")
                            setTimeout("location.href='http://localhost:3000/purchase/cart'",1000);
                    </script>`)
            }
        })
        
    },

    cart_create_process: (req, res) => {
        var post = req.body
        const selectedItems = JSON.parse(req.body.selectedItems)

        if(selectedItems.length === 0) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(`<script type='text/javascript' charset='utf-8'>alert("구매할 상품을 선택해 주세요.")
                            setTimeout("location.href='http://localhost:3000/purchase/cart'",1000);
                    </script>`)
        } else if(selectedItems.length === undefined) {
            var loginid = post.loginid
            var date = util.dateOfEightDigit()
            var mer_id = parseInt(selectedItems.merId, 10)
            var price = parseInt(selectedItems.price, 10)
            var qty = parseInt(selectedItems.qty, 10)
            var point = 0
            var total = price * qty

            var sql1 = `INSERT INTO purchase (loginid, mer_id, date, price, point, qty, total, payYN, cancel, refund) values ('${loginid}', ${mer_id}, '${date}', ${price}, ${point}, ${qty}, ${total}, 'N', 'N', 'N'); `
            var sql2 = `DELETE FROM cart WHERE mer_id = ${mer_id};`

            db.query(sql1 + sql2, (err, results) => {
                if(err) {
                    console.log(err);
                }
            });
            res.redirect('/purchase');
            res.end();

        } else {
            var loginid = post.loginid
            var date = util.dateOfEightDigit()
            for(var i=0; i<selectedItems.length; i++) {
                var mer_id = parseInt(selectedItems[i].merId,10);
                var price = parseInt(selectedItems[i].price, 10);
                var qty = parseInt(selectedItems[i].qty, 10);
                var point = 0;
                var total = qty*price;

                var sql1 = `INSERT INTO purchase (loginid, mer_id, date, price, point, qty, total, payYN, cancel, refund) values ('${loginid}', ${mer_id}, '${date}', ${price}, ${point}, ${qty}, ${total}, 'N', 'N', 'N'); `
                var sql2 = `DELETE FROM cart WHERE mer_id = ${mer_id};`

                db.query(sql1 + sql2, (err, results) => {
                    if(err) {
                        console.log(err)
                    }
                });
            }
            res.redirect('/purchase');
            res.end();
        }

    },

    cart_delete_process: (req, res) => {
        var post = req.body
        const selectedItems = JSON.parse(req.body.selectedItems)

        if(selectedItems.length === 0) {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(`<script type='text/javascript' charset='utf-8'>alert("삭제할 상품을 선택해 주세요.")
                            setTimeout("location.href='http://localhost:3000/purchase/cart'",1000);
                    </script>`)
        } else if(selectedItems.length === undefined ) {
            var mer_id = parseInt(selectedItems.merId)
            db.query('delete from cart where mer_id = ?', [mer_id], (err2,result) => {
                if(err2){
                    console.log(err2)
                }
            })
            res.redirect('/purchase');
            res.end();
        } else {
            
            for(var i=0; i<selectedItems.length; i++) {
                var mer_id = parseInt(selectedItems[i].merId)
                var price = parseInt(selectedItems[i].price)
                var qty = parseInt(selectedItems[i].qty)

                db.query('delete from cart where mer_id = ?', [mer_id], (err2, result) => {
                    if(err2) {
                        console.log(err2)
                    }
                })
            }
            res.redirect('/purchase');
            res.end();
        }
    },

}