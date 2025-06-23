//env
require('dotenv').config();

//express와 views 정의
const express = require('express') ;
const app = express() ;
app.set('views',__dirname + '/views');
app.set('view engine','ejs');

var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var options = {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME
};
var sessionStore = new MySqlStore(options);

app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    store : sessionStore
}));

//사용자 정의 모듈
var rootRouter = require('./router/rootRouter');
var authRouter = require('./router/authRouter');
var codeRouter = require('./router/codeRouter');
var personRouter = require('./router/personRouter');
var productRouter = require('./router/productRouter');
var boardRouter = require('./router/boardRouter');
var purchaseRouter = require('./router/purchaseRouter');
var tableRouter = require('./router/tableRouter');
var analRouter = require('./router/analRouter');

app.use(bodyParser.urlencoded({extended: false }));
app.use(express.static('public'));
app.use('/',rootRouter);
app.use('/auth',authRouter);
app.use('/code',codeRouter);
app.use('/product', productRouter);
app.use('/person', personRouter);
app.use('/board', boardRouter);
app.use('/purchase', purchaseRouter);
app.use('/table', tableRouter);
app.use('/anal', analRouter);

app.get('/favicon.ico', (req,res)=>res.writeHead(404));
app.listen(3000, () => console.log('Example app listening on port 3000'));
