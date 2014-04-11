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

    Handlebars.registerHelper('addIndex', function(list) {
        var result = [];

        var count = 0;
        _.each(list, function(value, key){
            value._index = count++;
            result.push(value);
        });

        return result;
    });

    Handlebars.registerHelper("moduloEquals", function(base, modulo){
       return (base % modulo) === 0;
    });
});

Template.rendered = function(){
};

})();
