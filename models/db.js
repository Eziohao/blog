var setting=require('../setting.js');
Db=require('mongodb').Db,
Connection=require('mongodb').Connection,
Server=require('mongodb').Server;
module.exports=new Db(settings.db, new Server(setting.host, settings.{safe:true}));

