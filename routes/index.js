var express = require('express');
var crypto = require('crypto'),
  User = require('../models/user.js');
var router = express.Router();
var flash = require('connect-flash');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Main page',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});
router.get('/reg', function(req, res) {
  res.render('reg', {
    title: 'Register',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});
router.post('/reg', function(req, res) {
  var name = req.body.name;
  var password = req.body.password;
  var password_re = req.body.passwordRepeat;

  if (password != password_re) {

    req.flash = ('error', "Please input same password");
    return res.redirect('/reg');

  }

  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('hex');
  var newUser = new User({
    name: name,
    password: password,
    email: req.body.email
  });
  
  User.get( newUser.name,function(err, user) {
    if (err) {
      console.log('error log');
      req.flash('error', err);
      return res.redirect('/reg');
    }
    if (user) {
      console.log('existed');
      req.flash('error', 'User has already existed');
      return res.redirect('/reg');
    }
    newUser.save(function(err, user) {
      if (err) {
        console.log('save error');
        req.flash('error', err);
        return res.redirect('/reg');
      }
   
      req.session.user = user;
      console.log("success");
      req.flash('success', 'Regesiter success');
      res.redirect('/')
    });
  });
});
router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Login',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});
router.post('/login',function(req,res){
  var md5=crypto.createHash('md5');
  var password=md5.update(req.body.password).digest('hex');
  User.get(req.body.name,function(err,user){
    if(!user){
      req.flash('error','User is not existed!');
      return res.redirect('/login');

    }
    if(user.password!=password){
      req.flash('error','Password error');
      return res.redirect('/login');
    }
    req.session.user=user;
    req.flash('success','Login successed');
    res.redirect('/');
  })
});
router.get('/logout',function(req,res){
  req.session.user=null;
  req.flash('success','Logout successed');
  res.redirect('/');
})
router.get('/post', function(req, res) {
  res.render('index', {
    title: 'Post',
    user: req.session.user,
success: req.flash('success').toString(),
error: req.flash('error').toString()
  });
});
module.exports = router;
function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','Not login');
    res.redirect('/login');
  }
  next();
}
function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','Login');
    res.redirect('back');
  }
  next();
}