/* global Tiles : true, GObjects : true, Courses : true*/

Courses = new Meteor.Collection("courses", {
    schema : new SimpleSchema({
        userid : {
            type : String,
            label : "ID of the creator user (teacher)",
            index : 1
        },
        name : {
            type : String,
            label : "Name of the course"
        },
        published : {
            type : Boolean,
            label : "If the course is available to play"
        },
        description : {
            type : String,
            label : "Short description of the course"
        },
        "questions.$.order" : {
            type : Number,
            label : "Question order in course"
        },
        "questions.$.htmlCode" : {
            type : String,
            label : "HTML Example Code",
            optional : true
        },
        "questions.$.jsCode" : {
            type : String,
            label : "Javascript Example Code",
            optional : true
        },
        "questions.$.cssCode" : {
            type : String,
            label : "CSS Example Code",
            optional : true
        },
        "questions.$.hint" : {
            type : String,
            label : "Hint if the student gets stuck",
            optional : true
        },
        "questions.$.difficulty" : {
            type : Number,
            label : "Difficulty Grade of the question (for points)",
            min : 0
        },
        "questions.$.aMethod" : {
            type : String,
            label : "ID for the answer method"
        },
        "questions.$.answers" : {
            type : [String],
        }
    })
});

Tiles = new Meteor.Collection("tiles",{
    schema : new SimpleSchema({
        userid : {
            type : String,
            label : "ID of the owning user",
            index : 1
        },
        gobjectid : {
            type : String,
            label : "ID of the game object",
            index : 1
        },
        posX : {
            type : Number,
            label : "X Position of the game object",
            min : 0
        },
        posY : {
            type : Number,
            label : "Y Position of the game object",
            min : 0
        }
    })
});

GObjects = new Meteor.Collection("gobjects", {
    schema : new SimpleSchema({
        "objectid" : {
            type : String,
            label : "ObjectId definition in game which should be rendered",
            index : 1
        },
        "description" : {
            type : String,
            label : "Game description of the object"
        },
        "requirements.level": {
            type : Number,
            label : "Required level of the user",
            min : 0
        },
        "requirements.resources.credits" : {
            type : Number,
            label : "Required credits for the game object",
            min : 0
        },
        "requirements.dependencies" : {
            type: [String],
            optional : true,
            label : "Array of GObject names, which this GObject depends on"
        },
        "reward.exp" : {
            type : Number,
            label : "Experience reward of the game object",
            min : 0
        },
        "gui.inMenu" : {
            type : Boolean,
            label : "True, if this item should be rendered in the buildmenu"
        },
        "gui.menuPos" : {
            type : Number,
            label : "Order position of this item in the buildmenu",
            min : 0,
            optional : true
        },
        "gui.menuClass" : {
            type : String,
            label : "CSS Class for the buildmenu"
        }
    })
});
