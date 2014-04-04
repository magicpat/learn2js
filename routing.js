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
    this.route("dashboard");
    this.route("admin");
    this.route("courses", {
        "onBeforeAction" : function(){
            console.log("courses onBeforeAction called");
        }
    });
});

Router.onBeforeAction(function(){
    if(Meteor.user()){
       this.redirect("home");
    }
}, {only: ["login", "register"]});

//Restrict public access to certain areas
Router.onBeforeAction(function(){
    if(!Meteor.loggingIn() && !Meteor.user()){
        this.redirect("login");
    }
}, {except: ["login", "register", "home"]});

//Prevent unprivileged users to enter the admin area
Router.onBeforeAction(function(){
    if(!Roles.userIsInRole(Meteor.user(), [ "admin" ])){
        this.redirect("/");
    }
}, {only: ["admin"]});
