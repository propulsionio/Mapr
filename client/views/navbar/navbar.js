/////////////// Events ///////////////

Template.navbar.events({
  'click #logOut': function(e, t){
    Meteor.logout();
  }
});