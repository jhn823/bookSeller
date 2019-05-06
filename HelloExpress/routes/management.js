var express = require('express');
var router = express.Router();
var mysql = require("mysql");

var connection = mysql.createConnection({
  user: "root",
  password: "sodlfma53",
  database: "class"
});

var obj = {};
var userID = 1;

/*관리페이지*/
router.get('/management/list', function(req, res, next) {
  res.render('management/list');
});






module.exports = router;
