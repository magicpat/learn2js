;(function(){

"use strict";

//Define RPC methods, which can be called by the client
Meteor.methods({
    usernameExists : function(username){
        var test = Meteor.users.find({"username" : username });
        console.log(test.fetch());
        return test.count() > 0;

    },
    emailExists : function(email){
        return Meteor.users.find({ "emails.address" : email }).count() > 0;
    }
});

})();
