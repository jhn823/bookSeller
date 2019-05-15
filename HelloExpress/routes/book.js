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

/* book page */
router.get('/', function(req, res, next) {
  console.log("what?");
  var bookID = 34;
  sql = "SELECT * FROM Book WHERE book_id='" + bookID + "';"+
  "SELECT COUNT(book_read_id) AS cnt FROM Book_Read WHERE book_id='" + bookID + "';"+
  "SELECT * FROM Book_Tag WHERE book_id = "+String(bookID)+" AND is_deleted = 0;";
  connection.query(sql, function(err, query, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    } 
    console.log(query)
      obj = 
      {book: query[0],
        read_count: query[1],
        tag: query[2],
        userID : String(userID)
      };
      res.render('book', obj);  
  });  

});
router.post('/', function(req, res, next) {
  connection.query("SELECT * FROM Love WHERE type='book' AND book_id=" + String(bookID) + " AND user_index=" + String(userID),
  function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    }
    else if( result.length > 0 && result ){
      if( result[0].love_status == 1){ // 좋아요 취소
        console.log("좋아요 취소 toggle");
        sql = "UPDATE Love SET love_status = 0 WHERE (user_index = "+String(userID)+" AND book_id = "+String(bookID)+");UPDATE Book Set like_count=like_count - 1 WHERE book_id = "+String(bookID);
      }
        else{ // 좋아요  
        console.log("좋아요 toggle");
        sql = "UPDATE Love SET love_status = 1 WHERE (user_index = "+String(userID)+" AND book_id = "+String(bookID)+");UPDATE Book Set like_count=like_count + 1 WHERE book_id = "+String(bookID);
      }
        connection.query(sql,
      function(err, result, fields){
        console.log(err, result);
        res.redirect("/book");
      }) 
    }
    else{
      console.log("좋아요 생성");
      sql = "INSERT INTO Love (`type`, `user_index`, `book_id`) VALUES ('book', "+String(userID)+", "+String(bookID)+");UPDATE Book Set like_count = like_count + 1 WHERE book_id = "+String(bookID);
      connection.query(sql,
      function(err, result, fields){
        res.redirect("/book");
      })
      console.log(err, sql);
    }
  });
});


module.exports = router;
