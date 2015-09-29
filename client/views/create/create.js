/////////////// Functions / Helpers ///////////////

// Helper to add tasks list to typeahead
Template.create.helpers({
  tasksTypeahead: function(query, sync, callback) {
    Meteor.call('getTypeaheadTasks', query, {}, function(err, result){
      if(err){
        console.log(err);
        return;
      }
      callback(result.map(function(v){ return {value: v.title}; }));
    });
  }
});


/////////////// Rendered ///////////////

Template.create.rendered = function() {
  Meteor.typeahead.inject();

  Meteor.call('getTechnologies', function(err, result){
    if(err){
      console.log(err);
      return;
    }
    Session.set('selectizeTechnologies', result);
    $('#taskTechnologies').selectize({
      plugins: ['remove_button'],
      delimiter: ',',
      persist: false,
      valueField: 'title',
      labelField: 'usedCount',
      searchField: ['title'],
      options: result,
      render: {
        item: function(item, escape) {
          return '<div><span>' + escape(item.title) + '</span></div>';
        },
        option: function(item, escape) {
          return '<div><span>' + escape(item.title) + ' - </span><small>' + escape(item.usedCount) + '</small></div>';
        }
      },
      create: function(input) {
        return {
          title: input
        }
      }
    });
  });
};


/////////////// Events ///////////////

Template.create.events({
  // Event to handle the click of the add new subtask button
  'click #addNewSubtask': function(e, t){
    var id = Random.id([12]);
    var users = "";
    Meteor.call('getCompanyUsers', Meteor.user().profile.companyId, function(err, result){
      if(err){
        FlashMessages.sendError("<b>Error.</b> " + err);
        return;
      }
      result.forEach(function(value, index){
        orientId = "#" + value.orientId.cluster + ":" + value.orientId.position;
        users += "<option value="+orientId+">" + value.fullName + "</option>";
      });
      $('#addNewSubtask').before("<div class='new-subtask-section' id="+id+"><div class='form-group'><input type='text' class='form-control typeahead task-input typeahead-"+id+"' name='tasksArray' placeholder='Enter a task' maxlength='140' data-source='tasksTypeahead' required></div><div class='form-group'><input type='text' class='form-control selectize-"+id+"' name='tasksTechnologiesArray' placeholder='Required technologies'></div><div class='row'><div class='col-md-4'><div class='form-group'><select class='form-control' name='tasksResourcesArray' required><option value=''>Resource</option>"+users+"</select></div></div><div class='col-md-4'><div class='form-group'><select class='form-control' name='tasksDifficultiesArray' required><option value=''>Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option><option>Extreme</option></select></div></div><div class='col-md-4'><div class='form-group'><input type='number' class='form-control' name='tasksTimesArray' placeholder='Time Estimate' required></div></div></div><div id=addNewNestedSubtask"+id+"></div><div class='row'><div class='col-md-6'><button type='button' class='btn btn-default btn-block addNewNestedSubtask' data-id="+id+">Add Nested Subtask</button></div><div class='col-md-6'><button type='button' class='btn btn-default btn-block removeNewSubtask' data-id="+id+">Remove Subtask</button></div></div></div>");
      Meteor.typeahead.inject('input.typeahead-' + id);
      $("input.typeahead-"+id+"").focus();
      $('input.selectize-' + id).selectize({
        plugins: ['remove_button'],
        delimiter: ',',
        persist: false,
        valueField: 'title',
        labelField: 'usedCount',
        searchField: ['title'],
        options: Session.get('selectizeTechnologies'),
        render: {
          item: function(item, escape) {
            return '<div><span>' + escape(item.title) + '</span></div>';
          },
          option: function(item, escape) {
            return '<div><span>' + escape(item.title) + ' - </span><small>' + escape(item.usedCount) + '</small></div>';
          }
        },
        create: function(input) {
          return {
            title: input
          }
        }
      });
    });
  },
  // Event to handle the click of the add new nested subtask button
  'click .addNewNestedSubtask': function(e, t){
    var id = Random.id([12]);
    var users = "";
    Meteor.call('getCompanyUsers', Meteor.user().profile.companyId, function(err, result){
      if(err){
        FlashMessages.sendError("<b>Error.</b> " + err);
        return;
      }
      result.forEach(function(value, index){
        orientId = "#" + value.orientId.cluster + ":" + value.orientId.position;
        users += "<option value="+orientId+">" + value.fullName + "</option>";
      });
      $('#addNewNestedSubtask' + e.currentTarget.dataset.id).append("<div class='new-subtask-section' id="+id+"><div class='form-group'><input type='text' class='form-control typeahead task-input nested typeahead-"+id+"' name='tasksArray' placeholder='Enter a task' maxlength='140' data-source='tasksTypeahead' required></div><div class='form-group'><input type='text' class='form-control nested selectize-"+id+"' name='tasksTechnologiesArray' placeholder='Required technologies'></div><div class='row'><div class='col-md-4'><div class='form-group'><select class='form-control nested' name='tasksResourcesArray' required><option value=''>Resource</option>"+users+"</select></div></div><div class='col-md-4'><div class='form-group'><select class='form-control nested' name='tasksDifficultiesArray' required><option value=''>Difficulty</option><option>Easy</option><option>Medium</option><option>Hard</option><option>Extreme</option></select></div></div><div class='col-md-4'><div class='form-group'><input type='number' class='form-control nested' name='tasksTimesArray' placeholder='Time Estimate' required></div></div></div><button type='button' class='btn btn-default btn-block removeNewSubtask' data-id="+id+">Remove  Nested Subtask</button></div>");
      Meteor.typeahead.inject('input.typeahead-' + id);
      $("input.typeahead-"+id+"").focus();
      $('input.selectize-' + id).selectize({
        plugins: ['remove_button'],
        delimiter: ',',
        persist: false,
        valueField: 'title',
        labelField: 'usedCount',
        searchField: ['title'],
        options: Session.get('selectizeTechnologies'),
        render: {
          item: function(item, escape) {
            return '<div><span>' + escape(item.title) + '</span></div>';
          },
          option: function(item, escape) {
            return '<div><span>' + escape(item.title) + ' - </span><small>' + escape(item.usedCount) + '</small></div>';
          }
        },
        create: function(input) {
          return {
            title: input
          }
        }
      });
    });
  },
  // Event to handle the click of the remove subtask button
  'click .removeNewSubtask': function(e, t){
    $('#' + e.currentTarget.dataset.id).remove();
  },
  // Event to handle the submit of the create task form
  'submit #createTaskForm': function(e, t){
    e.preventDefault();
    var task = t.find('#task').value, technologies = t.find('#taskTechnologies').value,
    companyId = t.find('#companyId').value, resourceId = t.find('#taskResource').value, 
    difficulty = t.find('#taskDifficulty').value, time = t.find('#taskTime').value, subtasks = [];
    var count = 0, nestedIndex = 0;
    $("input[name='tasksArray']").each(function(index){
      if($(this).hasClass("nested")){
        subtasks[count - 1]['subtasks'][nestedIndex] = {};
        subtasks[count - 1]['subtasks'][nestedIndex++]['task'] = $(this).val();
      }
      else{
        subtasks[count] = {};
        subtasks[count]['subtasks'] = [];
        subtasks[count++]['task'] = $(this).val();
        nestedIndex = 0
      }
    });
    count = 0, nestedIndex = 0;
    $("input[name='tasksTechnologiesArray']").each(function(index){
      if($(this).hasClass("nested"))
        subtasks[count - 1]['subtasks'][nestedIndex++]['technologies'] = $(this).val();
      else{
        subtasks[count++]['technologies'] = $(this).val();
        nestedIndex = 0;
      }
    });
    count = 0, nestedIndex = 0;
    $("select[name='tasksResourcesArray']").each(function(index){
      if($(this).hasClass("nested"))
        subtasks[count - 1]['subtasks'][nestedIndex++]['resourceId'] = $(this).val();
      else{
        subtasks[count++]['resourceId'] = $(this).val();
        nestedIndex = 0;
      }
    });
    count = 0, nestedIndex = 0;
    $("select[name='tasksDifficultiesArray']").each(function(index){
      if($(this).hasClass("nested"))
        subtasks[count - 1]['subtasks'][nestedIndex++]['difficulty'] = $(this).val();
      else{
        subtasks[count++]['difficulty'] = $(this).val();
        nestedIndex = 0;
      }
    });
    count = 0, nestedIndex = 0;
    $("input[name='tasksTimesArray']").each(function(index){
      if($(this).hasClass("nested"))
        subtasks[count - 1]['subtasks'][nestedIndex++]['time'] = $(this).val();
      else{
        subtasks[count++]['time'] = $(this).val();
        nestedIndex = 0;
      }
    });
    Meteor.call('createTask', task, technologies, companyId, resourceId, difficulty, time, subtasks, function(err){
      if(err){
        FlashMessages.sendError("<b>Error.</b> " + err);
        return;
      }
      FlashMessages.sendSuccess("<b>Success.</b> Task Created.");
      var $select = $('#taskTechnologies').selectize()[0].selectize.clear();
      $('#createTaskForm').trigger("reset");
      $('.new-subtask-section').remove();
    });
    return false;
  }
});
