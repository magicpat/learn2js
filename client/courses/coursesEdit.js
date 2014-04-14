;(function(){

"use strict";

Template.coursesEdit.helpers({
    "course" : function(){
        return Session.get("course");
    }
});

Template.coursesEdit.events({
    "click #save" : function(evt, tpl){
        //TODO: fetch data from interface and insert data in db
    }
});

Template.coursesEdit.rendered = function(){
    var course= Session.get("course");
    //Tells if there should be a question-save-dialog before leaving the page
    var persisted = true;
    if(!course){
        course = {
            userId : Meteor.user(),
            name : "New Course",
            published : false,
            description : "",
            questions : [ {
                order : 1,
                htmlCode : "",
                jsCode : "",
                cssCode : "",
                hint : "",
                difficulty : 0,
                aMethod : 0,
                answers : []
            }]
        };
        persisted = false;
        Session.set("course");
        Session.set("persisted", persisted);
    }

    console.log("course");
    
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/xcode");
    editor.getSession().setMode("ace/mode/javascript");
    //editor.setReadOnly(true);
    //editor.setHighlightActiveLine(false);
    editor.getSession().on('change', function(e) {

    });
}

})();
