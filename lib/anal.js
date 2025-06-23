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
    customer: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select address, ROUND(( count(*) / (select count(*) from person )) * 100, 2) as rate from person group by address;`
        
        db.query(sql1 + sql2 + sql3, (err, results) => {
            if(err) {
                console.log(err);
            }
            var context = {
                who: name,
                login: login,
                cls: cls,
                body: 'ceoAnal.ejs',
                cod: results[0],
                boardtypes: results[1],
                percentage: results[2],
            };
            res.render('mainFrame', context, (err, html) => {
                res.end(html)
            });
        })
    },
}