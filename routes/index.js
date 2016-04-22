var express = require('express');
var crypto = require('crypto');
var User = require('../models/user.js');
var Post=require('../models/post.js');
//var Comment=require('../models/comment.js');
var router = express.Router();
var flash = require('connect-flash');
var multer=require('multer');

var upload=multer({
  dest:'../bin/public/images',
  rename:function(fieldname,filename){
    return filename;
  }
   });
/* GET home page. */
router.get('/', function(req, res) {   //mainpage
  Post.getAll(null,function(err,posts){
    if(err){
      post=[];
    }
    res.render('index', {
    title: 'Main page',
    user:req.session.user,
    posts:posts,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  })

  });
});
 

router.get('/reg',checkNotLogin);   
router.get('/reg', function(req, res) {  //reg page
  res.render('reg', {
    title: 'Register',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});
router.post('/reg',checkNotLogin);
router.post('/reg', function(req, res) {  //reg post function
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

router.get('/login',checkNotLogin);
router.get('/login', function(req, res) { //login page
  res.render('login', {
    title: 'Login',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});

router.post('/login',checkNotLogin);
router.post('/login',function(req,res){  //user logins
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

router.get('/logout',checkLogin);
router.get('/logout',function(req,res){  //logout function
  req.session.user=null;
  req.flash('success','Logout successed');
  res.redirect('/');
});

router.get('/post',checkLogin);
router.get('/post', function(req, res) { //post page
  res.render('post', {
    title: 'Post',
    user: req.session.user,

success: req.flash('success').toString(),
error: req.flash('error').toString()
  });
});

router.post('/post',checkLogin);
router.post('/post',function(req,res){  //post article
  var currentUser=req.session.user;
  var post=new Post(currentUser.name,req.body.title,req.body.post);
  post.save(function(err){
    if(err){
      console.log('error');
      req.flash('error',err);
      return res.redirect('/');
    }
    console.log('get post');
    req.flash('success','Post successed');
    res.redirect('/');
  })
})
router.get('/upload',checkLogin);
router.get('/upload',function(req,res){  //upload file gets page
  res.render('upload',{
    title:"Upload file",
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
});
router.post('/upload',checkLogin);
router.post('/upload',upload,function(req,res){  //post file 
 
   console.log('Upload');
   req.flash('success','Upload success');
   res.redirect('/upload');
});
router.get('/u/:name', checkLogin);
router.get('/u/:name',function(req,res){  //user page
  User.get(req.params.name,function(err,user){
    if(!user){
      req.flash('error','User does not exist');
      res.redirect('/');
    }
    Post.getAll(user.name,function(err,posts){
      if(err){
        req.flash('error',err),
        res.redirect('/')
      }
      res.render('user',{
      title:user.name,
      posts:posts,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
     
    });
  });
});

router.get('/u/:name/:day/:title', checkLogin);
router.get('/u/:name/:day/:title',function(req,res){    //article page
  Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
     if(err){
      console.log("get one error");
      req.flash('error',err);
      return res.redirect('/');
     }
     console.log("article");
     res.render('article',{
      title:req.params.title,
      post:post,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
     });
  });
});

router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title',function(req,res){   //edit page
  Post.edit(req.params.name,req.params.day,req.params.title,function(err,post){
    if(err){
      console.log(err);
      req.flash('error',err);
      return res.redirect('/');

    }
    res.render("edit",{
      title:'Edit',
      post:post,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
});

router.post('/edit/:name/:day/:title',checkLogin);
router.post('/edit/:name/:day/:title',function(req,res){  //update change
  var currentUser=req.session.user;
  Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
    var url=encodeURI('/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
    if(err){
      req.flash('error',err);
      return res.redirect(url);
    }
    req.flash('success','Update success');
    res.redirect(url);
  })
})

router.get('/remove/:name/:day/:title',checkLogin);
router.get('/remove/:name/:day/:title',function(req,res){       //remove article
  var currentUser=req.session.user;
  Post.remove(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success','Remove success');
    res.redirect('/');
  })
})

module.exports = router;

function checkLogin(req,res,next){  //check login status
  if(!req.session.user){
    req.flash('error','Not login');
    res.redirect('/login');
  }
  next();
}
function checkNotLogin(req,res,next){ //check login status
  if(req.session.user){
    req.flash('error','Login');
    res.redirect('back');
  }
  next();
}