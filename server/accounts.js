;(function(){

"use strict";

Meteor.startup(function () {

    //Prevent non-authorized user creation
    Accounts.validateNewUser(function(){
        /*
        var loggedInUser = Meteor.user();

        if(Roles.userIsInRole(loggedInUser, [ 'admin' ])){
            return true;
        }

        throw new Meteor.Error(403, "Not authorized to create new users");
        */
        return true;
    });

    Accounts.onCreateUser(function(options, user){
        //todo: Add additional values we need...
        //e.g Points etc.    

        user.exp = 0;
        user.level = 0;
        user.resources = {
            "credits" : 0
        };

        if(options.profile){
            user.profile = options.profile;
        }
        
        return user;
    });
    
});

})();
