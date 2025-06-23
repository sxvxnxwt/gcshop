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
        var sql2 = `select * from person;`
        var sql3 = `select * from code;`

        db.query(sql1 + sql2 + sql3,(error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'person.ejs',
                cls: cls,
                boardtypes: results[0],
                persons: results[1],
                cod: results[2]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },

    create: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from person;`
        var sql3 = `select * from code;`
        
        db.query(sql1 + sql2 + sql3, (error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'personCU.ejs',
                cls: cls,
                mng: true,
                create: true,
                persons: results[1],
                boardtypes: results[0],
                cod: results[2]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },

    create_process: (req, res) => {
        var post = req.body;
        var sntzedLoginId = sanitizeHtml(post.loginid);
        var sntzedPassword = escapeParser(sanitizeHtml(post.password));
        var sntzedName = escapeParser(sanitizeHtml(post.name));
        var sntzedAddress = escapeParser(sanitizeHtml(post.address));
        var sntzedTel = sanitizeHtml(post.tel);
        var sntzedBirth = sanitizeHtml(post.birth);
        var sntzedClass = sanitizeHtml(post.class_category);
        switch(sntzedClass) {
            case '경영자':
                sntzedClass = 'CEO';
            case '관리자':
                sntzedClass = 'MNG';
            case '고객':
                sntzedClass = 'CST';
        }
        var sntzedGrade = sanitizeHtml(post.grade_category);
        switch(sntzedGrade) {
            case '실버(가장 낮은 등급)':
                sntzedGrade = 'S';
            case '골드(중간 등급)':
                sntzedGrade = 'G';
            case '다이아몬드(가장 높은 등급)':
                sntzedGrade = 'D';
        }

        db.query('INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', 
                [sntzedLoginId, sntzedPassword, sntzedName, sntzedAddress, sntzedTel, sntzedBirth, sntzedClass, sntzedGrade], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/person/view');
                    res.end();
                }
        );
    },

    update: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var l_i = req.params.loginId

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from person;`
        var sql3 = `select * from code;`

        db.query(sql1 + sql2 + sql3, (error,results)=>{
            db.query(`select * from person where loginid = ?`, [l_i], (error, result) => {
                var context = { 
                    who : name,
                    login: login,
                    body : 'personCU.ejs',
                    cls: cls,
                    mng: true,
                    create: false,
                    boardtypes: results[0],
                    persons: results[1],
                    person: result,
                    cod: results[2]
                };
                res.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                });
            })
        });
    },

    update_process: (req, res) => {
        var post = req.body;

        var sntzedPassword = escapeParser(sanitizeHtml(post.password));
        var sntzedName = escapeParser(sanitizeHtml(post.name));
        var sntzedAddress = escapeParser(sanitizeHtml(post.address));
        var sntzedTel = sanitizeHtml(post.tel);
        var sntzedBirth = sanitizeHtml(post.birth);
        var sntzedClass = sanitizeHtml(post.class_category);
        switch(sntzedClass) {
            case '경영자':
                sntzedClass = 'CEO';
            case '관리자':
                sntzedClass = 'MNG';
            case '고객':
                sntzedClass = 'CST';
        }
        var sntzedGrade = sanitizeHtml(post.grade_category);
        switch(sntzedGrade) {
            case '실버(가장 낮은 등급)':
                sntzedGrade = 'S';
            case '골드(중간 등급)':
                sntzedGrade = 'G';
            case '다이아몬드(가장 높은 등급)':
                sntzedGrade = 'D';
        }

        var l_i = post.id;

        db.query('UPDATE person SET password = ?, name = ?, address = ?, tel = ?, birth = ?, class = ?, grade = ? where loginid = ?', 
            [sntzedPassword, sntzedName, sntzedAddress, sntzedTel, sntzedBirth, sntzedClass, sntzedGrade, l_i], (error, result) => {
                if(error){
                    throw error;
                }

                res.redirect('/person/view');
                res.end();
            }
        );
    },

    delete_process: (req, res) => {
        var id = req.params.loginId

        db.query('DELETE FROM person where loginid = ?', 
                [id], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/person/view');
                    res.end();
                }
        );
    },
}