Meteor.startup = function(){
  Tracker.autorun(function(){
    console.log('현재 ' + Posts.find().count() + ' 개의 포스트가 있습니다.');
  });
};