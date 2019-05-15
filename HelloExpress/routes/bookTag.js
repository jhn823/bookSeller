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

var userID = -1

router.post('/', function(req, res, next) {
  var new_tag = req.body.new_tag;
  var tagID = req.body.tagId;
  var del_tagID = req.body.delTag;
  var query;
  console.log("From del Tag----");
  console.log(del_tagID);
  console.log(new_tag);
  if(del_tagID > 0){
    query = "UPDATE Book_Tag SET is_deleted=1 WHERE (book_tag_id="+String(del_tagID)+" AND user_index="+String(userID)+");"+
    "UPDATE Love SET love_status = 0 WHERE (book_tag_id="+String(del_tagID)+" AND user_index="+String(userID)+");";
    connection.query(query, function (err, result) {
      console.log(err);
      console.log(query);
      console.log(result);
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
    });
    res.redirect("/book");
  }
  var sql;
  sql =  "SELECT COUNT love_id  FROM Love WHERE type = ‘tag’ AND user_index="+String(userID)+" AND book_id="+String(bookID)+";";
  connection.query(sql,function(err, result, fields){
    if (err) throw err;

    else if(result.length > 2 && result ){
      res.render('alert', {message : '태그는 직접 등록을 포함하여 최대 3개까지 선택할 수 있습니다.'}); 
    }
    else{
      connection.query("INSERT INTO User (email, Password, Name, Sns) VALUES (?, ?, ?, ?)", [
        body.email, body.password, body.name, body.sns
      ]);
      connection.query("SELECT user_index FROM User WHERE " + "'" + body.email + "' = email",
      function(err, result, fields){
        if (err) throw err;
        else{
          userID = result[0].user_index;
          var libraryName = "유명한 여행가의 서재_" + String(userID);
          var nickName = "유명한 여행가_"+ String(userID);
          sql = "UPDATE User SET libraryName = '" + libraryName+"', NickName = '"+ nickName +"' WHERE user_index = " + String(userID) ;
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


module.exports = router;
