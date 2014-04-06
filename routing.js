//Configuration of the Iron Router
Router.configure({
    layoutTemplate : "mainlayout",
    loadingTemplate : "loading",
    notFoundTemplate : "notFound"
});

//Map all the routes
Router.map(function(){
    this.route("home", {path : "/"});
    this.route("login");
    this.route("register");
    this.route("dashboard",{
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
        },
        "onBeforeAction" : function(){
            if(!Meteor.loggingIn() && !Roles.userIsInRole(Meteor.user(), [ "admin" ])){
                this.redirect("/");
                this.pause();
            }
        }
    });
    this.route("courses");
});

//Route logged in users to their dashboard
Router.onBeforeAction(function(){
    if(!Meteor.loggingIn() && Meteor.user()){
       this.redirect("dashboard");
       this.pause();
    }
}, {only: ["login", "register"]});

//Route not logged in users to the login page (and give access to registration)
Router.onBeforeAction(function(){
    if(!Meteor.loggingIn() && !Meteor.user()){
        this.redirect("login");
        this.pause();
    }
}, {except: ["login", "register"]});
