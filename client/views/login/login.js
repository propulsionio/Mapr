/////////////// Functions / Helpers ///////////////

// Checks for a verify email token and verifies the account email if found
if(Accounts._verifyEmailToken){
  Accounts.verifyEmail(Accounts._verifyEmailToken, function(err){
    if(err)
      FlashMessages.sendError("<b>Error</b>. Account Not Verified.");
    else
      FlashMessages.sendSuccess("<b>Success</b>. Account Verified.");
  });
}

// Checks for an enroll account token and brings user to password reset screen if found
if(Accounts._enrollAccountToken){
  Session.set('resetPassword', Accounts._enrollAccountToken);
  Router.go("/forgotPassword");
}

// Checks for a forgot password token and brings user to password reset screen if found
if(Accounts._resetPasswordToken){
  Session.set('resetPassword', Accounts._resetPasswordToken);
  Router.go("/forgotPassword");
}

// Function to check for a valid password during user registration
isValidPassword = function(password, confirmPassword){
  if(password.length < 8){
    $('#error').html("Password must be longer than 8 characters");
    return false;
  }
  else if(password != confirmPassword){
    $('#error').html("Passwords must match");
    return false;
  }
  return true;
};

// Helper to mark a session variable as a password reset token
Template.registerHelper("resetPassword", function(){
  return Session.get('resetPassword');
});

// Helper to insert proper HTML into page depending on user creating or joining company
Template.registerHelper("registerCompanySection", function(){
  return Session.get('registerCompanySection');
});

// Helper to add professiosn list to typeahead
Template.register.helpers({
  professionsTypeahead: function(query, sync, callback) {
    Meteor.call('getTypeaheadProfessions', query, {}, function(err, result){
      if(err){
        console.log(err);
        return;
      }
      callback(result.map(function(v){ return {value: v.title}; }));
    });
  }
});


/////////////// Rendered ///////////////

Template.register.rendered = function() {
  Meteor.typeahead.inject();
};


/////////////// Events ///////////////

///// Log In Template Events
Template.logIn.events({
  // Event to handle the submit of the login form
  'submit #loginForm': function(e, t){
    e.preventDefault();
    var email = t.find('#loginEmail').value, password = t.find('#loginPassword').value;
    Meteor.loginWithPassword(email, password, function(err){
      if(err){
        FlashMessages.sendError("<b>Error</b>. Login failed. Please try again.");
        $('#error').html(err.reason);
      }
      else
        Router.go("/");
    });
    return false; 
  }
});

///// Register Template Events
Template.register.events({
  // Event to handle the click of the add new member button
  'click #addNewMember': function(e, t){
    var id = Random.id([10]);
    $('#addNewMember').before("<div class='new-member-section' id="+id+"><div class='form-group'><label>EMAIL</label><input type='email' class='form-control' name='registerCompanyEmailsArray' placeholder='Enter member email'></div><div class='form-group'><label>NAME</label><div class='row'><div class='col-md-6'><input type='text' class='form-control' name='registerCompanyFirstNamesArray' placeholder='First Name'></div><div class='col-md-6'><input type='text' class='form-control' name='registerCompanyLastNamesArray' placeholder='Last Name'></div></div></div><div class='form-group'><label>PROFESSION</label><input type='text' class='form-control typeahead typeahead-"+id+"' name='registerCompanyProfessionsArray' placeholder='Profession' data-source='professionsTypeahead'></div><div class='form-group'><label>EXPERIENCE</label><select class='form-control' name='registerCompanyExperiencesArray'><option value=''>Select Experience Range</option><option>0-3 Years</option><option>3-6 Years</option><option>6-10 Years</option><option>10+ Years</option></select></div><div class='form-group'><label>HOURLY WAGE</label><input type='number' class='form-control' name='registerCompanyWagesArray' placeholder='Hourly Wage'></div><button type='button' class='btn btn-default btn-block removeNewMember' data-id="+id+">Remove Member</button></div>");
    $("input[name='registerCompanyEmailsArray']:last").focus();
    Meteor.typeahead.inject('input.typeahead-' + id);
  },
  // Event to handle the click of the remove member button
  'click .removeNewMember': function(e, t){
    $('#' + e.currentTarget.dataset.id).remove();
  },
  // Event to handle the submit of the register form
  'submit #registerForm': function(e, t){
    e.preventDefault();
    var email = t.find('#registerEmail').value, password = t.find('#registerPassword').value, 
    confirmPassword = t.find('#registerConfirmPassword').value, firstName = t.find('#registerFirstName').value, 
    lastName = t.find('#registerLastName').value, profession = t.find('.typeahead.tt-input').value,
    experience = t.find('#registerExperience').value, wage = t.find('#registerWage').value,
    companyName = t.find('#registerCompanyName').value, companyCity = t.find('#registerCompanyCity').value, 
    companyState = t.find('#registerCompanyState').value, companyZipcode = t.find('#registerCompanyZipcode').value, 
    companyMembers = [{email: email, firstName: firstName, lastName: lastName, profession: profession, experience: experience, wage: wage, role: "owner"}];
    $("input[name='registerCompanyEmailsArray']").each(function(index){
      if($(this).val()){
        companyMembers[index + 1] = {role: "member"};
        companyMembers[index + 1]['email'] = $(this).val();
      }
    });
    $("input[name='registerCompanyFirstNamesArray']").each(function(index){
      if($(this).val())
        companyMembers[index + 1]['firstName'] = $(this).val();
    });
    $("input[name='registerCompanyLastNamesArray']").each(function(index){
      if($(this).val())
        companyMembers[index + 1]['lastName'] = $(this).val();
    });
    $("input[name='registerCompanyProfessionsArray']").each(function(index){
      if($(this).val())
        companyMembers[index + 1]['profession'] = $(this).val();
    });
    $("select[name='registerCompanyExperiencesArray']").each(function(index){
      if($(this).val())
        companyMembers[index + 1]['experience'] = $(this).val();
    });
    $("input[name='registerCompanyWagesArray']").each(function(index){
      if($(this).val())
        companyMembers[index + 1]['wage'] = $(this).val();
    });
    if(isValidPassword(password, confirmPassword)){
      Accounts.createUser({email: email, password: password}, function(err){
        if(err){
          FlashMessages.sendError("<b>Error</b>. Register failed. Please try again.");
          $('#error').html(err.reason);
        }
        else{
          Meteor.call('createCompany', companyName, companyCity, companyState, companyZipcode, companyMembers, function(err){
            if(err){
              FlashMessages.sendError("<b>Error.</b> " + err);
              return;
            }
            Router.go("/");
            FlashMessages.sendSuccess("<b>Success.</b> Account created.");
          });
        }
      });
    }
    return false;
  }
});

///// Forgot Password Tempalte Events
Template.forgotPassword.events({
  // Event to handle the submit of the forgot password form
  'submit #forgotPasswordForm': function(e, t){
    e.preventDefault();
    var type = t.find('#forgotType').value;
    if(type == "request"){
      var email = t.find('#forgotEmail').value
      Accounts.forgotPassword({email: email}, function(err){
        if(err){
          FlashMessages.sendError("<b>Error</b>. Please try again.");
          $('#error').html(err.reason);
        }
        else
          FlashMessages.sendSuccess("<b>Success.</b> Password reset link sent.");
      });
    }
    else if(type == "reset"){
      var password = t.find('#forgotPassword').value, confirmPassword = t.find('#forgotConfirmPassword').value;
      if(isValidPassword(password, confirmPassword)){
        Accounts.resetPassword(Session.get('resetPassword'), password, function(err){
          if(err){
            FlashMessages.sendError("<b>Error</b>. Please try again.");
            $('#error').html(err.reason);
          }
          else{
            Session.set('resetPassword', null);
            FlashMessages.sendSuccess("<b>Success.</b> Password reset.");
          }
        });
      }
    }
    return false;
  } 
});