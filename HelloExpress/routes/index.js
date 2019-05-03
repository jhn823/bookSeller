var express = require('express');
var router = express.Router();
var mysql = require("mysql");

var connection = mysql.createConnection({
  user: "root",
  password: "sodlfma53",
  database: "class"
});

var obj = {};
var userID = 1;

/* GET home page. */
router.get('/', function(req, res, next) {
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
/*Get create page*/
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

/*Add to db*/

router.get('/addUser', function(req, res, next) {
  res.render('addUser');
});


router.post('/addUser', function(req, res, next) {
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



module.exports = router;
