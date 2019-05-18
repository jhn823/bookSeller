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

/*관리->계정관리->이름 수정*/
router.get('/myinfo/set_name', function(req, res, next) {
  res.render('management/myinfo/set_name');
});

router.post('/myinfo/set_name', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET name = '"+ body.name +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
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

/*관리->계정관리->비밀번호 수정*/
router.get('/myinfo/set_pw', function(req, res, next) {
  res.render('management/myinfo/set_pw');
});

router.post('/myinfo/set_pw', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET password = '"+ body.password +"' WHERE user_index = " + String(userID) ;
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
  sql = "SELECT date_format(from_date, '%Y-%m-%d') AS fromDate, date_format(to_date, '%Y-%m-%d') AS toDate, amount\
  FROM Buy WHERE user_index = " + userID + ";";
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

router.get('/hanna', function(req, res, next) {
  res.render('management/hanna');
});

/*관리->구독관리->구독취소*/
router.get('/subscribe/autopay', function(req, res, next) {
  console.log(req);
  sql = 
  "SELECT date_format(to_date, '%Y-%m-%d') AS date FROM Buy WHERE user_index = "+userID+" ORDER BY to_date DESC LIMIT 1;"
  + "SELECT auto FROM User WHERE user_index="+userID+";";
  connection.query(sql,function(err, result, fields){
    if (err) throw err;
    else{
      obj = {
        date : result[0],
        auto : result[1]
      };
      console.log(obj);
      res.render('management/subscribe/autopay', obj);  
    }
  });
});

router.post('/subscribe/autopay', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET auto = '"+ body.autopay +"' WHERE user_index = " + userID ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/subscribe/autopay");
});


module.exports = router;
