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
    view : (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2,(error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'code.ejs',
                cls: cls,
                boardtypes: results[0],
                codes: results[1],
                cod: results[1]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },

    create : (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2, (error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'codeCU.ejs',
                cls: cls,
                create: true,
                p_url: '"/code/create_process"',
                m_i: '',
                m_n: '',
                s_i: '',
                s_n: '',
                s: '',
                e: '',
                boardtypes: results[0],
                cod: results[1]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },
    
    create_process : (req, res) => {
        var post = req.body;
        var sntzedMainId = sanitizeHtml(post.main_id);
        var sntzedMainName = escapeParser(sanitizeHtml(post.main_name));
        var sntzedSubId = sanitizeHtml(post.sub_id);
        var sntzedSubName = escapeParser(sanitizeHtml(post.sub_name));
        var sntzedStart = sanitizeHtml(post.start);
        var sntzedEnd = sanitizeHtml(post.end);

        db.query('INSERT INTO code (main_id, main_name, sub_id, sub_name, start, end) VALUES(?, ?, ?, ?, ?, ?)', 
                [sntzedMainId, sntzedMainName, sntzedSubId, sntzedSubName, sntzedStart, sntzedEnd], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/code/view');
                    res.end();
                }
        );
    },
    
    update : (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var main = req.params.main
        var sub = req.params.sub
        var start = req.params.start

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2, (error,results)=>{
            db.query(`select * from code where main_id = ? and sub_id = ? and start = ?`, [main, sub, start], (error, result) => {
                var context = { 
                    who : name,
                    login: login,
                    body : 'codeCU.ejs',
                    cls: cls,
                    create: false,
                    p_url: '/code/update_process',
                    m_i: main,
                    m_n: result[0].main_name,
                    s_i: sub,
                    s_n: result[0].sub_name,
                    s: start,
                    e: result[0].end,
                    boardtypes: results[0],
                    cod: results[1]
                };
                res.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                });
            })
        });
    },
    
    update_process : (req, res) => {
        var post = req.body;
        var sntzedMainName = escapeParser(sanitizeHtml(post.main_name));
        var sntzedSubName = escapeParser(sanitizeHtml(post.sub_name));
        var sntzedStart = sanitizeHtml(post.start_date);
        var sntzedEnd = sanitizeHtml(post.end);
        var main_id = sanitizeHtml(post.main);
        var sub_id = sanitizeHtml(post.sub);

        db.query('UPDATE code SET main_name = ?, sub_name = ?, end = ? where main_id = ? and sub_id = ? and start = ?', 
                [sntzedMainName, sntzedSubName, sntzedEnd, main_id, sub_id, sntzedStart], (error, result) => {
                    if(error){
                        console.log(error);
                    }

                    res.redirect('/code/view');
                    res.end();
                }
        );
    },
    
    delete_process : (req, res) => {
        var main = req.params.main
        var sub = req.params.sub
        var start = req.params.start

        db.query('DELETE FROM code where main_id = ? and sub_id = ? and start = ?', 
                [main, sub, start], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/code/view');
                    res.end();
                }
        );
    }
}