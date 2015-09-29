/////////////// Events ///////////////

Template.view.events({
	'click #taskReset': function(e, t){
		e.preventDefault();
		Session.set('taskFilter', "");
	},
	'click #technologiesReset': function(e, t){
		e.preventDefault();
		Session.set('technologiesFilter', "");
	},
	'change #resourceFilter': function(e, t){
	  e.preventDefault();
	  var selected = $(e.currentTarget).find(':selected');
	  Session.set('resourceFilter', selected.val());
	},
	'click #resourceReset': function(e, t){
		e.preventDefault();
		Session.set('resourceFilter', "");
		$('#resourceFilter').prop('selectedIndex', 0);
	},
	'click #dateReset': function(e, t){
		e.preventDefault();
		Session.set('dateFilter', "");
	}
});