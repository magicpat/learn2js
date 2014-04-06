;(function(){

"use strict";

Meteor.startup(function () {
    Handlebars.registerHelper("isRouteActive", function (route) {
        var current = Router.current();

        if(current && current.path === route){
            return "active";
        }

        return "";
    });
});

Template.rendered = function(){
};

})();
