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

var userID ;
var bookID ;

/* book page */
router.get('/', function(req, res, next) {
  bookID = req.param("bid");
  console.log(bookID);
  console.log(userID);
  sql = 
  //book 정보
  "SELECT * FROM Book WHERE book_id='" + bookID + "';"+
  //이 책이 담긴 서재
  "SELECT COUNT(book_read_id) AS cnt FROM Book_Read WHERE book_id='" + bookID + "';"+
  //모든 태그
  "SELECT * FROM Book_Tag WHERE book_id = "+String(bookID)+" AND is_deleted = 0;"+
  //관심 태그
  "SELECT Book_Tag.* FROM Book_Tag \
  LEFT JOIN Love \
  ON Book_Tag.book_tag_id=Love.book_tag_id AND Book_Tag.book_id=Love.book_id\
  WHERE (Love.type='tag' AND Love.user_index="+String(userID)+" AND love_status=1);"+
  //내가 작성한 태그
  "SELECT * FROM Book_Tag WHERE book_id = "+String(bookID)+" AND user_index="+String(userID)+" AND is_deleted = 0;";
  //이 저자-역자의 다른 도서

  connection.query(sql, function(err, query, fields){
    console.log("query------");
    console.log(query[4]);
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    } 
      obj = 
      { book: query[0],
        read_count: query[1],
        tag: query[2],
        love_tags: query[3],
        my_tags: query[4],
        userID : String(userID)
      };
      res.render('book', obj);  
  });  

});
router.post('/', function(req, res, next) {
  var love = req.body.love;
  var new_tag = req.body.new_tag;
  var tag_ID = req.body.tagID;
  var del_tagID = req.body.delTag;
  var query;
  console.log("love_tagID----");
  console.log(tag_ID);
  console.log("From del Tag----");
  console.log(del_tagID);
  console.log("From newTag----");
  console.log(new_tag);
  console.log("=======love_book========");
  console.log(love==='1');
  console.log(love);
  //책 좋아요
  if(love==='1'){
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
  }
  if(!(new_tag==='') && new_tag != null){
    query = "INSERT INTO Book_Tag (content,book_id,user_index ) VALUES ('"+new_tag+"',"+bookID+","+userID+");";
    connection.query(query, function (err, result) {
      if(err){
        console.log("new_tag 쿼리문에 오류가 있습니다.");
        console.log(err);
      }
      else{
      res.redirect("/book");
      }
    });
  }
  if(tag_ID > 0 && new_tag===''){
    connection.query("SELECT * FROM Love WHERE type='tag' AND book_id=" + String(bookID) + " AND book_tag_id="+String(tag_ID)+" AND user_index=" + String(userID),
    function(err, result, fields){
      if(err){
        console.log("tag 좋아요 쿼리문에 오류가 있습니다.");
        console.log(err);
      }
      else if( result.length > 0 && result ){
        if( result[0].love_status == 1){ // 좋아요 취소
          console.log("태그 좋아요 취소 toggle");
          sql = "UPDATE Love SET love_status = 0 WHERE (user_index = "+String(userID)+" AND book_id = "+String(bookID)+" AND book_tag_id="+String(tag_ID)+");";
        }
        else{ // 좋아요  
        console.log("좋아요 toggle");
        sql = "UPDATE Love SET love_status = 1 WHERE (user_index = "+String(userID)+" AND book_id = "+String(bookID)+" AND book_tag_id="+String(tag_ID)+");";
        }
      connection.query(sql,
      function(err, result, fields){
        console.log("태그 toggle");
        console.log(err, result);
        res.redirect("/book");
      }) 
      }
      else{
        sql = "INSERT INTO Love (`type`, `user_index`, `book_id`, `book_tag_id`) VALUES ('tag', "+String(userID)+", "+String(bookID)+", "+String(tag_ID)+");";
        connection.query(sql,
        function(err, result, fields){
          console.log("tag 좋아요 생성");
          console.log(err,result);
          res.redirect("/book");
        })
      }
      
    });
  }
  if(del_tagID > 0){
    query = "UPDATE Book_Tag SET is_deleted=1 WHERE (book_tag_id="+String(del_tagID)+" AND user_index="+String(userID)+");"+
    "UPDATE Love SET love_status = 0 WHERE (book_tag_id="+String(del_tagID)+" AND user_index="+String(userID)+");";
    connection.query(query, function (err, result) {
      console.log(err);
      console.log(query);
      console.log(result);
      if (err) {
        console.log("del_tagID 쿼리에 문제가 있습니다.");
        console.log(err);
      }
      res.redirect("/book");
    });
  }
});


module.exports = router;