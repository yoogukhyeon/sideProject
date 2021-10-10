var express = require('express');
const models = require('../models');
const moment = require('moment');
var db = require('../models/index');
const Sequelize = require('sequelize'),
    Op = require('sequelize').Op;
const user = require('../models/user');
var router = express.Router();
//password 암호화 
const crypto = require('crypto');
const { title } = require('process');

// jwt 인증 구현 
let jwt = require("jsonwebtoken");
let secretObj = require("../config/jwt");


router.get('/main' , (req , res) => {
    res.send('환영합니다.!')
})


//login
router.get('/' , (req , res) => {
    let session = req.session

    res.render('login' , {
        title : "Login Page",
        session : session,
        error : "n"

    })
})

// 로그인 POST
router.post("/login", async (req , res) => {
  let body = req.body;
  let session = req.session

  let result = await models.user.findOne({
      where: {
          name : body.userName,
          email : body.userEmail
      }
  });

  console.log('result ::::::::::' , result)
  if(result == null){
    res.render('login' , {
      session : session,
      error : "y",
      title : "Login Page"
    })
    return false
  }

  let dbPassword = result.dataValues.password;
  let inputPassword = body.password;
  let salt = result.dataValues.salt;
  let hashPassword = crypto.createHash("sha512").update(inputPassword + salt).digest("hex");

  if(dbPassword === hashPassword){
      console.log("비밀번호 일치");
      req.session.email = body.userEmail

      let token = jwt.sign({
        email: body.userEmail  // 토큰의 내용(payload)
      },
      secretObj.secret ,    // 비밀 키
      {
        expiresIn: '1m'    // 유효 시간은 5분
      })
  }
  else{
      console.log("비밀번호 불일치");
      // res.status(400).send({
      //   message : "Wrong Password!"
      // });
      res.render('login' , {
        session : session,
        error : "y",
        title : "Login Page",
        auth: true,
        accessToken: token
      })
  }
  
  res.redirect("/");
});

// 로그아웃
router.get("/logout", (req,res) => {
  req.session.destroy();
  res.clearCookie('sid');

  res.redirect("/")
})


















router.get('/signup' , (req , res) => {
    res.render('signup')
})

//회원가입 데이터 보내기 
router.post('/signup' , async (req , res) => {
  let body = req.body;
  try{
    if(!body.userName){
      res.status(400).send({
        message : "Content can not be empty!"
      });
      return
    }
  
    let exUser = await models.user.findOne({
      where : {
        name : body.userName
      }
    })
  
    if(exUser){
      res.status(500).send({
        message : "중복된 ID!"
      })
      return
    }

    let inputPassword = body.password;
    let salt = Math.round((new Date().valueOf * Math.random())) + "";
    let hashedPassword = await crypto.createHash("sha512").update(inputPassword + salt).digest('hex');

    const result = await models.user.create({
      name: body.userName,
      email: body.userEmail,
      password: hashedPassword,
      salt : salt

    })

    if(result) console.log('데이터 추가 완료')
    res.redirect("/");
  }catch(err){
    console.error('err :' , err)
  }
})













//회원가입 데이터 보내기 
// router.post('/signup' , async (req , res) => {
//     let body = req.body;

//     try{
//      const result = await models.user.create({
//         name: body.userName,
//         email: body.userEmail,
//         password: body.password
//       })

//       if(result) console.log('데이터 추가 완료')
//       res.redirect("/");
//     }catch(err){
//       console.error('err :' , err)
//     }
// })





module.exports = router;