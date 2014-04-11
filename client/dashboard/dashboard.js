/* global L2JSGame : false */
;(function(){

"use strict";

Template.buildmenu.events({
    //"mouseover .bm-item" : function(evt, tpl){
        //evt.preventDefault();
   
        //console.log(evt);
        //console.log(evt.target);
        //var goItem = $(tpl).find(evt.target);
        //console.log(goItem);
        //var goName = $(tpl).find(evt.target).data("name");
        //var description = $(evt.target).data("description");

        //console.log(description);
        //$(tpl).find("#bm-footer").text(description);
    //},
    //"click .bm-item" : function(evt, tpl){
        //console.log("Click");
    //}
});

function initUI(game){

    //Reusable DOM elements
    var $bmFooter = $("#bm-footer");
    var $curSelection;

    //Classes
    var activeClass = "bm-active";

    function resetBuildmode(){
        $(".bm-item").removeClass(activeClass);
        game.disableBuildMode();
    }

    //Show item description in BM footer on Hover
    $(".bm-item").on("mouseover", function(e){
        if(game.isInBuildMode()){
            return;
        }
        var $item = $(this);
        var description = $item.data("description");
        console.log("foo");
        $bmFooter.text(description);
    });

    //Switch to build mode after clicking a BM-Item
    $(".bm-item").on("click", function(e){
        var $item = $(this);

        if($curSelection && $curSelection[0] === $item[0]){
            console.log("equal");
        }
        
        //Disable highlighting of last active selection
        if($curSelection){
            $item.removeClass(activeClass);
        }

        $item.addClass(activeClass);
        var name = $item.data("name");

        game.enableBuildMode(name);
        $bmFooter.text("Press [ESC] to cancel...");
        $curSelection = $item;
    });
}

Template.dashboard.rendered = function(){
    var canvas = document.getElementById("game-canvas");
    
    var game = new L2JSGame(canvas);

    //TODO: retrieve list of already placed objects
    game.init();
    initUI(game);
};

Template.buildmenu.helpers({
    "buildmenuItems" : function(){
        return Session.get("buildmenuItems");
    }
});

Template.dashboard.created = function(){
    var user = Meteor.user();

    //Preload the buildmenu items of the game objects (sorted by position) 
    var gobjects = GObjects.find({"gui.inMenu" : true},
                                 {sort: {"gui.menuPos": 1}}).fetch();

    var buildmenuItems = [];

    _.each(gobjects, function(go){
        var req = go.requirements;

        //Marks if there are enough resources
        var available = true;

        //Marks if the item is displayed as ?
        var questionmark = true;

        if(user.level >= req.level){
            questionmark = false;
        }
        _.map(user.resources, function(value, key){
            if(req[key] && req[key] > value){
                available = false;
            }
        });

        //Add available flag to GO, to put it in the session
        go.available = available;
        go.questionmark = questionmark;
        buildmenuItems.push(go);
    });

    Session.set("buildmenuItems", buildmenuItems);
};

})();
