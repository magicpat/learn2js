//Configuration of the Iron Router
Router.configure({
    layoutTemplate : "mainlayout",
    loadingTemplate : "loading",
    notFoundTemplate : "notFound"
});

//Map all the routes
Router.map(function(){
    this.route("home", {path : "/"});
    this.route("ranking", {
        waitOn: function(){
            this.subscribe("userData").wait();
        }
    });
    this.route("login");
    this.route("register");
    this.route("dashboard",{
        waitOn: function(){
            this.subscribe("userData").wait();
            this.subscribe("gameObjects").wait();
            this.subscribe("tiles", Meteor.user()._id).wait();
        },
        layoutTemplate: 'sidebarlayout',
        yieldTemplates: {
            'dashboardSidebar': {to: 'sidebar'},
        }
    });
    this.route("myaccount");
    this.route("admin", {
        layoutTemplate: 'sidebarlayout',
        yieldTemplates: {
            'adminSidebar': {to: 'sidebar'},
        }
    });
    this.route("courses", {
        waitOn : function(){
            this.subscribe("publishedCourses").wait();
        }
    });
    this.route("doCourse", {
        path : "courses/do/:_id",
        template : "quiz",
        waitOn : function(){
            this.subscribe("publishedCourses").wait();
        },
        data : function(){
            var course = Courses.findOne({_id : this.params._id});

            Session.set("course", course);
            return course;
        }
    });
    this.route("courses/admin", {
        template : "courses",
        waitOn : function(){
            this.subscribe("createdCourses").wait();
        },
        layoutTemplate: 'sidebarlayout',
        yieldTemplates: {
            'coursesSidebar': {to: 'sidebar'},
        }
    });
    this.route("courses/admin/new", {
        template : "coursesEdit",
        waitOn : function(){
            this.subscribe("createdCourses").wait();
        },
        layoutTemplate: 'sidebarlayout',
        yieldTemplates: {
            'coursesSidebar': {to: 'sidebar'},
        }
    });
    this.route("courseEdit", {
        path : "courses/admin/edit/:_id",
        template : "coursesEdit",
        waitOn : function(){
            this.subscribe("createdCourses").wait();
        },
        layoutTemplate: 'sidebarlayout',
        yieldTemplates: {
            'coursesSidebar': {to: 'sidebar'},
        },
        data : function(){
           return Courses.findOne({_id : this.params._id});
        }
    });
    //this.route("courses/play");
});

var requireTeacher = function(pause){
    if(!Meteor.loggingIn() && !Roles.userIsInRole(Meteor.user(), [ "teacher" ])){
        Router.go("/");
    }
};

var requireAdmin = function(pause){
    if(!Meteor.loggingIn() && !Roles.userIsInRole(Meteor.user(), [ "admin" ])){
        Router.go("/");
    }
};

var requireLogin = function(pause){
    if(!Meteor.loggingIn() && !Meteor.user()){
        Router.go("login");
    }
};

var requireLogout = function(pause){
    if(Meteor.user()){
        console.log("requireLogout called");
        Router.go("/");
    }
};

//Lock admin areas
Router.onBeforeAction(requireAdmin, { only : [ "admin" ] });

//Prevent logged in users to go to login / registration
//Router.onBeforeAction(requireLogout, {only : ["login", "register"]});

//Lock areas which require a login
Router.onBeforeAction(requireLogin, {except: ["login", "register"]});

//Lock teacher areas
Router.onBeforeAction(requireTeacher, {only : [ "courses/admin", "courses/admin/new" ]});
