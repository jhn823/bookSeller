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
  userID = req.session.userID;
  bookID = req.param("bid");
  console.log("get------------");
  console.log(userID);
  console.log(bookID);
  sql = 
  //book 정보 -query[0]
  "SELECT * FROM Book WHERE book_id='" + bookID + "';"+
  //이 책이 담긴 서재 -query[1]
  "SELECT COUNT(book_read_id) AS cnt FROM Book_Read WHERE book_id='" + bookID + "';"+
  //모든 태그 -query[2]
  "SELECT * FROM Book_Tag WHERE book_id = "+String(bookID)+" AND is_deleted = 0;"+
  //관심 태그 -query[3]
  "SELECT Book_Tag.*,Love.user_index, Love.love_status FROM Book_Tag \
  LEFT JOIN Love \
  ON Book_Tag.book_tag_id=Love.book_tag_id AND Book_Tag.book_id=Love.book_id\
  WHERE (Love.type='tag' AND Love.book_id="+String(bookID)+" AND Love.user_index="+String(userID)+" AND love_status=1);"+
  //내가 작성한 태그 -query[4]
  "SELECT * FROM Book_Tag WHERE book_id = "+String(bookID)+" AND user_index="+String(userID)+" AND is_deleted = 0;"+
  //이 저자-역자의 다른 도서 -query[5]
  "SELECT a.title, a.writer FROM class.Book AS a \
  LEFT JOIN class.Book AS b ON a.writer=b.writer \
  WHERE b.book_id="+String(bookID)+" AND NOT a.book_id="+String(bookID)+" \
  ORDER BY a.like_count DESC LIMIT 5;"+
  //이 분야의 인기도서 - query[6]
  "SELECT a.title, a.writer FROM class.Book AS a \
  LEFT JOIN class.Book AS b ON a.book_category_id=b.book_category_id \
  WHERE b.book_id="+String(bookID)+" AND NOT a.book_id="+String(bookID)+" \
  ORDER BY a.like_count DESC LIMIT 5;"+
  //이 책이 태그되어있는 포스트 - query[7]
  "SELECT p.title,p.post_id, u.user_index, u.libraryName, u.nickName FROM class.Post AS p \
  LEFT JOIN class.Post_Book AS pb ON p.post_id=pb.post_id \
  LEFT JOIN class.User AS u ON p.user_index=u.user_index \
  WHERE pb.book_id="+String(bookID)+";";
  
  connection.query(sql, function(err, query, fields){
    console.log("query------");
    //console.log(query[7]);
    console.log("-----------")
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
        top_equ_writers: query[5],
        top_equ_cates: query[6],
        related_posts: query[7],
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
  userID = req.session.userID;
  bookID = req.param("bid");
  console.log("post------------");
  console.log(bookID);
  console.log(userID);

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
        sql = "UPDATE Love SET love_status = 0 WHERE (type='book' AND user_index = "+String(userID)+" AND book_id = "+String(bookID)+");UPDATE Book Set like_count=like_count - 1 WHERE book_id = "+String(bookID);
      }
        else{ // 좋아요  
        console.log("좋아요 toggle");
        sql = "UPDATE Love SET love_status = 1 WHERE (type='book' AND user_index = "+String(userID)+" AND book_id = "+String(bookID)+");UPDATE Book Set like_count=like_count + 1 WHERE book_id = "+String(bookID);
      }
        connection.query(sql,
      function(err, result, fields){
        console.log(err, result);
        res.redirect("/book?bid="+String(bookID));
      }) 
    }
    else{
      console.log("좋아요 생성");
      sql = "INSERT INTO Love (`type`, `user_index`, `book_id`) VALUES ('book', "+String(userID)+", "+String(bookID)+");UPDATE Book Set like_count = like_count + 1 WHERE book_id = "+String(bookID);
      connection.query(sql,
      function(err, result, fields){
        res.redirect("/book?bid="+String(bookID));
      })
      console.log(err, sql);
    }
  });
  }
  // new tag create
  if(!(new_tag==='') && new_tag != null){
    sql =  "SELECT COUNT(*) AS count FROM Book_Tag WHERE book_id = "+String(bookID)+" AND user_index="+String(userID)+" AND is_deleted = 0;";
    connection.query(sql, function(err, sql, fields){
      if(err){
        console.log(err);
      } 
      else if(sql[0].count >=3){
        res.render('alert', {message : '태그는 3개까지 작성할 수 있습니다.'}); 
      }
      else{
        query = "INSERT INTO Book_Tag (content,book_id,user_index ) VALUES ('"+new_tag+"',"+bookID+","+userID+");";
        connection.query(query, function (err, result) {
          if(err){
            console.log("new_tag 쿼리문에 오류가 있습니다.");
            console.log(err);
          }
          //res.redirect("/book?bid="+String(bookID));
          res.redirect("/book?bid="+String(bookID));
        }); 
      }

    });
  }
  if(tag_ID > 0 && new_tag===''){
    query= "SELECT COUNT(Book_Tag.book_tag_id) AS count FROM Book_Tag \
    LEFT JOIN Love \
    ON Book_Tag.book_tag_id=Love.book_tag_id AND Book_Tag.book_id=Love.book_id\
    WHERE (Love.type='tag' AND Love.book_id="+String(bookID)+" AND Love.user_index="+String(userID)+" AND love_status=1);";

    connection.query("SELECT * FROM Love WHERE type='tag' AND book_id=" + String(bookID) + " AND book_tag_id="+String(tag_ID)+" AND user_index=" + String(userID),
    function(err, result, fields){
      if(err){
        console.log("tag 좋아요 쿼리문에 오류가 있습니다.");
        console.log(err);
      }
      else if( result.length > 0 && result ){  // 좋아요 tuple이 존재.
        if( result[0].love_status == 1){ // 좋아요 취소로 toggle
          console.log("태그 좋아요 취소 toggle");
          sql = "UPDATE Love SET love_status = 0 WHERE (user_index = "+String(userID)+" AND book_id = "+String(bookID)+" AND book_tag_id="+String(tag_ID)+");";
          connection.query(sql,
            function(err, result, fields){
              console.log("태그 좋아요 취소 connet");
              console.log(err, result);
              res.redirect("/book?bid="+String(bookID));
            })  
        }
        else{ // 좋아요로 toggle 

          connection.query(query, function(err, query, fields){
            if(err){
              console.log(err);
            } 
            else if(query[0].count >=3){
              res.render('alert', {message : '관심 태그는 3개까지 설정할 수 있습니다.'}); 
            }
            else{
              sql = "UPDATE Love SET love_status = 1 WHERE (user_index = "+String(userID)+" AND book_id = "+String(bookID)+" AND book_tag_id="+String(tag_ID)+");"; 
              connection.query(sql,
                function(err, result, fields){
                  console.log("태그 좋아요 connet");
                  console.log(err, result);
                  res.redirect("/book?bid="+String(bookID));
                })   
            }
          });
        }
      }
      else{ //좋아요 tuple이 존재하지 않음 -> 새로운 tuple 생성
        connection.query(query, function(err, query, fields){
          if(err){
            console.log("test쿼리문에 오류가 있습니다.");
            console.log(err);
          } 
          else if(query[0].count >=3){
            res.render('alert', {message : '관심 태그는 3개까지 설정할 수 있습니다.'}); 
          }
          else{
            sql = "INSERT INTO Love (`type`, `user_index`, `book_id`, `book_tag_id`) VALUES ('tag', "+String(userID)+", "+String(bookID)+", "+String(tag_ID)+");";
            connection.query(sql,
            function(err, result, fields){
              console.log(err,result);
              res.redirect("/book?bid="+String(bookID));
            })
          }
        });
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
      res.redirect("/book?bid="+String(bookID));
    });
  }
});


module.exports = router;