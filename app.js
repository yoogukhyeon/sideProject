const express = require('express');
const app = express();
const methodOverride = require('method-override');
const path = require('path')
const router = require('./routes/index')
const login = require('./routes/login');
const models = require("./models/index.js");
const session = require('express-session')
const bodyParser = require('body-parser');
models.sequelize.sync().then( () => {
    console.log(" DB 연결 성공");
}).catch(err => {
    console.log("연결 실패");
    console.log(err);
})

app.use(session({
    key: 'sid',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24000 * 60 * 60 // 쿠키 유효기간 24시간
    }
  }));
  
app.use(express.static(path.join(`${__dirname}/public`)))
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended : true}))
app.set('views' , 'views');
app.set('view engine' , 'ejs');


app.use('/' , login)
app.use('/board' , router)

const port = process.env.PORT || 5000
app.listen(port , () => {
    console.log(`${port}포트 포트로 이동중.....`)
})