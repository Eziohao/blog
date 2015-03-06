var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/reg',function(req,res){
  res.render('index',{title:'Register'});
});
router.get('/login',function(req,res){
	res.render('index',{title:'Login'});
});
router.get('/post',function(req,res){
    res.render('index',{title:'Post'});
});
module.exports = router;
