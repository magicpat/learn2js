;(function(){

"use strict";

Template.coursesNew.helpers({
    "course" : function(){
        return Session.get("course");
    }
});

Template.coursesNew.rendered = function(){
    var course= Session.get("course");
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
        Session.set("course");
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
