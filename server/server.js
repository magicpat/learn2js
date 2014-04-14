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
        //Get the JSON data from the /private dir
        var users = JSON.parse(Assets.getText("default_users.json"));

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

    var createDefaultCourses = function(){
        console.log('Creating default courses...');

        var courses = JSON.parse(Assets.getText("default_courses.json"));

        var teacherid = Meteor.users.findOne({username : "teacher"});
        _.each(courses, function(course){
            course.userid = teacherid._id;
            Courses.insert(course);
        });
    };

    var createDefaultGameObjects = function(){
        console.log("Creating Default Game Objects....");
        //Get the JSON data from the /private dir
        var gobjects = JSON.parse(Assets.getText("game_objects.json"));

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

        if(!Courses.find().fetch().length){
            createDefaultCourses();
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

        // ALLOW RULES

        //Allow creators edit their own courses
        Courses.allow({
            insert : function(userId, doc){
                return doc.userid === userId && Roles.userIsInRole(userId, [ 'teacher']);
            },
            update : function(userId, doc){
                return userId === doc.userid;
            }
        });
    });
    

    //PUBLISH ALL THE THINGS
    Meteor.publish("userData", function(){
        return Meteor.users.find({ roles : ["student"] },
                                 {
                                     fields : {
                                         "username" : 1,
                                         "resources" : 1,
                                         "exp" : 1,
                                         "level" : 1
                                     }
                                 });
    });

    Meteor.publish("createdCourses", function(){
        return Courses.find({ userid : this.userId});
    });

    Meteor.publish("publishedCourses", function(){
        return Courses.find({ published : true}, { fields : { "correctAnswers" : 0 } });
    });

    //Give access to all game objects, since all data is needed (and not too much) 
    Meteor.publish("gameObjects", function(){
        return GObjects.find({});
    });

    Meteor.publish("tiles", function(userid){
        return Tiles.find({userid : userid});
    });
}




}());
