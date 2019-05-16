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


/* GET shelf page. */
router.get('/', function(req, res, next) {
  if(!req.session.userID) res.redirect('user/login');
  else{
    console.log("session" + req.session.userID);
    console.log("shelf");
    userID = req.session.userID;

    sql = 
    //[0]user info
      "SELECT * FROM User WHERE " + "'" + userID + "' = user_index;" + 
      //[1] follower count
     " SELECT COUNT (user_index) as count FROM Subscribe WHERE " + "'" + userID + "' = user_index;"+ 
     //[2]following count
     " SELECT COUNT (follower_id) as count FROM Subscribe WHERE " + "'" + userID + "' = follower_id;"+
      "SELECT * FROM Post WHERE" + "'" + userID + "' = user_index;"+
      "SELECT  Post.post_id, Post.title, User.nickName, User.user_index FROM Subscribe INNER JOIN User ON Subscribe.user_index = User.user_index INNER JOIN Post ON Subscribe.user_index = Post.user_index WHERE Subscribe.follower_id = "+"'" +  userID+"';"+
      //좋아요 수
      "SELECT COUNT (love_id) as count FROM Love WHERE type='book' AND '" + userID + "' = user_index AND  love_status = 1;"+
      //[6]읽은 책 수
      "SELECT COUNT (book_read_id) as count FROM Book_Read WHERE return_date is not NULL AND '" + userID + "' = user_index;"+
      //[7]인용문 수
      "SELECT COUNT (quotation_id) as count FROM Quotation WHERE '" + userID + "' = user_index;"+
      //[8]내가 좋아한 책
      //"SELECT * FROM Book INNER JOIN Love ON Love.book_id = Book.book_id WHERE '" + userID + "' = user_index AND  '" + 1 + "' = love_status;"
      //[8]대여중인 도서
      "SELECT * FROM Book_Read INNER JOIN Book ON Book_Read.book_id = Book.book_id  WHERE return_date is NULL AND '" + userID + "' = user_index;"+
      //[9]카테고리 수
      "SELECT DISTINCT bookshelf_title FROM Bookshelf WHERE '" + userID + "' = user_index;"+
      //[10]카테고리 별 도서
      "SELECT * FROM Bookshelf INNER JOIN Book ON Bookshelf.book_id = Book.book_id WHERE '" + userID + "' = user_index;";

   


    console.log("shelf sql : " +sql);
    connection.query(sql,function(err, result, fields){
      if (err) throw err;
      else{
        console.log(result);
          obj = 
        { user: result[0],
          follower: result[1],
          following: result[2],
          myposts : result[3],
          followingPosts : result[4],
          love : result[5],
          read: result[6],
          quotation: result[7],
          borrowings : result[8],
          category : result[9],
          categorized : result[10]

        };
        res.render('shelf',obj);
      }
    })
  }
  

   
});


/* GET shelf/post page. */
router.get('/post', function(req, res, next) {

    userID = req.session.userID;
    var pid =  req.param("pid");
    var uid =  req.param("uid");
    sql = 
    "SELECT * FROM User WHERE " + "'" + uid+ "' = user_index;" + 
    "SELECT * FROM Post WHERE '" + pid + "' = post_id;";
          connection.query(sql, function(err, result, fields){
      if (err) throw err;
      else {
        console.log(result);
        obj = {
            writer : result[0],
            post : result[1]}
        res.render('shelf/post',obj);
      }
    });

});

/* GET shelf/post/delete page. */
router.get('/post/delete', function(req, res, next) {

  userID = req.session.userID;
  var pid =  req.param("pid");
  var uid =  req.param("uid");
  sql = "DELETE FROM Post WHERE '" + pid + "' = post_id;"
  connection.query(sql, function(err, result, fields){
    if (err) throw err;
    else {
      res.redirect('/shelf');
    }
  });

});

/* GET shelf/post/delete page. */
router.get('/post/setpost', function(req, res, next) {
  userID = req.session.userID;
  var pid =  req.param("pid");

  if(pid==-1){
    obj = {info : [{pid : -1}]}
    res.render('shelf/setpost', obj);
  }else{
    sql = "SELECT *  FROM Post WHERE '" + pid + "' = post_id;"
    connection.query(sql, function(err, result, fields){
      if (err) throw err;
      else {
        obj = {
          info : result}
          res.render('shelf/setpost', obj);
      }
    });

  }

 

});

router.post('/post/setpost', function(req, res, next) {
  var body = req.body;

  userID = req.session.userID;
  var pid =  req.param("pid");
  res.render('shelf/setpost');
  if(pid==-1){
    connection.query("INSERT INTO Post (user_index, title,contents) VALUES (?,?,?)", [
      userID, body.title, body.contents
    ]);
  }else{
    sql = "UPDATE Post SET title = '" + body.title+"', contents = '"+ body.contents +"' WHERE '" + pid + "' = post_id;"
    connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
    });
  }

  res.redirect('/shelf');


});



module.exports = router;
