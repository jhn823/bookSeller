var express = require('express');
var router = express.Router();
var mysql = require("mysql");

var connection = mysql.createConnection({
  hostname : "172.30.1.23:3306",
  user: "aaa",
  password: "1234",
  database: "class"
});

var obj = {};
var userID = 1;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect("/home");
});
router.get('/home', function(req, res, next) {
  res.render('home');
});

/* login page */
router.get('/user/login', function(req, res, next) {
  res.render('user/login');
});
/*login 확인 과정*/
router.post('/user/login', function(req, res, next) {
  var body = req.body;//email, password
  connection.query("SELECT COUNT (User_index) as count FROM User WHERE ( Email = '" + body.email + "' AND Password = '" + body.password +"' )",
  function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    }
    else if(result && result[0].count ==1){
      connection.query("SELECT *  FROM User WHERE  Email = '" + body.email + "'",
      function(err, result, fields){
        userID = result[0].User_index;
        res.redirect("/home");
      }) 
    }
    else{
      res.render('alert', {message : 'no such user'}); 
    }
  });
});

/* 회원가입 */
router.get('/user/addUser', function(req, res, next) {
  res.render('user/addUser');
});
router.post('/user/addUser', function(req, res, next) {
  var body = req.body;
  connection.query("INSERT INTO User (Name, NickName,LibraryName,Sns) VALUES (?, ?, ?, ?)", [
      body.name, body.nickname, body.libraryname, body.sns
  ]);
  connection.query("SELECT User_index FROM User WHERE " + "'" + body.nickname + "'"+"= NickName",
  function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    }
    else{
      console.log(result[0].User_index);
      userID = result[0].User_index;
      console.log(userID);
      res.redirect("/");
    }
   });
});

// /*관리페이지*/
// router.get('/management/list', function(req, res, next) {
//   res.render('management/list');
// });


router.get('/index', function(req, res, next) {
  connection.query("SELECT * FROM book;", function(err, result, fields){
    
    if(err){
      throw err;
  } else {
    console.log("UID : " + userID);
      obj = 
      {print: result,
       UID : userID};
      res.render('index', obj);                
  }
  });
});

/*Get 책 목록 추가 page*/
router.get('/create', function(req, res, next) {
  res.render('create');
});

router.post('/create', function(req, res, next) {
  var body = req.body;
  console.log(body.name);
  console.log(body.author);
  connection.query("INSERT INTO book (name, author) VALUES (?, ?)", [
      body.name, body.author
    ], function(){
      
    res.redirect("/");
  });
});



module.exports = router;
