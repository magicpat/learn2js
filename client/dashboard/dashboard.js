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
    var user = Meteor.user();

    //Reusable DOM elements
    var $bmFooter = $("#bm-footer");
    var $curSelection;

    //Classes
    var activeClass = "bm-active";
    var insuffClass = "bm-insufficient";

    //Cache all game objects
    var gobjectsMap = {};
    _.each(GObjects.find({}).fetch(), function(go){
       gobjectsMap[go.objectid] = go;
    });

    function setBMFooterText(text){
        $bmFooter.html(text);
    }

    function resetBuildmode(){
        $(".bm-item").removeClass(activeClass);
        game.disableBuildmode();
        setBMFooterText("Build cubes!");
    }

    function initTiles(){
        var tiles = Tiles.find({userid : user._id});
        game.loadMatrix(tiles.fetch());
        game.redraw();
    }

    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            if(game.isInBuildMode()){
                resetBuildmode();
            }
        }
    });

    //Show item description in BM footer on Hover
    $(".bm-item").on("mouseover", function(){
        if(game.isInBuildMode()){
            return;
        }
        var $item = $(this);
        var description = $item.data("description");

        var gobject = gobjectsMap[$item.data("objectid")];

        var insufficient = !L2JSUtil.hasResources(user, gobject);
        if(insufficient){
            $item.addClass(insuffClass);
        }

        var reqCredits = gobject.requirements.resources.credits;
        var resText = "(Credits: " + reqCredits + ((insufficient)? " ! " : "") + ")"; 
        setBMFooterText(description + "<br>" + resText);
    });

    $(".bm-item").on("mouseout", function(){
        $(".bm-item").removeClass(insuffClass);
    });

    //Switch to build mode after clicking a BM-Item
    $(".bm-item").on("click", function(){
        var $item = $(this);

        var gobjectid = $item.data("objectid");
        var gobject = gobjectsMap[gobjectid];

        //Disable highlighting of last active selection
        if($curSelection){
            resetBuildmode();
        }

        //If not enough resources, don't even go in buildmode
        if(!L2JSUtil.hasResources(user, gobject)){
            setBMFooterText("Not enough resources!");
            return;
        }

        //TODO: LOAD ALL ELEMENTS THE USER OWNS (replace null)
        if(!L2JSUtil.hasRequiredObjects(user, gobject, null)){
            setBMFooterText("You need other buildings first!");
            return;
        }

        $item.addClass(activeClass);

        game.enableBuildMode(gobjectid);
        setBMFooterText("Press [ESC] to cancel...");

        $curSelection = $item;
    });

    //Manage clicks on the canvas
    $("#game-canvas").on("click", function(e){
        e.preventDefault();

        //If there is no buildmode enabled, stop it
        if(!game.isInBuildMode()){
            return;
        }

        //Get clicked X and Y of map
        var mapPos = game.getClickedCoordinates(e);

        //If the click was outside of the map, ignore it
        if(mapPos.outside){
            return;
        }

        //Check if the user has enough resources
        var gobject = gobjectsMap[$curSelection.data("objectid")];

        if(!L2JSUtil.hasResources(user, gobject)){
            setBMFooterText("Not enough resources!");
            return;
        }

        //TODO: LOAD ALL ELEMENTS THE USER OWNS (replace null)
        if(!L2JSUtil.hasRequiredObjects(user, gobject, null)){
            setBMFooterText("You need other buildings first!");
            return;
        }

        //Otherwise let the build commence
        var gobjectid = gobject.objectid;

        Meteor.call("addTile", gobjectid, mapPos.x, mapPos.y, function(err, success){
            if(err){
                setBMFooterText("Error! Cube could not be created");
                return;
            }
            if(!success){
                setBMFooterText("Place already occupied!");
                return;
            }

            game.placeObject(gobjectid, mapPos.x, mapPos.y);
        });
    });

    Tiles.find({userid: user._id }).observe({
        added: function(tile) {
            game.placeObject(tile.gobjectid, tile.posX, tile.posY);
        }
    });

    initTiles();
    resetBuildmode();
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
