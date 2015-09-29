/////////////// Database ///////////////

var OrientDB = Meteor.npmRequire('orientjs');
var server = OrientDB({
  host: 'localhost',
  port: '2424',
  username: 'root',
  password: 'twelve12'
});
var db = server.use('Mapper');


/////////////// Collections ///////////////

var imageStore = new FS.Store.S3("images", {
  accessKeyId: Meteor.settings.AWSAccessKeyId, 
  secretAccessKey: Meteor.settings.AWSSecretAccessKey, 
  bucket: Meteor.settings.AWSBucket
});

Images = new FS.Collection("Images", {
  stores: [imageStore],
  filter: {
    allow: {
      contentTypes: ['image/*']
    }
  }
});


/////////////// Startup ///////////////

Meteor.startup(function(){
	// Database Restart Codes 
  // ***** DELETE BEFORE PRODUCTION USE *****
  // Meteor.users.remove({});
  // db.query('drop class company unsafe');
  // db.query('drop class user unsafe');
  // db.query('drop class profession unsafe');
  // db.query('drop class task unsafe');
  // db.query('drop class technology unsafe');
  // db.query('drop class isInProfession unsafe');
  // db.query('drop class isOwnerOf unsafe');
  // db.query('drop class isMemberOf unsafe');
  // db.query('drop class hasTask unsafe');
  // db.query('drop class hasSubtask unsafe');
  // db.query('drop class usesTechnology unsafe');

  // Orient Class Creation Code  
  db.class.list()
  .then(function(classes){
    if(classes.length == 11){
      var date = new Date();
    	db.class.create('company', 'V');
  		db.class.create('user', 'V');
  		db.class.create('profession', 'V');
  		db.query('insert into profession (date, title, usedCount) values (:date, "Web Developer", 0), (:date, "Mobile Developer", 0), (:date, "Tester", 0), (:date, "Project Manager", 0)', {params: {date: date}});
  		db.class.create('task', 'V');
  		db.class.create('technology', 'V');
  		db.query('insert into technology (date, title, usedCount) values (:date, "HTML", 0), (:date, "CSS", 0), (:date, "JavaScript", 0), (:date, "Bootstrap", 0)', {params: {date: date}});
      db.class.create('isInProfession', 'E');
      db.class.create('isOwnerOf', 'E');
      db.class.create('isMemberOf', 'E');
      db.class.create('hasTask', 'E');
      db.class.create('hasSubtask', 'E');
      db.class.create('usesTechnology', 'E');
    }
  });

  // Mail Settings
  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(Meteor.settings.smtpUsername) + ':' + encodeURIComponent(Meteor.settings.smtpPassword) + '@' + encodeURIComponent(Meteor.settings.smtpServer) + ':' + Meteor.settings.smtpPort;
  Accounts.emailTemplates.verifyEmail.subject = function(user){
    return 'Confirm Your Email Address';
  };
  Accounts.emailTemplates.verifyEmail.text = function(user, url){
    return 'Click on the following link to verify your email address: ' + url;
  };
  Accounts.emailTemplates.enrollAccount.subject = function(user){
    return 'Account Enrollment';
  };
  Accounts.emailTemplates.enrollAccount.text = function(user, url){
    return 'Click on the following link to enroll your account: ' + url;
  };

  // Create User Settings
  Accounts.onCreateUser(function(options, user){
    Meteor.setTimeout(function(){
      // Accounts.sendVerificationEmail(user._id);
    }, 2000);
    return user;
  });
});


/////////////// Allow / Deny ///////////////

Images.allow({
  insert: function(userId, doc){
    if(Meteor.users.findOne({_id: userId}))
      return true;
  },
  remove: function(userId, doc){
    if(Meteor.users.findOne({_id: userId}))
      return true; 
  },
  update: function(userId, doc){
    if(Meteor.users.findOne({_id: userId}))
      return true; 
  },
  download: function(userId, doc){
    if(Meteor.users.findOne({_id: userId}))
      return true; 
  }
});


/////////////// Methods ///////////////

Meteor.methods({

  ///// Company Methods

  // Method to return all companies
  getCompanies: function(){
    var result = Async.runSync(function(done){
      db.query('select name from company')
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to create a company in the orient database
  createCompany: function(name, city, state, zipcode, members){
    var date = new Date();
    var companyId;
    db.query('insert into company (createdAt, name, city, state, zipcode) values (:date, :name, :city, :state, :zipcode)', {params: {date: date, name: name, city: city, state: state, zipcode: zipcode}})
    .then(Meteor.bindEnvironment(function(response){
      companyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
      var companyInterval = setInterval(Meteor.bindEnvironment(function(){
        if(companyId){
          clearInterval(companyInterval);

          members.forEach(Meteor.bindEnvironment(function(value, index){
            Meteor.call('inviteMember', value.email, value.firstName, value.lastName, value.profession, value.experience, value.wage, value.role, companyId);
          }));
        }
      }, 100));
    }));
  },
  // Method to return company name
  getCompanyName: function(companyId){
    var result = Async.runSync(function(done){
      db.query('select name from company where @rid = :companyId', {params: {companyId: companyId}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return if user is company owner
  isCompanyOwner: function(userId, companyId){
    var result = Async.runSync(function(done){
      db.query("select from isOwnerOf where (:userId in out and :companyId in in)", {params: {userId: userId, companyId: companyId}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to invite a member to a company
  inviteMember: function(email, firstName, lastName, profession, experience, wage, role, companyId){
    if(role == "owner")
      var userId = Meteor.userId();
    else if(role == "member"){
      var userId = Accounts.createUser({email: email});
      // Accounts.sendEnrollmentEmail(userId);
    }
    Meteor.users.update({_id: userId}, {$set: {"profile.companyId": companyId}});
    Meteor.call('createOrientUser', userId, email, firstName, lastName, profession, experience, wage, role, companyId);
  },

  ///// User Methods

  // Method to return all users
  getUsers: function(){
    var result = Async.runSync(function(done){
      db.query('select firstName, lastName, fullName from user')
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return users related to a company
  getCompanyUsers: function(companyId){
    var result = Async.runSync(function(done){
      db.query("select fullName, @rid as orientId from user where :companyId in out('isMemberOf')", {params: {companyId: companyId}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to create a user in the orient database
  createOrientUser: function(mongoId, email, firstName, lastName, profession, experience, wage, role, companyId){
    var date = new Date();
    var userId, professionId;
    db.query('insert into user (createdAt, mongoId, email, firstName, lastName, fullName) values (:date, :mongoId, :email, :firstName, :lastName, :fullName)', {params: {date: date, mongoId: mongoId, email: email, firstName: firstName, lastName: lastName, fullName: firstName + " " + lastName}})
    .then(Meteor.bindEnvironment(function(response){
      userId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
      var userInterval = setInterval(Meteor.bindEnvironment(function(){
        if(userId){
          clearInterval(userInterval);

          Meteor.users.update({_id: mongoId}, {$set: {"profile.userId": userId}});
          if(role == "owner")
            db.query('create edge isOwnerOf from (select from user where @rid = :userId) to (select from company where @rid = :companyId)', {params: {userId: userId, companyId: companyId}});
          db.query('create edge isMemberOf from (select from user where @rid = :userId) to (select from company where @rid = :companyId)', {params: {userId: userId, companyId: companyId}});
          db.query('select from profession where title.toLowerCase() = :profession', {params: {profession: profession.toLowerCase()}})
          .then(Meteor.bindEnvironment(function(response){
            if(response.length > 0){
              professionId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
              db.query('update profession increment usedCount = 1 where @rid = :professionId', {params: {professionId: professionId}});
              db.query('create edge isInProfession from (select from user where @rid = :userId) to (select from profession where @rid = :professionId) set experience = :experience, wage = :wage', {params: {userId: userId, professionId: professionId, experience: experience, wage: wage}});
            }
            else{
              db.query('insert into profession (createdAt, title, usedCount) values (:date, :profession, 1)', {params: {date: date, profession: profession}})
              .then(function(response){
                professionId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                db.query('create edge isInProfession from (select from user where @rid = :userId) to (select from profession where @rid = :professionId) set experience = :experience, wage = :wage', {params: {userId: userId, professionId: professionId, experience: experience, wage: wage}});
              });
            }
          }));
        }
      }, 100));
    }));
  },
  // Method to user names
  getUserName: function(userId){
    var result = Async.runSync(function(done){
      db.query('select fullName from user where @rid = :userId', {params: {userId: userId}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },

  ///// Profession Methods

  // Method to return all professions
  getProfessions: function(){
    var result = Async.runSync(function(done){
      db.query('select title, usedCount from profession')
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return professions for typeahead
  getTypeaheadProfessions: function(query, options){
    query = ("%" + query + "%").toLowerCase();
    var result = Async.runSync(function(done){
      db.query('select title, usedCount from profession where title.toLowerCase() like :query', {params: {query: query}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },

  ///// Task Methods

  // Method to return all tasks
  getTasks: function(){
    var result = Async.runSync(function(done){
      db.query('select title from task')
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return tasks related to a company
  getCompanyTasks: function(companyId, type){
    var result = Async.runSync(function(done){
      db.query("select title, resourceId, @rid as orientId from task where (companyId = :companyId and type = :type)", {params: {companyId: companyId, type: type}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return subtasks related to a company
  getCompanySubtasks: function(companyId, taskId, type){
    var result = Async.runSync(function(done){
      db.query("select title, resourceId, @rid as orientId from task where (companyId = :companyId and :taskId in in('hasSubtask') and type = :type)", {params: {companyId: companyId, taskId: taskId, type: type}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return tasks related to a user
  getUserTasks: function(resourceId, type){
    var result = Async.runSync(function(done){
      db.query("select title, @rid as orientId from task where (resourceId = :resourceId and type = :type)", {params: {resourceId: resourceId, type: type}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return subtasks related to a user
  getUserSubtasks: function(resourceId, taskId, type){
    var result = Async.runSync(function(done){
      db.query("select title, @rid as orientId from task where (resourceId = :resourceId and :taskId in in('hasSubtask') and type = :type)", {params: {resourceId: resourceId, taskId: taskId, type: type}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return tasks for typeahaed
  getTypeaheadTasks: function(query, options){
    query = ("%" + query + "%").toLowerCase();
    var result = Async.runSync(function(done){
      db.query('select title, usedCount from task where title.toLowerCase() like :query', {params: {query: query}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return number of subtasks related to a user
  getNumSubtasks: function(resourceId, taskId, type){
    var result = Async.runSync(function(done){
      db.query("select count(*) from task where (resourceId = :resourceId and :taskId in in('hasSubtask') and type = :type)", {params: {resourceId: resourceId, taskId: taskId, type: type}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return a tasks metadata
  getTaskData: function(resourceId, taskId){
    var result = Async.runSync(function(done){
      db.query("select images, technologies, difficulty, time from hasTask where (:resourceId in out and :taskId in in)", {params: {resourceId: resourceId, taskId: taskId}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to return a tasks title
  getTaskTitle: function(taskId){
    var result = Async.runSync(function(done){
      db.query('select title from task where @rid = :taskId', {params: {taskId: taskId}})
      .then(function(response){done(null, response); });
    });
    return result.result;
  },
  // Method to create a task
  createTask: function(task, technologies, companyId, resourceId, difficulty, time, subtasks){
    var date = new Date();
    var taskId, technologyId;
    if(technologies)
      technologies = technologies.split(",");
    db.query('select from task where (companyId = :companyId and resourceId = :resourceId and title.toLowerCase() = :task)', {params: {companyId: companyId, resourceId: resourceId, task: task.toLowerCase()}})
    .then(Meteor.bindEnvironment(function(response){
      if(response.length > 0){
        taskId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
        db.query('update task increment usedCount = 1 where @rid = :taskId', {params: {taskId: taskId}});
      }
      else{
        db.query('insert into task (createdAt, title, type, companyId, resourceId, usedCount) values (:date, :task, "task", :companyId, :resourceId, 1)', {params: {date: date, task: task, companyId: companyId, resourceId: resourceId}})
        .then(function(response){
          taskId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
        });
      }

      var taskInterval = setInterval(Meteor.bindEnvironment(function(){
        if(taskId){
          clearInterval(taskInterval);

          db.query('create edge hasTask from (select from user where @rid = :resourceId) to (select from task where @rid = :taskId) set technologies = :technologies, difficulty = :difficulty, time = :time', {params: {taskId: taskId, resourceId: resourceId, technologies: technologies, difficulty: difficulty, time: time}});
          if(technologies){
            technologies.forEach(function(value, index){
              db.query('select from technology where title.toLowerCase() = :technology', {params: {technology: value.toLowerCase()}})
              .then(function(response){
                if(response.length > 0){
                  technologyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                  db.query('update technology increment usedCount = 1 where @rid = :technologyId', {params: {technologyId: technologyId}});
                  db.query('create edge usesTechnology from (select from task where @rid = :taskId) to (select from technology where @rid = :technologyId)', {params: {taskId: taskId, technologyId: technologyId}});
                }
                else{
                  db.query('insert into technology (createdAt, title, usedCount) values (:date, :technology, 1)', {params: {date: date, technology: value}})
                  .then(function(response){
                    technologyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                    db.query('create edge usesTechnology from (select from task where @rid = :taskId) to (select from technology where @rid = :technologyId)', {params: {taskId: taskId, technologyId: technologyId}});
                  });
                }
              });
            });
          }
          if(subtasks.length > 1){
            subtasks.forEach(Meteor.bindEnvironment(function(value, index){
              Meteor.call('createSubtask', value.task, value.technologies, companyId, value.resourceId, value.difficulty, value.time, value.subtasks, taskId);
            }));
          }
        }
      }, 100));
    }));
  },
  // Method to create a subtask
  createSubtask: function(task, technologies, companyId, resourceId, difficulty, time, subtasks, parentTask){
    var date = new Date();
    var taskId, technologyId;
    if(technologies)
      technologies = technologies.split(",");
    db.query('select from task where (companyId = :companyId and resourceId = :resourceId and title.toLowerCase() = :task)', {params: {companyId: companyId, resourceId: resourceId, task: task.toLowerCase()}})
    .then(Meteor.bindEnvironment(function(response){
      if(response.length > 0){
        taskId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
        db.query('update task increment usedCount = 1 where @rid = :taskId', {params: {taskId: taskId}});
      }
      else{
        db.query('insert into task (title, type, companyId, resourceId, usedCount) values (:task, "subtask", :companyId, :resourceId, 1)', {params: {task: task, companyId: companyId, resourceId: resourceId}})
        .then(function(response){
          taskId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
        });
      }
      var subtaskInterval = setInterval(Meteor.bindEnvironment(function(){
        if(taskId){
          clearInterval(subtaskInterval);

          db.query('create edge hasTask from (select from user where @rid = :resourceId) to (select from task where @rid = :taskId) set technologies = :technologies, difficulty = :difficulty, time = :time', {params: {taskId: taskId, resourceId: resourceId, technologies: technologies, difficulty: difficulty, time: time}});
          db.query('create edge hasSubtask from (select from task where @rid = :parentTaskId) to (select from task where @rid = :subtaskId)', {params: {parentTaskId: parentTask, subtaskId: taskId}});
          if(technologies){
            technologies.forEach(function(value, index){
              db.query('select from technology where title.toLowerCase() = :technology', {params: {technology: value.toLowerCase()}})
              .then(function(response){
                if(response.length > 0){
                  technologyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                  db.query('update technology increment usedCount = 1 where @rid = :technologyId', {params: {technologyId: technologyId}});
                  db.query('create edge usesTechnology from (select from task where @rid = :taskId) to (select from technology where @rid = :technologyId)', {params: {taskId: taskId, technologyId: technologyId}});
                }
                else{
                  db.query('insert into technology (title, usedCount) values (:technology, 1)', {params: {technology: value}})
                  .then(function(response){
                    technologyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                    db.query('create edge usesTechnology from (select from task where @rid = :taskId) to (select from technology where @rid = :technologyId)', {params: {taskId: taskId, technologyId: technologyId}});
                  });
                }
              });
            });
          }
          if(subtasks.length > 1){
            subtasks.forEach(Meteor.bindEnvironment(function(value, index){
              Meteor.call('createNestedSubtask', value.task, value.technologies, companyId, value.resourceId, value.difficulty, value.time, taskId);
            }));
          }
        }
      }, 100));
    }));
  },
  // Method to create a nested subtask
  createNestedSubtask: function(task, technologies, companyId, resourceId, difficulty, time, parentTask){
    var date = new Date();
    var taskId, technologyId;
    if(technologies)
      technologies = technologies.split(",");
    db.query('select from task where (companyId = :companyId and resourceId = :resourceId and title.toLowerCase() = :task)', {params: {companyId: companyId, resourceId: resourceId, task: task.toLowerCase()}})
    .then(function(response){
      if(response.length > 0){
        taskId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
        db.query('update task increment usedCount = 1 where @rid = :taskId', {params: {taskId: taskId}});
      }
      else{
        db.query('insert into task (title, type, companyId, resourceId, usedCount) values (:task, "nestedtask", :companyId, :resourceId, 1)', {params: {task: task, companyId: companyId, resourceId: resourceId}})
        .then(function(response){
          taskId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
        });
      }
      var nestedSubtaskInterval = setInterval(function(){
        if(parentTask && taskId){
          clearInterval(nestedSubtaskInterval);


          db.query('create edge hasTask from (select from user where @rid = :resourceId) to (select from task where @rid = :taskId) set technologies = :technologies, difficulty = :difficulty, time = :time', {params: {taskId: taskId, resourceId: resourceId, technologies: technologies, difficulty: difficulty, time: time}});
          db.query('create edge hasSubtask from (select from task where @rid = :parentTaskId) to (select from task where @rid = :subtaskId)', {params: {parentTaskId: parentTask, subtaskId: taskId}});
          if(technologies){
            technologies.forEach(function(value, index){
              db.query('select from technology where title.toLowerCase() = :technology', {params: {technology: value.toLowerCase()}})
              .then(function(response){
                if(response.length > 0){
                  technologyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                  db.query('update technology increment usedCount = 1 where @rid = :technologyId', {params: {technologyId: technologyId}});
                  db.query('create edge usesTechnology from (select from task where @rid = :taskId) to (select from technology where @rid = :technologyId)', {params: {taskId: taskId, technologyId: technologyId}});
                }
                else{
                  db.query('insert into technology (title, usedCount) values (:technology, 1)', {params: {technology: value}})
                  .then(function(response){
                    technologyId = "#" + response[0]['@rid']['cluster'] + ":" + response[0]['@rid']['position'];
                    db.query('create edge usesTechnology from (select from task where @rid = :taskId) to (select from technology where @rid = :technologyId)', {params: {taskId: taskId, technologyId: technologyId}});
                  });
                }
              });
            });
          }
        }
      }, 100);
    });
  },
  // update hasTask add technologies=windows where @rid = "#20.0"
  // update hasTask add technologies = ["Windows"] where @rid = "#20:0"
  ///// Technology Methods

  // Method to return all technologies
  getTechnologies: function(){
    var result = Async.runSync(function(done){
      db.query('select title, usedCount from technology')
      .then(function(response){done(null, response); });
    });
    return result.result;
  },

  ///// Mail / Message Methods

  // Method to send an email
	sendEmail: function(from, to, subject, body){
    Email.send({
      from: from,
      to: to,
      subject: subject,
      text: body
    });
  },

  ///// Other Methods /////

  //Method to attach an image to a task
  attachImage: function(resourceId, taskId, imageId){
    db.query('update hasTask add images = [:imageId] where (:resourceId in out and :taskId in in)', {params: {resourceId: resourceId, taskId: taskId, imageId: imageId}});
  }
})