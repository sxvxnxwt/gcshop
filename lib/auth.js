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
    login : (req,res)=>{
        var {name, login, cls} = authIsOwner(req,res);

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2, (error, results) => {
            var context = {
                /*********** mainFrame.ejs에 필요한 변수 ***********/
                who : name,
                login : login,
                body : 'login.ejs',
                cls : cls,
                boardtypes: results[0],
                cod: results[1]
            };
            req.app.render('mainFrame',context, (err, html)=>{
            res.end(html); }) 
        })
        
    },

    login_process : (req,res)=>{
        var post = req.body;
        var sntzedLoginid = sanitizeHtml(post.loginid);
        var sntzedPassword = escapeParser(sanitizeHtml(post.password));

        db.query('select count(*) as num from person where loginid = ? and password = ?',
        [sntzedLoginid,sntzedPassword],(error, results)=>{
            if (results[0].num === 1){
                db.query('select name, class,loginid, grade from person where loginid = ? and password = ?',
            [sntzedLoginid,sntzedPassword],(error, result)=>{
                req.session.is_logined = true;
                req.session.loginid = result[0].loginid
                req.session.name = result[0].name
                req.session.cls = result[0].class
                req.session.grade = result[0].grade
                res.redirect('/');
            }) 
        }
        else { req.session.is_logined = false;
                req.session.name = 'Guest';
                req.session.cls = 'NON';
                res.redirect('/'); }
        }) },
        
    logout_process : (req, res) => {
        req.session.destroy((err)=>{
        res.redirect('/');
    }) },

    register : (req, res) => {
        var {name, login, cls} = authIsOwner(req,res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2, (error, results) => {
            var context = {
                who : name,
                login : login,
                body : 'personCU.ejs',
                mng: false,
                create: true,
                cls : cls,
                boardtypes: results[0],
                cod: results[1]
            };
            req.app.render('mainFrame',context, (err, html)=>{
            res.end(html);
            })
        })
        
    },

    register_process : (req, res) => {
        var post = req.body;
        var sntzedLoginid = sanitizeHtml(post.loginid);
        var sntzedPassword = escapeParser(sanitizeHtml(post.password));
        var sntzedName = sanitizeHtml(post.name);
        var sntzedAddress = sanitizeHtml(post.address);
        var sntzedTel = sanitizeHtml(post.tel);
        var sntzedBirth = sanitizeHtml(post.birth);

        db.query('INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES(?, ?, ?, ?, ?, ?, "CST", "S")', 
                [sntzedLoginid, sntzedPassword, sntzedName, sntzedAddress, sntzedTel, sntzedBirth], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect(`/`);
                    res.end();
                }
        );
    },
}
