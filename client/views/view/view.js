/////////////// Rendered ///////////////

Template.view.rendered = function(){
	$('.carousel').carousel({interval: false});
};


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
	},
	'click .thumbnail-image': function(e, t){
		e.preventDefault();
		Session.set({'imageIndex': Number(e.currentTarget.dataset.index) + 1, 'imageResourceId': e.currentTarget.dataset.resource, 'imageOrientId': e.currentTarget.dataset.task});
		setTimeout(function(){
			$('.carousel-inner').find('.item').removeClass('active');
			$('.carousel-inner').find('.item').eq(e.currentTarget.dataset.index).addClass('active');
		}, 500);
	},
	'dropped .dropzone': function(e, t){
		var taskId = "#" + e.currentTarget.id;
		var resourceId = e.currentTarget.dataset.resource;
	  FS.Utility.eachFile(e, function(file){
	    var newFile = new FS.File(file);
	    Images.insert(newFile, function(error, fileObj){
	      if(error)
	        FlashMessages.sendError("<b>Error</b>. Image upload failed. Please try again.");
	      else{
	      	Meteor.call('attachImage', resourceId, taskId, fileObj._id);
	        FlashMessages.sendSuccess("<b>Success</b>. Image upload success.");
	      }
	    });
	  });
	}
});