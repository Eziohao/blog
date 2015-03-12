var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Main page' });
});
router.get('/reg',function(req,res){
  res.render('reg',{title:'Register'});
});
router.get('/login',function(req,res){
	res.render('login',{title:'Login'});
});
router.get('/post',function(req,res){
    res.render('index',{title:'Post'});
});
module.exports = router;
