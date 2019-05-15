var express = require('express');
var router = express.Router();
var mysql = require("mysql");

var connection = mysql.createConnection({
  connectionLimit: 100,
  host : 'dbdbdb.cibpms4ouvxz.us-east-2.rds.amazonaws.com',
  port : 3306,
  user: 'root',
  password: 'qwer1234',
  database: 'class',
  multipleStatements: true,
});


var obj = {};
var userID = -1;


/* GET management page. */
router.get('/', function(req, res, next) {
  userID = req.session.userID;
  if(!userID) res.redirect('user/login');
  res.render('management');
});


/*관리->계정관리*/

router.get('/myinfo', function(req, res, next) {
  sql = "SELECT * FROM User WHERE " + "'" + userID + "' = user_index";
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
router.get('/myinfo/set_writer', function(req, res, next) {
  res.render('management/myinfo/set_writer');
});

router.post('/myinfo/set_writer', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET NickName = '"+ body.name +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});


/*관리->계정관리->서재명 수정*/
router.get('/myinfo/set_shelf', function(req, res, next) {
  res.render('management/myinfo/set_shelf');
});

router.post('/myinfo/set_shelf', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET libraryName = '"+ body.name +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->서재설명 수정*/
router.get('/myinfo/set_description', function(req, res, next) {
  res.render('management/myinfo/set_description');
});

router.post('/myinfo/set_description', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET libraryDescription = '"+ body.description +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->핸드폰 번호 수정*/
router.get('/myinfo/set_phone', function(req, res, next) {
  res.render('management/myinfo/set_phone');
});

router.post('/myinfo/set_phone', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET PhoneNumber = '"+ body.phone +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->이메일 수정*/
router.get('/myinfo/set_email', function(req, res, next) {
  res.render('management/myinfo/set_email');
});

router.post('/myinfo/set_email', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET email = '"+ body.email +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});


/*관리->구독관리*/
router.get('/subscribe', function(req, res, next) {
  res.render('management/subscribe');
});
// SELECT COUNT (*) as count FROM Buy;
/*관리->구독관리->구독내역 조회*/
router.get('/subscribe/history', function(req, res, next) {
  console.log(userID)
  sql = "SELECT * FROM Buy WHERE user_index = " + String(userID) + ";SELECT COUNT (*) as count FROM Buy WHERE user_index = " + String(userID) +";" ;
  connection.query(sql,function(err, result, fields){
    if(!result){
      res.render('alert', {message : 'no history'}); 
    }
  obj = 
  {print: result};
  console.log(result);
  res.render('management/subscribe/history', obj);               
  });
});


// /*관리->구독관리->구독취소*/
// router.get('/management/subscribe/autopay', function(req, res, next) {
//   var sql = "SELECT MAX (Index) FROM Buy;";
//   connection.query(sql, function(err, result, fields){
//     if (err) throw err;
//     console.log(result);
//     if(!result){
//       res.render('alert', {message : 'no history'}); 
//     }
//     else{   
//     obj = {print: result};
//     res.render('management/subscribe/autopay', obj);               


//     }

//   });
// });










module.exports = router;
