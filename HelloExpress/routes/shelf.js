var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var wait=require('wait.for');

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



    console.log(sql);
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

        };
        console.log(result[3]); 
        res.render('shelf',obj);
      }
    })
  }
  

   
});



module.exports = router;
