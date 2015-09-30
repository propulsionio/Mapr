/////////////// Collections ///////////////

var imageStore = new FS.Store.S3("images");
Images = new FS.Collection("Images", {
  stores: [imageStore],
  filter: {
    allow: {
      contentTypes: ['image/*']
    },
    onInvalid: function(message) {
      FlashMessages.sendError("<b>Error</b>. Image upload failed.");
    }
  }
});


/////////////// Functions / Helpers ///////////////

// Helper to return the task filter
Template.registerHelper("taskFilter", function(){
  return Session.get('taskFilter');
});

// Helper to return the technologies filter
Template.registerHelper("technologiesFilter", function(){
  return Session.get('technologiesFilter');
});

// Helper to return the resource filter
Template.registerHelper("resourceFilter", function(){
  return Session.get('resourceFilter');
});

// Helper to return an images index
Template.registerHelper("currentImageIndex", function(){
    return Session.get('imageIndex');
});

// Helper to return an images resourceId
Template.registerHelper("imageResourceId", function(){
  return Session.get('imageResourceId');
});

// Helper to return an images taskId
Template.registerHelper("imageOrientId", function(){
  return Session.get('imageOrientId');
});

// Helper to return company name
Template.registerHelper("getCompanyName", function(companyId){
  if(companyId){
    if(companyId.cluster)
     companyId = "#" + companyId.cluster + ":" + companyId.position;
    var result = ReactiveMethod.call('getCompanyName', companyId);
    if(result){
      return result[0].name;
    }
  }
});

// Helper to return user name
Template.registerHelper("getUserName", function(userId){
  if(userId){
    if(userId.cluster)
     userId = "#" + userId.cluster + ":" + userId.position;
    var result = ReactiveMethod.call('getUserName', userId);
    if(result){
      return result[0].fullName;
    }
  }
});

// Helper to return if user is the company owner
Template.registerHelper("isCompanyOwner", function(userId, companyId){
  if(userId && companyId){
    if(userId.cluster)
     userId = "#" + userId.cluster + ":" + userId.position;
    if(companyId.cluster)
      companyId = "#" + companyId.cluster + ":" + companyId.position;
    var result = ReactiveMethod.call('isCompanyOwner', userId, companyId);
    if(result)
      return true;
  }
});

// Helper to return users related to a company
Template.registerHelper("companyUsers", function(companyId){
  if(companyId){
    if(companyId.cluster)
      companyId = "#" + companyId.cluster + ":" + companyId.position;
    return ReactiveMethod.call('getCompanyUsers', companyId);
  }
});

// Helper to return all tasks
Template.registerHelper("tasks", function(taskFilter, technologiesFilter, resourceFilter, type, parentId){
  if(resourceFilter.cluster)
    resourceFilter = "#" + resourceFilter.cluster + ":" + resourceFilter.position;
  if(parentId.cluster)
    parentId = "#" + parentId.cluster + ":" + parentId.position;
  return ReactiveMethod.call('getTasks', taskFilter, technologiesFilter, resourceFilter, type, parentId);
});

// Helper to return task title
Template.registerHelper("getTaskTitle", function(taskId){
  if(taskId){
    if(taskId.cluster)
     taskId = "#" + taskId.cluster + ":" + taskId.position;
    var result = ReactiveMethod.call('getTaskTitle', taskId);
    if(result){
      return result[0].title;
    }
  }
});

// Helper to return a tasks metadata
Template.registerHelper("taskData", function(userId, taskId, field){
  if(userId && taskId && field){
    if(userId.cluster)
      userId = "#" + userId.cluster + ":" + userId.position;
    if(taskId.cluster)
      taskId = "#" + taskId.cluster + ":" + taskId.position;
    var result = ReactiveMethod.call('getTaskData', userId, taskId, field);
    if(result){
      if(field == 'imagesNum')
        return result[0]['images'].length;
      else if(field == 'images'){
        var images = result[0]['images'];
        if(images){
          images.forEach(function(value, index){
            images[index] = {"index": index, "imageId": value};
          });
          return images;
        }
      }
      else
        return result[0][field];
    }
  }
});

// Helper to return if a task has subtasks
Template.registerHelper("hasSubtasks", function(userId, taskId, type){
  if(userId && taskId && type){
    if(userId.cluster)
      userId = "#" + userId.cluster + ":" + userId.position;
    if(taskId.cluster)
      taskId = "#" + taskId.cluster + ":" + taskId.position;
    var result = ReactiveMethod.call('getNumSubtasks', userId, taskId, type);
    if(result)
      return result[0].count > 0;
  }
});

// Helper to return the number of subtasks related to a task
Template.registerHelper("numSubtasks", function(userId, taskId, type){
  if(userId && taskId && type){
    if(userId.cluster)
      userId = "#" + userId.cluster + ":" + userId.position;
    if(taskId.cluster)
      taskId = "#" + taskId.cluster + ":" + taskId.position;
    var result = ReactiveMethod.call('getNumSubtasks', userId, taskId, type);
    if(result)
      return result[0].count;
  }
});

// Helper to return an image
Template.registerHelper("getImage", function(imageId){
  if(imageId)
    return Images.find({_id: imageId});
});