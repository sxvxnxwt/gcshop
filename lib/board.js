var db = require('./db');
var util = require('../util/util');
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
    typeview: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2,(error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'boardtype.ejs',
                cls: cls,
                boardtypes: results[0],
                cod: results[1]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },

    typecreate: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2, (error,results)=>{
            var context = { 
                who : name,
                login: login,
                body : 'boardtypeCU.ejs',
                cls: cls,
                create: true,
                boardtypes: results[0],
                cod: results[1]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },

    typecreate_process: (req, res) => {
        var post = req.body;
        var sntzedTitle = escapeParser(sanitizeHtml(post.title));
        var sntzedDescription = escapeParser(sanitizeHtml(post.description));
        var sntzedWriteYN = sanitizeHtml(post.write_YN);
        var sntzedReYN = sanitizeHtml(post.re_YN);
        var sntzedNumPerPage = parseInt(sanitizeHtml(post.numPerPage));

        db.query('INSERT INTO boardtype (title, description, write_YN, re_YN, numPerPage) VALUES(?, ?, ?, ?, ?)', 
                [sntzedTitle, sntzedDescription, sntzedWriteYN, sntzedReYN, sntzedNumPerPage], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/board/type/view');
                    res.end();
                }
        );
    },

    typeupdate: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var t_i = parseInt(req.params.typeId)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1 + sql2, (error,results)=>{
            db.query(`select * from boardtype where type_id = ?`, [t_i], (error, result) => {
                var context = { 
                    who : name,
                    login: login,
                    body : 'boardtypeCU.ejs',
                    cls: cls,
                    create: false,
                    boardtypes: results[0],
                    boardtype: result,
                    cod: results[1]
                };
                res.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                });
            })
        });
    },

    typeupdate_process: (req, res) => {
        var post = req.body;

        var sntzedTitle = escapeParser(sanitizeHtml(post.title));
        var sntzedDescription = escapeParser(sanitizeHtml(post.description));
        var sntzedWriteYN = sanitizeHtml(post.write_YN);
        var sntzedReYN = sanitizeHtml(post.re_YN);
        var sntzedNumPerPage = parseInt(sanitizeHtml(post.numPerPage));

        var t_i = parseInt(post.type_id);

        db.query('UPDATE boardtype SET title = ?, description = ?, write_YN = ?, re_YN = ?, numPerPage = ? where type_id = ?', 
            [sntzedTitle, sntzedDescription, sntzedWriteYN, sntzedReYN, sntzedNumPerPage, t_i], (error, result) => {
                if(error){
                    throw error;
                }

                res.redirect('/board/type/view');
                res.end();
            }
        );
    },

    typedelete_process: (req, res) => {
        var id = parseInt(req.params.typeId)

        db.query('DELETE FROM boardtype where type_id = ?', 
                [id], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect('/board/type/view');
                    res.end();
                }
        );
    },

    view: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var sntzedTypeId = parseInt(sanitizeHtml(req.params.typeId));
        var pNum = parseInt(req.params.pNum);

        var sql1 = `select * from boardtype;` //results[0]
        var sql2 = `select * from boardtype where type_id = ${sntzedTypeId};` //results[1]
        var sql3 = `select count(*) as total from board where type_id = ${sntzedTypeId};` //results[2]
        var sql4 = `select * from code;`
        
        db.query(sql1 + sql2 + sql3 + sql4, (error, results) => {
            /*페이지 기능 구현 */
            var numPerPage = parseInt(results[1][0].numPerPage);
            var offs = (pNum-1)*numPerPage;
            var totalPages = Math.ceil(results[2][0].total / numPerPage);
            db.query(`select b.board_id as board_id, b.title as title, b.date as date, p.name as name 
                from board b inner join person p on b.loginid = p.loginid
                where b.type_id = ? ORDER BY date desc, board_id desc LIMIT ? OFFSET ?`,
                [sntzedTypeId, numPerPage, offs], (err,boards) => {
                    var context = { 
                        who : name,
                        login: login,
                        body : 'board.ejs',
                        cls: cls,
                        boardtypes: results[0],
                        boardtype: results[1],
                        boards: boards,
                        pNum: pNum,
                        totalPages: totalPages,
                        cod: results[3]
                    };
                    res.render('mainFrame',context,(err,html)=>{
                        res.end(html)
                    });
                });
        });
    
    },

    create: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var sntzedTypeId = parseInt(sanitizeHtml(req.params.typeId));

        var sql1 = `select * from boardtype;` //results[0]
        var sql2 = `select * from boardtype where type_id = ${sntzedTypeId};` //results[1]
        var sql3 = `select * from person where name = '${name}';` //results[2]
        var sql4 = `select * from code;`

        db.query(sql1 + sql2 + sql3 + sql4, (error,results)=>{
            
            var context = { 
                who : name,
                login: login,
                body : 'boardCRU.ejs',
                cls: cls,
                CRU: 'C',
                pNum: 1,
                boardtypes: results[0],
                boardtype: results[1],
                writer: results[2],
                cod: results[3]
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            }); //render end
        });
    },

    create_process: (req, res) => {
        var post = req.body;
        var sntzedTitle = escapeParser(sanitizeHtml(post.title));
        var sntzedContent = escapeParser(sanitizeHtml(post.content));
        var sntzedPassword = escapeParser(sanitizeHtml(post.password));

        var type_id = parseInt(post.type_id);
        var loginid = post.loginid;

        var date = util.dateOfEightDigit();

        db.query('INSERT INTO board (type_id, p_id, loginid, password, title, content, date) VALUES(?, ?, ?, ?, ?, ?, ?)', 
                [type_id, 0, loginid, sntzedPassword, sntzedTitle, sntzedContent, date], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect(`/board/view/${type_id}/1`);
                    res.end();
                }
        );
    },

    detail: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var sntzedBoardId = parseInt(sanitizeHtml(req.params.boardId));
        var pNum = parseInt(req.params.pNum);

        var sql1 = `select * from boardtype;` //results[0]
        var sql2 = `select * from board where board_id = ${sntzedBoardId};` //results[1] - 게시글 정보
        var sql3 = `select * from person where name = '${name}';` //results[2] - 접속자 정보
        var sql4 = `select * from code;`
        
        db.query(sql1 + sql2 + sql3 + sql4, (error,results)=>{
            var typeId = results[1][0].type_id;
            var sql4 = `select * from boardtype where type_id = ${typeId};` //result[0] - boardtype 정보
            if(!results[2] || results[2].length === 0) {
                results[2] = [{
                    name: 'Guest',
                    loginid: null
                }];
            }
            var l_i = results[1][0].loginid;
            var sql5 = `select * from person where loginid = '${l_i}';` //result[1] - 작성자 정보
            db.query(sql4 + sql5, (error, result) => {
                //console.log('writer name: ' + result[1][0].name);
                var context = { 
                    who : name,
                    login: login,
                    body : 'boardCRU.ejs',
                    cls: cls,
                    CRU: 'R',
                    pNum: pNum,
                    boardtypes: results[0],
                    boardtype: result[0],
                    writer: result[1],
                    board: results[1],
                    person: results[2],
                    cod: results[3]
                };
                res.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                }); //render end
            })
        });
    },

    update: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var sntzedBoardId = parseInt(sanitizeHtml(req.params.boardId));
        var sntzedTypeId = parseInt(sanitizeHtml(req.params.typeId));
        var pNum = parseInt(req.params.pNum);

        var sql1 = `select * from boardtype;` //results[0]
        var sql2 = `select * from board where board_id = ${sntzedBoardId};` //results[1] - 게시글 정보
        var sql3 = `select * from person where name = '${name}';` //results[2] - 접속자 정보
        var sql4 = `select * from boardtype where type_id = ${sntzedTypeId};` //results[3] - boardtype 정보
        var sql5 = `select * from code;`

        db.query(sql1 + sql2 + sql3 + sql4 + sql5, (error, results) => {
            var l_i = results[1][0].loginid;
            var sql5 = `select * from person where loginid = '${l_i}';` //result[0] - 작성자 정보

            db.query(sql5, (error, result) => {
                var context = {
                    who : name,
                        login: login,
                        body : 'boardCRU.ejs',
                        cls: cls,
                        CRU: 'U',
                        pNum: pNum,
                        boardtypes: results[0],
                        boardtype: results[3],
                        board: results[1],
                        person: results[2],
                        writer: result,
                        cod: results[4]
                };
    
                res.render('mainFrame', context,(err, html) => {
                    res.end(html);
                });
            });
        });
        
    },

    update_process: (req, res) => {
        var post = req.body;

        var sntzedTitle = escapeParser(sanitizeHtml(post.title));
        var sntzedName = sanitizeHtml(post.name);
        var sntzedContent = escapeParser(sanitizeHtml(post.content));
        var sntzedPassword = escapeParser(sanitizeHtml(post.password));

        var type_id = parseInt(post.type_id);
        var board_id = parseInt(post.board_id);
        var pNum = parseInt(post.pNum);
        var exist_password = post.exist_password;

        if(exist_password === sntzedPassword) { //비밀번호 일치할 경우
            db.query('UPDATE board SET title = ?, content = ? where board_id = ?', 
                [sntzedTitle, sntzedContent, board_id], (error, result) => {
                    if(error){
                        throw error;
                    }
                    res.redirect(`/board/view/${type_id}/1`);
                    res.end();
                }
            );
        } else { //비밀번호 불일치 경우
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end(`<script language=JavaScript type="text/javascript">alert("비밀번호가 일치하지 않습니다.")
                <!--
                setTimeout("location.href='http://localhost:3000/board/update/${board_id}/${type_id}/${pNum}'",
                1000)
                //-->
                </script>`)
        }
    },

    delete_process: (req, res) => {
        var board_id = parseInt(req.params.boardId);
        var type_id = parseInt(req.params.typeId);
        var pNum = parseInt(req.params.pNum);

        db.query('DELETE FROM board where type_id = ? and board_id = ?', 
                [type_id, board_id], (error, result) => {
                    if(error){
                        throw error;
                    }

                    res.redirect(`/board/view/${type_id}/1`);
                    res.end();
                }
        );
    },
}