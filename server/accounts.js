;(function(){

"use strict";

Meteor.startup(function () {
    //If there is no user yet
    //You may dump the database first, so the users get created
    //With CLI command 'meteor reset'
    if(Meteor.users.find().fetch().length === 0){
        console.log('Creating default users..');
        
        var users = [
            {
                username : "admin",
                email : "admin@learn2js.at",
                roles : [ "admin" ]
            },
            {
                username : "teacher",
                email : "teacher@learn2js.at",
                roles : [ "teacher" ]
            },
            {
                username : "student",
                email : "student@learn2js.at",
                roles : [ "student" ]
            }
        ];

        //Create all default users
        _.each(users, function(user){
            var id = Accounts.createUser({
                email: user.email,
                password: "password",
                username : user.username
            });

            //Set email as verified, since we these mails don't really exist
            Meteor.users.update({_id : id},
                                {$set:{'emails.0.verified' : true}});

            Roles.addUsersToRoles(id, user.roles );
        });
    }

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
        
        if(options.profile){
            user.profile = options.profile;
        }
        
        return user;
    });
});

})();
