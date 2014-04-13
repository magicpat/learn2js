/* global L2JSUtil : true */

L2JSUtil = null;

;(function(){

"use strict";

function hasResources(user, gobject){
    var ret = true;

    //Check resource dependencies
    _.map(gobject.requirements.resources, function(req, key){
        if(user.resources[key] < req){
            ret = false;
            return;
        }
    });

    return ret;
}

/**
 * Returns true if all object dependencies are met 
 **/
function hasRequiredObjects(user, gobject, ownedGObjects){
    var ret = true;
    var dep = gobject.requirements.dependencies;

    //Game objects with no requirements always fulfill requirements
    if(!dep || dep.length === 0){
        return true;
    }
    
    //Check object dependencies (required buildings)
    _.map(dep, function(objectid){
        //If the user does not own this object
        if(!_.contains(ownedGObjects, objectid)){
            ret = false;
            return;
        }
    });

    return ret;
}

/**
 * Utility method for ALL dependencies
 **/
function hasAllRequirements(user, gobject, ownedGObjects){
    return hasResources(user, gobject) && hasRequiredObjects(user, gobject, ownedGObjects);
}

L2JSUtil = {
    "hasResources" : hasResources,
    "hasRequiredObjects" : hasRequiredObjects,
    "hasAllRequirements" : hasAllRequirements
};

})();

