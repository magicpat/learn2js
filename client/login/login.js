;(function(){

"use strict";

function routeUser(user){
        var rolePaths = [
            { roles : ["admin"], route : "admin" },
            { roles : ["teacher"], route : "courses" },
            { roles : ["student"], route : "dashboard"},
        ];

        //Redirect users of specific roles to a specific page
        _.each(rolePaths, function(rp){
            if(Roles.userIsInRole(user, rp.roles)){
                Router.go(rp.route);
            }
        });
}

Template.login.events({
    "submit #login-form" : function(e, tmpl){
        e.preventDefault();

        var email = tmpl.find("#login-email").value;
        var password = tmpl.find("#login-password").value;

        //todo: Trimming and validation
       
        Meteor.loginWithPassword(email, password, function(err){
            if(err){
                Session.set("alertMessage", "Wrong email or password!");
            }
            else{
                routeUser(Meteor.user());
            }
        });

        return false;
    }
});

Template.login.helpers({
    alertMessage : function(){
        return Session.get("alertMessage");
    }
});

}());
