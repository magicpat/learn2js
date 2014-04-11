;(function(){

"use strict";

//User-Roles
//Admin (Capable of editing everything, but mostly used 
//       for user administration)
//Teacher (Creates courses, can attend courses)
//Student (Can access courses) 

if (Meteor.isServer) {
    var createDefaultUsers = function(){
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
                    username: user.username
                });

                //Set email as verified, since we these mails don't really exist
                Meteor.users.update({_id : id},
                                    {$set:{'emails.0.verified' : true}});

                Roles.addUsersToRoles(id, user.roles );
            });
    };

    var createDefaultGameObjects = function(){
        console.log("Creating Default Game Objects....");
        var gobjects = [
            {
                name : "house0",
                description : "Basic housing for your people",
                requirements : {
                    level : 0,
                    credits : 100
                },
                reward : {
                    exp : 20
                },
                gui : {
                    inMenu : true,
                    menuPos : 1, 
                    menuClass : "fa fa-home fa-fw fa-3x lvl0",
                }
            },

            {
                name : "house1",
                description : "Extended housing for your people",
                requirements : {
                    level : 1,
                    credits : 100,
                    dependencies : [ "house0" ]
                },
                reward : {
                    exp : 1000
                },
                gui : {
                    inMenu : false,
                    menuClass : "fa fa-home fa-fw fa-3x lvl1"
                }
            },

            {
                name : "bar0",
                description : "Simple Bar, just for hanging out",
                requirements : {
                    level : 0,
                    credits : 200
                },
                reward : {
                    exp : 50
                },
                gui : {
                    inMenu : true,
                    menuPos : 2, 
                    menuClass : "fa fa-beer fa-fw fa-3x lvl1"
                }
            },

            {
                name : "library0",
                description : "Small library to lend some books",
                requirements : {
                    level : 0,
                    credits : 300,
                    dependencies : [ "house0", "bar0" ]
                },
                reward : {
                    exp : 100
                },
                gui : {
                    inMenu : true,
                    menuPos : 3, 
                    menuClass : "fa fa-book fa-fw fa-3x lvl1"
                }
            },
        ];

        _.each(gobjects, function(go){
           GObjects.insert(go);
        });
    };

    Meteor.startup(function () {
        //If there is no user yet
        //You may dump the database first, so the users get created
        //With CLI command 'meteor reset'
        if(!Meteor.users.find().fetch().length){
            createDefaultUsers();
        }

        //Create GObjects which can be used in the game
        if(!GObjects.find().fetch().length){
            createDefaultGameObjects();
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

//PUBLISH ALL THE THINGS

Meteor.publish("userData", function(){
    return Meteor.users.find({ _id: this.userId },
                             {
                                 "resources" : 1,
                                 "exp:" : 1,
                                 "level" : 1
                             });
});

Meteor.publish("courses", function(){
    var user = Meteor.users.findOne({_id:this.userId});
    if(user){
        return Courses.find({userid : this.userId});
    }
    this.stop();
    return;
});

//Give access to all game objects, since all data is needed (and not too much) 
Meteor.publish("gameObjects", function(){
    return GObjects.find({});
});

}());
