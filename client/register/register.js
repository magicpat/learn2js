;(function(){

"use strict";

function highlightError(element, errorClass, validClass){
    $(element).closest('.form-group')
              .removeClass(validClass)
              .addClass(errorClass);
}

function highlightSuccess(element, errorClass, validClass){
    var $element = $(element);
    $element.closest('.form-group')
              .removeClass(errorClass)
              .addClass(validClass);

    $element.tooltip('destroy');
}

function placeError(element, errText){
    //Initialize the tooltip to show the error
    $(element).tooltip({
        title : errText,
        placement : "top",
        trigger : "focus"
    });
}

var validClass = "has-success";
var errorClass = "has-error";


Template.register.events({
    "submit #register-form" : function(e, tpl){
        e.preventDefault();

        //From here, jquery-validation validated what it was capable of.
        //Now, username and email should be checked for existence
        var email = tpl.find("#register-email");
        var username = tpl.find("#register-username");
        var password = tpl.find("#register-password");
        var passwordRepeat = tpl.find("#register-password-repeat");


        var params = {
            username : username.value,
            email : email.value,
            password : password.value
        };

        Accounts.createUser(params, function(err){
            if(err){
                switch(err.reason){
                    case "Username already exists.":
                        placeError(username, err.reason);
                        highlightError(username, errorClass, validClass);
                        break;
                    case "Email already exists.":
                        placeError(email, err.reason);
                        highlightError(email, errorClass, validClass);
                        break;
                    default:
                        throw err;
                }
            }
            else{
                Router.go("dashboard");
            }
        });
    }
});

//Initialize tooltips etc.
Template.register.rendered = function(){
    
    //Enable parsley on the right form
    $("#register-form").validate({
        ignore: '*:not([name])',
        errorClass : errorClass,
        validClass : validClass,
        rules : {
            email: {
                required : true,
                email : true
            },
            username : {
                required : true,
                minlength : 3
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
                minlength : "Username has to be at least 3 characters long"
            },
            password : {
                required : "Password required",
            },
            "password_repeat" : {
                equalTo: "Passwords have to be equal"
            }
        },
        highlight: function(element, errorClass, validClass){
            highlightError(element, errorClass, validClass);
        },
        unhighlight: function(element, errorClass, validClass){
            highlightSuccess(element, errorClass, validClass);
        },
        errorPlacement: function(error, element){
            placeError(element, error.text());
        }
    });
};

})();
