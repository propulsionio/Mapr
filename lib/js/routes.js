/////////////// Routes ///////////////

Router.map(function(){
  this.route('home', {path: '/'});
  this.route('create', {path: '/create'});
  this.route('view', {path: '/view'});
  this.route('logIn', {path: '/logIn'});
  this.route('register', {path: '/register'});
  this.route('forgotPassword', {path: '/forgotPassword'});
});

Router.onBeforeAction(function(){
  Session.set('taskFilter', '');
  Session.set('technologiesFilter', '');
  Session.set('resourceFilter', '');
  Session.set('dateFilter', '');
  this.next();
}, { only: ['view'] });