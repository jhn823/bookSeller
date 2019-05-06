var express = require('express');
var router = express.Router();
var mysql = require("mysql");

var connection = mysql.createConnection({
  user: "root",
  password: "sodlfma53",
  database: "class"
});

var obj = {};
var userID = -1;

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
  var sql;
  sql =  "SELECT COUNT (User_index) as count FROM User WHERE Email = '" + body.email + "'";
  connection.query(sql,function(err, result, fields){
    if (err) throw err;
    
  
    else if(result && result[0].count ==1){
      res.render('alert', {message : 'same email'}); 
    }
    else{
      connection.query("INSERT INTO User (Email, Password, Name, Sns) VALUES (?, ?, ?, ?)", [
        body.email, body.password, body.name, body.sns
      ]);
      connection.query("SELECT User_index FROM User WHERE " + "'" + body.email + "' = Email",
      function(err, result, fields){
        if (err) throw err;
        else{
          userID = result[0].User_index;
          var libraryName = "유명한 여행가의 서재_" + String(userID);
          var nickName = "유명한 여행가_"+ String(userID);
          sql = "UPDATE User SET LibraryName = '" + libraryName+"', NickName = '"+ nickName +"' WHERE User_index = " + String(userID) ;
          connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " record(s) updated");
          });
          console.log(userID);
          res.redirect("/");
        }

      });

    };
  });
});



/*관리페이지*/
router.get('/management/list', function(req, res, next) {
  if(userID==-1) res.render('user/login');
  res.render('management/list');
});


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

/*관리->계정관리*/
router.get('/management/myinfo', function(req, res, next) {
  sql = "SELECT * FROM User WHERE " + "'" + userID + "' = User_index";
  connection.query(sql,function(err, result, fields){
    if (err) throw err;
    else{
      var string=JSON.stringify(result);
      var info =  JSON.parse(string);
      obj = {user : info}
      console.log(obj);
      res.render('management/myinfo', obj);  
    }
      
  });
});

/*관리->계정관리->필명 수정*/
router.get('/management/myinfo/set_writer', function(req, res, next) {
  res.render('management/myinfo/set_writer');
});
router.post('/management/myinfo/set_writer', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET NickName = '"+ body.name +"' WHERE User_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});


/*관리->계정관리->서재명 수정*/
router.get('/management/myinfo/set_shelf', function(req, res, next) {
  res.render('management/myinfo/set_shelf');
});
router.post('/management/myinfo/set_shelf', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET NickName = '"+ body.name +"' WHERE User_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->서재설명 수정*/
router.get('/management/myinfo/set_description', function(req, res, next) {
  res.render('management/myinfo/set_description');
});
router.post('/management/myinfo/set_description', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET LibraryDescription = '"+ body.description +"' WHERE User_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->서재 공개설정 수정*/
router.get('/management/myinfo/set_open', function(req, res, next) {
  res.render('management/myinfo/set_open');
});

router.post('/management/myinfo/set_open', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET LibraryVisibility = '"+ body.open +"' WHERE User_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});



module.exports = router;
