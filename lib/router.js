Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	waitOn: function(){
		return Meteor.subscribe('notifications');
	},
	notFoundTemplate: 'notFound',

});

PostsListController = RouteController.extend({
		template: 'postsList',
		increment: 5,
		postsLimit: function(){
			return parseInt(this.params.postsLimit) || this.increment;
		},
		findOptions: function(){
			return {sort: this.sort, limit: this.postsLimit()};
		},
		subscriptions: function(){
			this.postsSub =  Meteor.subscribe('posts', this.findOptions());
		},
		posts: function(){
			return Posts.find({}, this.findOptions());
		},
		data: function(){
			var self = this;
			return {
				posts: self.posts(),
				ready: self.postsSub.ready,
				nextPath: function(){
					if (self.posts().count() === self.postsLimit()) {
						return self.nextPath();
					};
				}
			}
		}
});

NewPostsController = PostsListController.extend({
		sort: {
			submitted: -1,
			_id: -1
		},
		nextPath: function(){
			return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment});
		}
});

BestPostsController = PostsListController.extend({
		sort: {votes: -1, _id: -1},
		nextPath: function(){
			return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment});
		}
});

Router.route('/', {
	name: 'home',
	controller: NewPostsController
});

Router.route('/new/:postsLimit?', {
  name: 'newPosts'
});

Router.route('/best/:postsLimit?', {
  name: 'bestPosts'
});

Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() {
    return [
    Meteor.subscribe('singlePost', this.params._id),
    Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function(){
  	return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/submit', {name: 'postSubmit'});

/*Router.map(function() {
	this.route('postsList', {path: '/'});
	this.route('postPage', {
	path:'/posts/:_id',
	data: function(){
		return Posts.findOne(this.params._id);
		},
	waitOn: function(){
		return Meteor.subscribe('comments', this.params._id);
	}
	});
	this.route('postEdit', {
	path: '/posts/:_id/edit',
	data: function(){
		return Posts.findOne(this.params._id);
		}
	});
	this.route('postSubmit', {
		path: '/submit'
	});
});*/

var requireLogin = function(){
		if (! Meteor.user()) {
			if(Meteor.loggingIn()){
				this.render(this.loadingTemplate);
			}else{
				this.render('accessDenied');
			}
		}else{
			this.next();
		}
}

Router.onBeforeAction('dataNotFound', {
	only: 'postPage'
});
Router.onBeforeAction(requireLogin, {
		only: 'postSubmit'
});
Router.onBeforeAction(function(){
  Errors.clearSeen();
  this.next();
});