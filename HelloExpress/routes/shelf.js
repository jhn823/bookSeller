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

var userID =-1
var ownerID=2;
var mine =0;


/* GET shelf page. */
router.get('/', function(req, res, next) {
  mine =0 ;
  if(!req.session.userID) res.redirect('user/login');
  else{
    var ownerID =  req.param("sid");
    var userID = req.session.userID;
    if(ownerID == userID || ownerID == -1){
    // 남서재, 내서재 구분
      mine=1;
      ownerID=userID;
    }  
    //console.log("session" + req.session.ownerID);
    console.log("shelf");
    //ownerID = req.session.ownerID;

    sql = 
    //[0]user info
      "SELECT * FROM User WHERE " + "'" + ownerID + "' = user_index;" + 
      //[1] follower count
     " SELECT COUNT (user_index) as count FROM Subscribe WHERE " + "'" + ownerID + "' = user_index;"+ 
     //[2]following count
     " SELECT COUNT (follower_id) as count FROM Subscribe WHERE " + "'" + ownerID + "' = follower_id;"+
      "SELECT * FROM Post WHERE" + "'" + ownerID + "' = user_index;"+
      "SELECT  Post.post_id, Post.title, User.nickName, User.user_index FROM Subscribe INNER JOIN User ON Subscribe.user_index = User.user_index INNER JOIN Post ON Subscribe.user_index = Post.user_index WHERE Subscribe.follower_id = "+"'" +  ownerID+"';"+
      //좋아요 수
      "SELECT COUNT (love_id) as count FROM Love WHERE type='book' AND '" + ownerID + "' = user_index AND  love_status = 1;"+
      //[6]읽은 책 수
      "SELECT COUNT (book_read_id) as count FROM Book_Read WHERE return_date is not NULL AND '" + ownerID + "' = user_index;"+
      //[7]인용문 수
      "SELECT COUNT (quotation_id) as count FROM Quotation WHERE '" + ownerID + "' = user_index;"+
      //[8]내가 좋아한 책
      //"SELECT * FROM Book INNER JOIN Love ON Love.book_id = Book.book_id WHERE '" + ownerID + "' = user_index AND  '" + 1 + "' = love_status;"
      //[8]대여중인 도서
      "SELECT * FROM Book_Read INNER JOIN Book ON Book_Read.book_id = Book.book_id  WHERE return_date is NULL AND '" + ownerID + "' = user_index;"+
      //[9]카테고리 수
      "SELECT DISTINCT bookshelf_title FROM Bookshelf WHERE '" + ownerID + "' = user_index;"+
      //[10]카테고리 별 도서
      "SELECT * FROM Bookshelf INNER JOIN Book ON Bookshelf.book_id = Book.book_id WHERE '" + ownerID + "' = user_index;";

   


    connection.query(sql,function(err, result, fields){
      if (err) throw err;
      else{
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
          categorized : result[10],
          mine : {value : mine}
        };
        console.log(obj);
        res.render('shelf',obj);
      }
    })
  }
  

   
});


/* GET shelf/post page. */
router.get('/post', function(req, res, next) {
    //ownerID = req.session.ownerID;
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

  // = req.session.ownerID;
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

/* GET shelf/post/setpost */
router.get('/post/setpost', function(req, res, next) {
  //ownerID = req.session.ownerID;
  var pid =  req.param("pid");

  if(pid==-1){
    obj = {info : [{pid : -1}]}
    res.render('shelf/setpost', obj);
  }else{
    sql = "SELECT *  FROM Post WHERE '" + pid + "' = post_id;"
    connection.query(sql, function(err, result, fields){
      if (err) throw err;
      else {
      console.log(result)
        obj = {
          info : result}
          res.render('shelf/setpost', obj);
      }
    });

  }
});

/* GET shelf/post/delete page. */
router.get('/post/setpost', function(req, res, next) {
  //ownerID = req.session.ownerID;
  var pid =  req.param("pid");

  if(pid==-1){
    obj = {info : [{pid : -1}]}
    res.render('shelf/setpost', obj);
  }else{
    sql = "SELECT *  FROM Post WHERE '" + pid + "' = post_id;"
    connection.query(sql, function(err, result, fields){
      if (err) throw err;
      else {
      console.log(result)
        obj = {
          info : result}
          res.render('shelf/setpost', obj);
      }
    });

  }
});


router.post('/post/setpost', function(req, res, next) {
  var body = req.body;

  //ownerID = req.session.ownerID;
  var pid =  req.param("pid");
  res.render('shelf/setpost');
  if(pid==-1){
    connection.query("INSERT INTO Post (user_index, title,contents) VALUES (?,?,?)", [
      ownerID, body.title, body.contents
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



/* GET shelf/libManage page. */
router.get('/libManage', function(req, res, next) {
  var category;
  var category_count;


  if(!req.session.userID) res.redirect('../user/login');
  else{
    sql = "SELECT COUNT(book_id) as count, bookshelf_title, bookshelf_id as id FROM Bookshelf WHERE '" + ownerID + "' = Bookshelf.user_index GROUP BY bookshelf_title;";
    connection.query(sql, function(err, result, fields){
      if (err) throw err;
      else {
            obj = {
              category_count : result
            }
            console.log(obj)
            res.render('shelf/library/libManage', obj);
          }

      });
  }

});

/* GET shelf/libManage page. */
router.get('/libManage/modify', function(req, res, next) {

  if(!req.session.userID) res.redirect('../user/login');
  else{
    sql = "SELECT COUNT(book_id) as count, bookshelf_title, bookshelf_id as id FROM Bookshelf WHERE '" + ownerID + "' = Bookshelf.user_index GROUP BY bookshelf_title;";
    connection.query(sql, function(err, result, fields){
      if (err) throw err;
      else {
            obj = {
              category_count : result
            }
            console.log(obj)
            res.render('shelf/library/libManage', obj);
          }

      });
  }

});

/* DELETE category shelf/libManage/delete page. */
router.get('/libManage/delete', function(req, res, next) {
  // = req.session.ownerID;
  var cname =  decodeURIComponent(req.param("cname"));

  sql = "DELETE FROM Bookshelf WHERE '" + cname + "' = bookshelf_title;"
  connection.query(sql, function(err, result, fields){
    if (err) throw err;
    else {
      console.log("Affect : " + result.affectedRows);
      res.redirect('/shelf/libManage');
    }
  });


});


module.exports = router;
