;(function(){

"use strict";

Template.navigation.events({
    "click #logout-link" : function(e, tpl){
        e.preventDefault();
        Meteor.logout(function(){
            
        });
    }
});

})();
