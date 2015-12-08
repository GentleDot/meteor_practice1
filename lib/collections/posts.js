Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post){
		return ownsDocument(userId, post);
	},
	remove: function(userId, post){
		return ownsDocument(userId, post);
	}
});

Posts.deny({
	update: function(userId, post, fieldNames, modifier){
		return (_.without(fieldNames, 'url', 'title').length > 0);
	}
});
/*Posts.deny({
	update: function(userId, post, fieldNames){
		return (_.without(fieldNames, 'url', 'title').length > 0);
	}
});*/

Posts.deny({
	update: function(userId, post, fieldNames, modifier){
		var errors = validatePost(modifier.$set);
		return errors.title || errors.url;
	}
});

validatePost = function(post){
	var errors = {};
	if (!post.title) {
		errors.title = "등록하려면 제목을 기입 바랍니다."
	};
	if (!post.url) {
		errors.url = "등록하려면 주소를 기입 바랍니다."
	};
	return errors;
}

Meteor.methods({
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });
/*
    if (Meteor.isServer) {
    	postAttributes.title += "(server)";
    	Meteor._sleepForMs(5000);
    }else{
    	postAttributes.title += "(client)"
    }
*/
    var errors = validatePost(postAttributes);
    if (errors.title || errors.url) {
    	throw new Meteor.Error('invalid-post',"게시물 작성을 위해서는 반드시 제목과 주소가 등록되어야 합니다. ")
    };

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if(postWithSameLink){
    	return{
    		postExists: true,
    		_id: postWithSameLink._id
    	}
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
	  votes: 0
    });

    var postId = Posts.insert(post);

    return {
      _id: postId
    };
  },
  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);

    var user = Meteor.user();
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "추천을 위해서는 로그인이 필요합니다.");

    var affected = Posts.update({
      _id: postId,
      upvoters: {$ne: this.userId}
    },{
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });

    if(! affected){
      throw new Meteor.Error('invalid', "이 포스트에 (더 이상) 추천하실 수 없습니다.");
    }

  }
});