Template.postSubmit.events({
	'submit form': function(e){
		e.preventDefault();

		var post= {
			url: $(e.target).find('[name=url]').val(),
			title: $(e.target).find('[name=title]').val()
		};

		var errors = validatePost(post)
			if (errors.title || errors.url) {
				return Session.set('postSubmitErrors', errors);
			};

		/*post._id = Posts.insert(post);
		Router.go('postPage', post);*/

		Meteor.call('postInsert', post, function(error, result){
				if (error) {
					Errors.throw(error.reason);
				};
				if(result.postExists){
					Errors.throw('이 주소는 이미 작성되어 있습니다.');
				}
				Router.go('postPage', {
					_id: result._id
				});
// 				Router.go('postsList');
		});

	}
});


Template.postSubmit.created = function(){
	Session.set('postSubmitErrors', {})
};

Template.postSubmit.helpers({
	errorMessage: function(field){
		return Session.get('postSubmitErrors') [field];
	},
	errorClass: function(field){
		return !!Session.get('postSubmitErrors') [field] ? 'has-error' : '';
	}
});