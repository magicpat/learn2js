;(function(){

"use strict";

function validateInput(username, email, password, passwordRepeat){
    var errors = [];
   
    Meteor.call("usernameExists", username, function(err, result){
                          
        console.log(result);
    });

    if(Meteor.call("usernameExists", username)){
        errors.push({ message : "Username already in use"});
    }

    if(Meteor.call("emailExists", email)){
        errors.push({ message : "Email already in use"});
    }
    
    if(password !== passwordRepeat){
       errors.push({ message : "Passwords do not match"});
    }

    Session.set("errors", errors);

    return errors;
}

Template.register.events({
    "submit #register-form" : function(e, tpl){
        e.preventDefault();
        var email = tpl.find("#register-email").value;
        var username = tpl.find("#register-username").value;
        var password = tpl.find("#register-password").value;
        var passwordRepeat = tpl.find("#register-password-repeat").value;

        if(password !== passwordRepeat){
            return new Meteor.Error(201, "Passwords do not match!");
        }

        var params = {
            username : username,
            email : email,
            password : password
        };

        Accounts.createUser(params, function(err){
            if(err){
                throw new Meteor.Error(400, "User registration failed");
            }
            else{
                Router.go("home");
            }
        });
    }
});

//Initialize tooltips etc.
Template.register.rendered = function(){
    //Enable parsley on the right form
    $("#register-form").validate({
        ignore: '*:not([name])',
        errorClass : "has-error",
        validClass : "has-success",
        rules : {
            email: {
                required : true,
                email : true
            },
            username : {
                required : true
            },
            password : {
                required : true,
            },
            "password_repeat" : {
                equalTo: "#register-password"
            }
        },
        messages : {
            email: {
                required: "Email required",
                email: "Not a valid email address"
            },
            username : {
                required : "Username required",
            },
            password : {
                required : "Password required",
            },
            "password_repeat" : {
                equalTo: "Passwords have to be equal"
            }
        },
        highlight: function(element, errorClass, validClass){
            $(element).closest('.form-group')
                      .removeClass(validClass)
                      .addClass(errorClass);

        },
        unhighlight: function(element, errorClass, validClass){
            $(element).closest('.form-group')
                      .removeClass(errorClass)
                      .addClass(validClass);

            $(element).tooltip('destroy');
        },
        errorPlacement: function(error, element){
            //Initialize the tooltip to show the error
            $(element).tooltip({
                title : error.text(),
                placement : "top",
                trigger : "focus"
            });
        }
    });
};

})();
