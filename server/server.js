;(function(){

"use strict";

//User-Roles
//Admin (Capable of editing everything, but mostly used 
//       for user administration)
//Teacher (Creates courses, can attend courses)
//Student (Can access courses) 

if (Meteor.isServer) {
    Meteor.startup(function () {
        //If there is no user yet
        //You may dump the database first, so the users get created
        //With CLI command 'meteor reset'
        if(Meteor.users.find().fetch().length === 0){
            console.log('Creating default users..');
            
            var users = [
                {
                    name : "Admin",
                    email : "admin@learn2js.at",
                    roles : [ "admin" ]
                },
                {
                    name : "Teacher",
                    email : "teacher@learn2js.at",
                    roles : [ "teacher" ]
                },
                {
                    name : "Student",
                    email : "student@learn2js.at",
                    roles : [ "student" ]
                }
            ];

            //Create all default users
            _.each(users, function(user){
                var id = Accounts.createUser({
                    email: user.email,
                    password: "password",
                    profile: { name : user.name }
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

    });
}

}());
