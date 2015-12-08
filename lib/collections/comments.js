Comments = new Mongo.Collection('comments');

Meteor.methods({
	commentInsert: function(commentAttributes){
		check(this.userId, String);
		check(commentAttributes, {
			postId: String,
			body: String
		});

		var user = Meteor.user();
		var post = Posts.findOne(commentAttributes.postId);
		if(!post){
			throw new Meteor.Error('invalid-comment', '포스트에서만 댓글을 달 수 있습니다.');
		}
		comment = _.extend(commentAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date()
		});

		Posts.update(comment.postId, {$inc: {commentsCount: 1}});

		comment._id = Comments.insert(comment);

		createCommentNotification(comment);

		return comment._id;
	}
});