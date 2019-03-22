var express = require('express');
var router = express.Router();
var mysql = require("mysql");

var connection = mysql.createConnection({
  user: "root",
  password: "sodlfma53",
  database: "class"
});


/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index',{title : 'hello'})
 
  connection.query("SELECT * FROM book;", function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    }
    else{
      res.json(result);
    }
  });

});

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
