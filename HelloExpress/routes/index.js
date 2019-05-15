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


/* login page */
router.get('/user/login', function(req, res, next) {
  res.render('user/login');
});


/*login 확인 과정*/
router.post('/user/login', function(req, res, next) {
  console.log("in");
  var body = req.body;//email, password
  connection.query("SELECT COUNT (user_index) as count FROM User WHERE ( email = '" + body.email + "' AND Password = '" + body.password +"' )",
  function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    }
    else if(result && result[0].count ==1){
      connection.query("SELECT *  FROM User WHERE  email = '" + body.email + "'",
      function(err, result, fields){
        console.log(result);
        userID = result[0].user_index;
        req.session.userID = userID;
        if(req.session.userID)  console.log("success" + req.session.userID)
        // req.app.locals.userID = result[0].user_index;
        res.redirect("/");
      }) 
    }
    else{
      res.render('alert', {message : 'no such user'}); 
    }
  });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  sql = 
    // [0] column 1 - 오늘의 책
    "SELECT Book.* FROM Book \
      NATURAL JOIN Book_Recommend \
      WHERE Book_Recommend.category='오늘의 책' AND Book_Recommend.book_id=Book.book_id;"
    // [1] column 2 - 오늘의 리딩북
    + "SELECT Book.* FROM Book \
        NATURAL JOIN Book_Recommend \
        WHERE Book_Recommend.category='오늘의 리딩북' AND Book_Recommend.book_id=Book.book_id;" 
    // [2] column 3 - 실시간 인용문
    + "SELECT t2.nickName, t1.content, t1.datetime, t3.title\
        FROM (SELECT * FROM Quotation ORDER BY datetime DESC LIMIT 5) t1\
        LEFT JOIN (SELECT * FROM User) t2\
        ON t1.user_index = t2.user_index\
        LEFT JOIN (SELECT * FROM Book) t3\
        ON t1.book_id = t3.book_id;"
    // [3] column 4 - 밀리 작가 특집
    + "SELECT * FROM Post \
        WHERE user_index='1' \
        ORDER BY datetime DESC LIMIT 3;"
    // [4] column 5 - 독서
    + "SELECT t1.num, t2.nickName \
        FROM (SELECT user_index, count(*) AS num \
          FROM Book_Read WHERE return_date IS NOT NULL \
          GROUP BY user_index ORDER BY count(*) DESC LIMIT 10) t1 \
        LEFT JOIN (SELECT * FROM User) t2 \
        ON t1.user_index = t2.user_index;"
    // [5] column 5 - 서평
    + "SELECT t1.num, t2.nickName \
        FROM (SELECT user_index, count(*) AS num \
        FROM Post WHERE user_index != '1' \
        GROUP BY user_index ORDER BY count(*) DESC LIMIT 10) t1 \
        LEFT JOIN (SELECT * FROM User) t2 \
        ON t1.user_index = t2.user_index;"
    // [6] column 6 - 월간 차트
    + "SELECT t1.num, t2.title, t2.writer, t2.publisher \
        FROM ( \
          SELECT book_id, count(*) AS num \
            FROM Book_Read \
            WHERE DATE(borrow_date\
          ) \
        BETWEEN DATE_ADD(NOW(),INTERVAL -5 MONTH ) AND NOW() \
        GROUP BY book_id \
        ORDER BY count(*) DESC LIMIT 10) t1 \
        NATURAL JOIN (SELECT * FROM Book) t2 \
        WHERE t1.book_id = t2.book_id;"
    // [7] column 6 - 주간 차트
    + "SELECT t1.num, t2.title, t2.writer, t2.publisher \
        FROM ( \
          SELECT book_id, count(*) AS num \
            FROM Book_Read \
            WHERE DATE(borrow_date\
          ) \
        BETWEEN DATE_ADD(NOW(),INTERVAL -5 WEEK ) AND NOW() \
        GROUP BY book_id \
        ORDER BY count(*) DESC LIMIT 10) t1 \
        NATURAL JOIN (SELECT * FROM Book) t2 \
        WHERE t1.book_id = t2.book_id;"
    // [8] column 6 - 누적 차트
    + "SELECT * FROM Book ORDER BY like_count DESC LIMIT 10;"
    // [9] column 7 -밀리 오리지널
    + "SELECT * FROM Book WHERE publisher = '밀리의서재';"
    // [10] column 8 - 태그 픽
    // [11] column 9 - 이벤트 목록
    + "SELECT * FROM Event WHERE to_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 100 MONTH)"
    ;

  connection.query(sql, function(err, query, fields){
    if (err){
      console.log("쿼리문에 오류가 있습니다.");
      console.log(err);
    }
    obj = 
    {
      book_today: query[0],
      readingbook_today: query[1],
      quotation: query[2],
      weekly_writer: query[3],
      user_read: query[4],
      user_post: query[5],
      book_month: query[6],
      book_week: query[7],
      book_year: query[8],
      mili_original: query[9],
      event: query[10]
    };
    res.render('home',obj);
  });
});

router.post('/', function(req, res, next){
  connection.query(
  );
});
/* GET search page. */
router.get('/search', function(req, res, next) {
  var q =  req.param("q");
  if (typeof q == "undefined") {
    res.render('search');
  }
  else{
    sql = "SELECT * FROM Book WHERE (title LIKE '%" + q +"%') OR (writer LIKE '%" + q +"%') OR (publisher LIKE '%" + q +"%');";
    console.log(sql)
    connection.query(sql, function(err, result, fields){
    console.log(result);
    res.json(result);
    });
  }

});



/* GET book page. */
router.get('/book', function(req, res, next) {
  res.render('book');
});



/* 회원가입 */
router.get('/user/addUser', function(req, res, next) {
  res.render('user/addUser');
});

router.post('/user/addUser', function(req, res, next) {
  var body = req.body;
  var sql;
  sql =  "SELECT COUNT (user_index) as count FROM User WHERE email = '" + body.email + "'";
  connection.query(sql,function(err, result, fields){
    if (err) throw err;

    else if(result && result[0].count ==1){
      res.render('alert', {message : 'same email'}); 
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






router.get('/index', function(req, res, next) {
  connection.query("SELECT * FROM book;", function(err, books, fields){
    connection.query("SELECT * FROM book;", function(err, counts, fields){
      obj = 
      {print: books,
       counts : count};
      res.render('index', obj);     
    });       
  });

});

/*Get 책 목록 추가 page*/
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

/*관리->계정관리*/
router.get('/management/myinfo', function(req, res, next) {
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
router.get('/management/myinfo/set_writer', function(req, res, next) {
  res.render('management/myinfo/set_writer');
});
router.post('/management/myinfo/set_writer', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET NickName = '"+ body.name +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});


/*관리->계정관리->서재명 수정*/
router.get('/management/myinfo/set_shelf', function(req, res, next) {
  res.render('management/myinfo/set_shelf');
});
router.post('/management/myinfo/set_shelf', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET libraryName = '"+ body.name +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->서재설명 수정*/
router.get('/management/myinfo/set_description', function(req, res, next) {
  res.render('management/myinfo/set_description');
});
router.post('/management/myinfo/set_description', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET libraryDescription = '"+ body.description +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->핸드폰 번호 수정*/
router.get('/management/myinfo/set_phone', function(req, res, next) {
  res.render('management/myinfo/set_phone');
});

router.post('/management/myinfo/set_phone', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET PhoneNumber = '"+ body.phone +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});

/*관리->계정관리->이메일 수정*/
router.get('/management/myinfo/set_email', function(req, res, next) {
  res.render('management/myinfo/set_email');
});

router.post('/management/myinfo/set_email', function(req, res, next) {
  var body = req.body;
  sql = "UPDATE User SET email = '"+ body.email +"' WHERE user_index = " + String(userID) ;
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });
  res.redirect("/management/myinfo");
});


/*관리->구독관리*/
router.get('/management/subscribe', function(req, res, next) {
  res.render('management/subscribe');
});
// SELECT COUNT (*) as count FROM Buy;
/*관리->구독관리->구독내역 조회*/
router.get('/management/subscribe/history', function(req, res, next) {
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
