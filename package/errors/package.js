Package.describe({
  summary: "앱 사용자에게 에러메시지 표시하는 패턴"
});

Package.on_use(function (api, where) {
  api.use(['minimongo', 'mongo-livedata', 'templating'], 'client');

  api.add_files(['errors.js', 'errors_list.html', 'errors_list.js'], 'client');

  if (api.export) 
    api.export('Errors');
});

Package.on_test(function(api){
	api.use('tmeasday:errors', 'client');
	api.use(['tinytest', 'test-helpers'], 'client');

	api.add_files('errors_tests.js', 'client');
});