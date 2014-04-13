;(function(){

"use strict";

//Define RPC methods, which can be called by the client
Meteor.methods({
    "addTile" : function(gobjectid, x, y){
        var user = Meteor.user();
        var gobject = GObjects.findOne({objectid : gobjectid});

        if(L2JSUtil.hasAllRequirements(user, gobject, null)){

            //Do not place if this place is already occupied
            if(Tiles.find({userid : user._id, posX : x, posY : y}).fetch().length){
                return false;
            }

            //Update users resources
            var newResources = {};
            _.each(user.resources, function(value, key){
                newResources[key] = value - gobject.requirements.resources[key]; 
            });
            
            //Will throw error if not possible to insert
            Tiles.insert({
                userid : user._id,
                gobjectid : gobjectid,
                posX : x,
                posY : y
            });

            Meteor.users.update({_id : user._id},
                                { $set : { resources : newResources} });
            return true;
        }
        return false;
    }
});

})();
