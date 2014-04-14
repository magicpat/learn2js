;(function(){

"use strict";

Template.ranking.helpers({
    "users" : function(){
        var users = Meteor.users.find({},{ sort : {
                                            exp : -1,
                                            "resources.cash" : -1
                                          }})
                                .map(function(doc, index, cursor) {
                                    var i = _.extend(doc, {rank: index+1});
                                    return i;
                                });
        return users;
    }
});

})();
