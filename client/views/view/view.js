/////////////// Events ///////////////

Template.view.events({
	'click #submitFilter': function(e, t){
	  e.preventDefault();
	  var task = t.find('#taskFilter').value, technologies = t.find('#technologiesFilter').value,
	  resource = t.find('#resourceFilter').value, date = t.find('#dateFilter').value;
	  Session.set({'taskFilter': task, 'technologiesFilter': technologies, 'resourceFilter': resource, 'dateFilter': date});
	},
	'click #clearFilter': function(e, t){
		e.preventDefault();
		Session.set({'taskFilter': '', 'technologiesFilter': '', 'resourceFilter': '', 'dateFilter': ''});
		$('#taskFilter, #technologiesFilter').val('');
		$('#resourceFilter, #dateFilter').prop('selectedIndex', 0);
	}
});