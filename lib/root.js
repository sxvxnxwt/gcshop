const db = require('./db');
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

module.exports = {
    home : (req,res)=>{ 
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = ` select * from product;`
        var sql3 = `select * from code;`

        db.query(sql1 + sql2 + sql3,(error,results)=>{
        var context = { 
            /*********** mainFrame.ejs에 필요한 변수 ***********/
            who : name,
            login: login,
            body : 'product.ejs',
            cls: cls,
            boardtypes: results[0],
            mer: results[1],
            root: true,
            cod: results[2]
        };
        res.render('mainFrame',context,(err,html)=>{
            res.end(html)
            }); //render end
        }); //query end
    },

    categoryview: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        categ = req.params.categ;

        var main_id = categ.substr(0,4)
        var sub_id = categ.substr(4,4)

        var sql1 = `select * from product where main_id = ${main_id} and sub_id = ${sub_id};`
        var sql2 = `select * from code;`
        var sql3 = `select * from boardtype;`

        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                mer: results[0],
                cod: results[1],
                boardtypes: results[2],
                root: true
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        });
    },

    search: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var body = req.body

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select * from product where name like '%${body.search}%' or
                                            brand like '%${body.search}%' or
                                            supplier like '%${body.search}%'; `
        
        db.query(sql1+sql2+sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                mer: results[2],
                cod: results[0],
                boardtypes: results[1],
                root: true
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        });
    },

    detail: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var merId = parseInt(req.params.merId);

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select * from product where mer_id = ${merId};`
        var sql4 = `select * from person where name = '${name}';`

        db.query(sql1 + sql2 + sql3 + sql4, (error, results) => {
            if(!results[3] || results[3].length === 0) {
                results[3] = [{
                    name: 'Guest',
                    loginid: null
                }];
            }
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'productDetail.ejs',
                cod: results[0],
                boardtypes: results[1],
                mer: results[2],
                loginid: results[3][0].loginid
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        });
    },

    cartview: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from code;` //results[0] - cod
        var sql2 = `select * from boardtype;` //results[1] - boardtypes
        var sql3 = `select c.loginid as loginid, l.name as personname, c.cart_id as cart_id,
                        c.mer_id as mer_id, p.name as productname, c.date as date 
                            from cart c inner join person l on c.loginid = l.loginid 
                            inner join product p on c.mer_id = p.mer_id; ` //results[2] - cart
    
        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'cartView.ejs',
                cod: results[0],
                boardtypes: results[1],
                cart: results[2]
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        });
    },

    cartupdate: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var cart_id = parseInt(req.params.cartId);

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select c.cart_id as cart_id, l.name as personname,
                        p.name as productname, c.date as date 
                            from cart c inner join person l on c.loginid = l.loginid
                            inner join product p on c.mer_id = p.mer_id where c.cart_id = ${cart_id};`
        var sql4 = `select * from person where class = 'CST';`
        var sql5 = `select * from product;`

        db.query(sql1 + sql2 + sql3 + sql4 + sql5, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'cartU.ejs',
                cod: results[0],
                boardtypes: results[1],
                cart: results[2],
                customer: results[3],
                product: results[4]
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        })
    },

    cartupdate_process: (req, res) => {
        var post = req.body;
        var sntzedPersonname = sanitizeHtml(post.customer_category);
        var sntzedProductname = sanitizeHtml(post.product_category);

        var cart_id = parseInt(post.cartId);

        var sql1 = `select * from person where name = '${sntzedPersonname}';`
        var sql2 = `select * from product where name = '${sntzedProductname}';`

        db.query(sql1 + sql2, (error, results) => {
            var loginid = results[0][0].loginid;
            var mer_id = parseInt(results[1][0].mer_id);

            db.query(`UPDATE cart SET loginid = ?, mer_id = ? where cart_id = ?`,
                [loginid, mer_id, cart_id], (error, result) => {
                    if(error) {
                        throw error;
                    }

                    res.redirect('/cartview');
                    res.end();
            });
        });

    },

    cartdelete_process: (req, res) => {
        var cartId = parseInt(req.params.cartId)

        db.query('DELETE FROM cart where cart_id = ?',
                [cartId], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/cartview');
                    res.end();
                }
        );
    },

    purchaseview: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from code;` //results[0] - cod
        var sql2 = `select * from boardtype;` //results[1] - boardtypes
        var sql3 = `select m.purchase_id as purchase_id, m.loginid as loginid, l.name as personname, m.mer_id as mer_id,
	                    p.name as productname, m.date as date, m.price as price, m.point as point, m.qty as qty,
                        m.total as total, m.payYN as payYN, m.cancel as cancel, m.refund as refund
                            from purchase m inner join person l on m.loginid = l.loginid
                            inner join product p on m.mer_id = p.mer_id; ` //results[2] - purchase
    
        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'purchaseView.ejs',
                cod: results[0],
                boardtypes: results[1],
                purchase: results[2]
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        });
    },

    purchaseupdate: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var purchase_id = parseInt(req.params.purchaseId);

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select m.purchase_id as purchase_id, l.name as personname, p.name as productname,
	                    m.date as date, m.price as price, m.point as point, m.qty as qty, m.total as total,
                        m.payYN as payYN, m.cancel as cancel, m.refund as refund
		                    from purchase m inner join person l on m.loginid = l.loginid
                            inner join product p on m.mer_id = p.mer_id where m.purchase_id = ${purchase_id};`
        var sql4 = `select * from person where class = 'CST';`
        var sql5 = `select * from product;`

        db.query(sql1 + sql2 + sql3 + sql4 + sql5, (error, results) => {
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'purchaseU.ejs',
                cod: results[0],
                boardtypes: results[1],
                purchase: results[2],
                customer: results[3],
                product: results[4]
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        });
    },

    purchaseupdate_process: (req, res) => {
        var post = req.body;
        var sntzedPersonname = sanitizeHtml(post.customer_category);
        var sntzedProductname = sanitizeHtml(post.product_category);

        var purchase_id = parseInt(post.purchaseId);

        var sntzedPrice = parseInt(sanitizeHtml(post.price));
        var sntzedPoint = parseInt(sanitizeHtml(post.point));
        var sntzedQty = parseInt(sanitizeHtml(post.qty));
        var sntzedTotal = parseInt(sanitizeHtml(post.total));
        var sntzedPayYN = sanitizeHtml(post.payYN);
        if(sntzedPayYN === 'YES') {
            sntzedPayYN = 'Y'
        } else if(sntzedPayYN === 'NO') {
            sntzedPayYN = 'N'
        }
        var sntzedCancel = sanitizeHtml(post.cancel);
        if(sntzedCancel === 'YES') {
            sntzedCancel = 'Y'
        } else if(sntzedCancel === 'NO') {
            sntzedCancel = 'N'
        }
        var sntzedRefund = sanitizeHtml(post.refund);
        if(sntzedRefund === 'YES') {
            sntzedRefund = 'Y'
        } else if(sntzedRefund === 'NO') {
            sntzedRefund = 'N'
        }

        var sql1 = `select * from person where name = '${sntzedPersonname}';`
        var sql2 = `select * from product where name = '${sntzedProductname}';`

        db.query(sql1 + sql2, (error, results) => {
            var loginid = results[0][0].loginid;
            var mer_id = parseInt(results[1][0].mer_id);

            db.query(`UPDATE purchase SET loginid = ?, mer_id = ?, price = ?, point = ?, qty = ?, total = ?, payYN = ?, cancel = ?, refund = ? where purchase_id = ?`,
                [loginid, mer_id, sntzedPrice, sntzedPoint, sntzedQty, sntzedTotal, sntzedPayYN, sntzedCancel, sntzedRefund, purchase_id], (error, result) => {
                    if(error) {
                        throw error;
                    }

                    res.redirect('/purchaseview');
                    res.end();
            });
        });
    },

    purchasedelete_process: (req, res) => {
        var purchaseId = parseInt(req.params.purchaseId)

        db.query('DELETE FROM purchase where purchase_id = ?',
                [purchaseId], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/purchaseview');
                    res.end();
                }
        );
    }

}