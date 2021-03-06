var mongodb=require('mongodb');
var markdown=require('markdown').markdown;
var settings=require('../settings');

function Post(name,title,post){
     this.name=name;
     this.title=title;
     this.post=post;
}
module.exports=Post;

Post.prototype.save=function(callback){
	var date=new Date();
	var time={
		date:date,
		year:date.getFullYear(),
		month:date.getFullYear()+'-'+(date.getMonth()+1),
		day:date.getFullYear()+'-'+(date.getMonth()+1)+date.getDate(),
		minute:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()),

	}
	var str=this.post;
	str=str.replace(/\r?\n/g, '<br />');

	var post={
		name:this.name,
		time:time,
		title:this.title,
		post:str
	}
	mongodb.connect(settings.url,function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('posts',function(err,collection){
			if(err){
				db.close();
				return callback(err);
			}
			collection.insert(post,{
				safe:true
			},function(err){
				db.close();
				if(err){
					return callback(err);
				}
				callback(err);
			});
		});
	});
}

	Post.getAll=function(name,callback){
		mongodb.connect(settings.url,function(err,db){
			if(err){
				return callback(err);
			}
			db.collection('posts',function(err,collection){
				if(err){
					db.close();
					return callback(err);
				}
				console.log("get all posts");
				var query={};
				if(name){
					query.name=name;
				}
				collection.find(query).sort({
					time:-1
				}).toArray(function(err,docs){
					db.close();
					if(err){
						return callback(err);

					}
					docs.forEach(function(doc){
						doc.post=markdown.toHTML(doc.post);
					})
					callback(null,docs);
				});
			});
		});
	};
	Post.getOne=function(name,day,title,callback){
		mongodb.connect(settings.url,function(err,db){
			if(err){
				console.log("error open");
				return callback(err);
			}
			db.collection('posts',function(err,collection){
				if(err){
					console.log(err);
					 db.close();
					return callback(err);
				}
				collection.findOne({
					"name":name,
                    "time.day":day,
                    "title":title
				},function(err,doc){
					db.close();
					if(err){
						return callback(err);
					}
					doc.post=markdown.toHTML(doc.post);
                    callback(null,doc);
				});
			});
		});
	};
	Post.edit=function(name,day,title,callback){
		mongodb.connect(settings.url,function(err,db){
			if(err){
				return callback(err);
			}
			db.collection('posts',function(err,collection){
				if(err){
					console.log(err);
					db.close();
					return callback(err);
				}
				collection.findOne({
					"name":name,
					"time.day":day,
					"title":title
				},function(err,doc){
					db.close();
					if(err){
						console.log(err);
						return callback(err);
					}
                    callback(null,doc);
				})
			})
		})
	};
	Post.update=function(name,day,title,post,callback){
		mongodb.connect(settings.url,function(err,db){
			if(err){
                console.log(err);
				return callback(err);
			}
			db.collection('posts',function(err,collection){
				if(err){
					console.log(err);
					db.close();
					return callback(err);
				}
				collection.update({
					"name":name,
					"time.day":day,
					"title":title

				},{
                    $set: {post:post}
				},function(err,doc){
					db.close();
					if(err){
						console.log(err);
						return callback(err);
					}
					callback(null,doc);
				});
			});
		});
	};
	Post.remove=function(name,day,title,post,callback){
		mongodb.connect(settings.url,function(err,db){
			if(err){
				console.log(err);
				db.close();
				return callback(err);
			}
			db.collection('posts',function(err,collection){
				if(err){
					console.log(err);
					db.close();
					return callback(err);
				}
				collection.remove({
					"name":name,
					"time.day":day,
					"title":title
				},{
					w:1
				},function(err,doc){
					db.close();
					if(err){
						console.log(err);
						return callbcak(err);
					}
					callback(null,doc);
				});
			});
		});
	};