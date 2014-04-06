/* global L2JSGame : false */
;(function(){

"use strict";

Template.dashboard.events({
    "click #game-canvas" : function(e, tpl){
        var canvas = $(e.target);
        
    }
});

function drawGrid(){

}

Template.dashboard.rendered = function(){
    var canvas = document.getElementById("game-canvas");
    console.log(canvas);
    var game = new L2JSGame(canvas);
};

})();
