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

module.exports = {
    home: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select * from INFORMATION_SCHEMA.TABLES where table_schema='webdb2024';`

        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context ={
                who: name,
                login: login,
                cls: cls,
                body: 'tableManage.ejs',
                cod: results[0],
                boardtypes: results[1],
                table: results[2]
            };
            res.render('mainFrame', context, (err,html) => {
                res.end(html)
            });
        }); 
    },

    view_table: (req, res) => {
        var {login, name, cls} = authIsOwner(req,res)
        var table_name = req.params.tableName

        var sql1 = `select * from code;`
        var sql2 = `select * from boardtype;`
        var sql3 = `select * from information_schema.columns where table_schema='webdb2024' and table_name='${table_name}';`
        var sql4 = `select count(*) as count from information_schema.columns where table_name='${table_name}';`
        var sql5 = `select * from ${table_name};`

        db.query(sql1 + sql2 + sql3 + sql4 + sql5, (error, results) => {
            var context ={
                who: name,
                login: login,
                cls: cls,
                body: 'tableView.ejs',
                cod: results[0],
                boardtypes: results[1],
                table_name: table_name,
                table_col: results[2],
                count_col: results[3],
                table: results[4]
            };

            res.render('mainFrame', context, (err,html) => {
                if(err) {
                    console.log(err);
                }
                res.end(html)
            });
        });
    },

}