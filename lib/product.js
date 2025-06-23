var db = require('./db');
var sanitizeHtml = require('sanitize-html'); 

function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if(req.session.is_logined){ 
        name = req.session.name;
        login = true;
        cls = req.session.cls; // 테이블에 있는 class 값
    }
    return {name,login,cls}
}

function escapeParser(a){
    var b = '';

    b = a.replace(/&lt;/g, '<');
    b = b.replace(/&gt;/g,'>');
    b = b.replace(/&nbsp;/g,' ');
    b = b.replace(/&amp;/g, '&');
    b = b.replace(/&quot;/g, '"');

    return b;
}

module.exports = {
    view: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code;`
        
        db.query(sql1 + sql2 + sql3, (error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'product.ejs',
                cls: cls,
                mer: results[1],
                boardtypes: results[0],
                root: false,
                cod: results[2]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            });
        });
    },

    create: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2,(error,results)=>{
            db.query('SELECT * from product', (error, results2) => {
                var context = { 
                    who : name,
                    login: login,
                    body : 'productCU.ejs',
                    cls: cls,
                    create: true,
                    categorys: results[1],
                    boardtypes: results[0],
                    mer: results2,
                    cod: results[1]
                };
                res.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                }); //render end
            }) 
        });
    },

    create_process: (req, res) => {
        var post = req.body;
        var sntzedName = escapeParser(sanitizeHtml(post.name));
        var sntzedPrice = parseInt(sanitizeHtml(post.price));
        var sntzedStock = parseInt(sanitizeHtml(post.stock));
        var sntzedBrand = escapeParser(sanitizeHtml(post.brand));
        var sntzedSupplier = escapeParser(sanitizeHtml(post.supplier));
        var sntzedSaleYN = sanitizeHtml(post.sale_yn);
        var sntzedSalePrice = parseInt(sanitizeHtml(post.sale_price));

        sntzedCategory = escapeParser(sanitizeHtml(post.category))

        var main_id = sntzedCategory.substr(0, 4)
        var sub_id = sntzedCategory.substr(4, 4)

        var sntzedFile = '/image/' + req.file.filename

        db.query('INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image, sale_yn, sale_price) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock, sntzedBrand, sntzedSupplier, sntzedFile, sntzedSaleYN, sntzedSalePrice], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/product/view');
                    res.end();
                }
        );
    },

    update: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var merId = parseInt(req.params.merId)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2,(error,results)=>{
            db.query(`select * from product where mer_id = ?`, [merId], (error, result) => {
                var context = { 
                    who : name,
                    login: login,
                    body : 'productCU.ejs',
                    cls: cls,
                    create: false,
                    categorys: results[1],
                    boardtypes: results[0],
                    mer: result,
                    cod: results[1]
                };
                res.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                });
            })
        });
    },

    update_process: (req, res) => {
        var post = req.body;
        var sntzedName = escapeParser(sanitizeHtml(post.name));
        var sntzedPrice = parseInt(sanitizeHtml(post.price));
        var sntzedStock = parseInt(sanitizeHtml(post.stock));
        var sntzedBrand = escapeParser(sanitizeHtml(post.brand));
        var sntzedSupplier = escapeParser(sanitizeHtml(post.supplier));
        var sntzedSaleYN = sanitizeHtml(post.sale_yn);
        var sntzedSalePrice = parseInt(sanitizeHtml(post.sale_price));

        sntzedCategory = escapeParser(sanitizeHtml(post.category))

        var main_id = sntzedCategory.substr(0, 4)
        var sub_id = sntzedCategory.substr(4, 4)
        
        var sntzedFile = req.file ? '/image/' + req.file.filename : post.image;

        db.query('UPDATE product SET main_id = ?, sub_id = ?, name = ?, price = ?, stock = ?, brand = ?, supplier = ?, image = ?, sale_yn = ?, sale_price = ? where mer_id = ?', 
                [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock, sntzedBrand, sntzedSupplier, sntzedFile, sntzedSaleYN, sntzedSalePrice, post.merId], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/product/view');
                    res.end();
                }
        );
    },

    delete_process: (req, res) => {
        var merId = parseInt(req.params.merId)

        db.query('DELETE FROM product where mer_id = ?',
                [merId], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/product/view');
                    res.end();
                }
        );
    }
}