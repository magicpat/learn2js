;(function(){

"use strict";

Template.courses.events({
    "click  a.c-unpublish" : function(e, tpl){
        var courseid = $(e.target).data("courseid");

        Courses.update({_id : courseid}, { $set : {published : false}});
    },
    "click  a.c-publish" : function(e, tpl){
        var courseid = $(e.target).data("courseid");

        Courses.update({_id : courseid}, { $set : {published : true}});
    }

});

Template.courses.helpers({
    "courses" : function(){
        return Courses.find({});
    }
});



})();
