/* global obelisk : false, L2JSGame : true */
/* jshint maxlen : 220 */

/**
 * Creates a new game and initializes the content in the given HTML canvas
 * @constructor
 * @param {object} canvas HTML DOM object, in which the game is rendered
 * @example
 *  var canvas = document.getObjectById("game-canvas");
 *  var game = L2JSGame(canvas);
 */
L2JSGame = function(canvas, preload){
    "use strict";
    var self = this;

    //Default size of a tile
    var TILE_SIZE = 32;
    
    //Probably wanna change to different width / height sometimes...
    var TILE_WIDTH = TILE_SIZE;
    var TILE_HEIGHT = TILE_SIZE;

    //For computation convenience
    var TILE_WIDTH_HALF = TILE_WIDTH / 2;
    var TILE_HEIGHT_HALF = TILE_HEIGHT / 2;

    //Grid width / height in bricks
    var GRID_WIDTH = 15;
    var GRID_HEIGHT = 15;

    //Offset to push the content down in the canvas
    var OFFSET = { x: 0, y : 50 };

    //Ensure canvas size
    var SCREEN_WIDTH = TILE_SIZE * 2 * GRID_WIDTH + OFFSET.x;
    var SCREEN_HEIGHT = TILE_SIZE * GRID_HEIGHT + OFFSET.y;

    //Coordinate system
    var ORIGIN_COORDS = {
        x : (SCREEN_WIDTH / 2) + OFFSET.x,
        y : OFFSET.y
    };

    var MATRIX = {
        "FREE" : 1,
        "DEBUG" : 2
    };

    //Ensure the canvas has the same size
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    var viewPoint = new obelisk.Point(ORIGIN_COORDS.x, ORIGIN_COORDS.y);
    var pixelView = new obelisk.PixelView(canvas, viewPoint);

    //Matrix, which stores data to render on each brick
    var matrix;
    var dimension = new obelisk.CubeDimension(TILE_WIDTH, TILE_HEIGHT, TILE_SIZE);

    //Buildmode is a hovering cube at the cursor 
    var buildmode = false;
    var buildCubePos = { x : 0, y : 0};

    //{x, y}
    var cursorPos = { x : 0, y : 0};

    function getMousePos(event){
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function fireClick(event){
        //var x = Math.floor((event.clientX - rect.left));
        //var y = Math.floor((event.clientY - rect.top));
        var mousePos = getMousePos(event);
        console.log(event);
        var mapPos = getGridCoordinates(mousePos);

        console.log("Tile: (" +mapPos.x + ", " + mapPos.y + ")");
    }

    function getGridCoordinates(screenPos){
        console.log("Original Coords X: " + screenPos.x + " Y: " + screenPos.y);
        screenPos.x -= ORIGIN_COORDS.x;
        screenPos.y -= ORIGIN_COORDS.y;

        console.log("Fixed Coords X: " + screenPos.x + " Y: " + screenPos.y);
        var x = (screenPos.x / TILE_WIDTH_HALF + screenPos.y / TILE_HEIGHT_HALF) / 2;
        var y = (screenPos.y / TILE_HEIGHT_HALF - screenPos.x / TILE_WIDTH_HALF) / 2;

        if(x >= GRID_WIDTH){
            x = GRID_WIDTH - 1;
        }
        if(y >= GRID_HEIGHT){
            y = GRID_HEIGHT - 1;
        }

        if(x < 0){
            x = 0;
        }
        if(y < 0){
            y = 0;
        }
        return {x : x, y : y};
    }

    function getScreenCoordinates(mapPos){
        if(mapPos.x >= GRID_WIDTH){
            mapPos.x = GRID_WIDTH - 1;
        }

        if(mapPos.y >= GRID_HEIGHT){
            mapPos.y = GRID_HEIGHT - 1;
        }

        var x = ((mapPos.x - mapPos.y) * TILE_WIDTH_HALF) + ORIGIN_COORDS.x;
        var y = ((mapPos.x + mapPos.y) * TILE_HEIGHT_HALF) + ORIGIN_COORDS.y;

        return { x : x, y : y};
    }


    function updateCursorPosition(event){
        cursorPos = getMousePos(event);
        
        //getGridCoordinates(cursorPos);
        //If buildmode, move the buildCube with the mouse 
        /* 
        if(buildmode){
           var mapPos = getGridCoordinates(cursorPos);
           
           var fractalX = Math.ceil(((mapPos.x < 1.0) ? mapPos.x : (mapPos.x % Math.floor(mapPos.x))) * 100);
           var fractalY = Math.ceil(((mapPos.y < 1.0) ? mapPos.y : (mapPos.y % Math.floor(mapPos.y))) * 100);
         
           if(fractalX > 50){
                mapPos.x = Math.ceil(mapPos.x);
           }
           else{
                mapPos.x = Math.floor(mapPos.x);
           }

           if(fractalY > 50){
                mapPos.y = Math.ceil(mapPos.y);
           }
           else{
                mapPos.y = Math.floor(mapPos.y);
           }
           
           //todo: snap to the right element, if certain pixel is reached
           if(buildCubePos.x !== mapPos.x && buildCubePos.y !== mapPos.y){
               //console.log(mapPos); 
               buildCubePos = mapPos;
               //draw();
           }
        }*/
    }

    L2JSGame.s2m = function(x, y){
        var gridPos = getGridCoordinates({x : x, y: y});

        gridPos.mark = function(){
            matrix[this.x][this.y] = MATRIX.DEBUG;
            draw();
        };

        return gridPos;
    };

    L2JSGame.m2s = function(x, y){
        var pos = getScreenCoordinates({x: x, y: y});
        pos.mark = function(){
            matrix[x][y] = MATRIX.DEBUG;
            draw();
        };
        return pos;
    };

    L2JSGame.ucp = function(x, y){
        updateCursorPosition({clientX : x, clientY : y});
    };

    L2JSGame.mark = function(pos){
        matrix[pos.x][pos.y] = MATRIX.DEBUG;
        draw();
    };

    //Initializes the elements used in the game
    function init(){
        matrix = createArray(GRID_WIDTH, GRID_HEIGHT);
        
        //Eventhandling
        canvas.onmousemove = updateCursorPosition;
        canvas.onclick = fireClick;

        //todo: initialize preload stuff into the matrix   
    }

    function createArray(width, height) {
        var arr = new Array(width);
        for (var i = 0; i < width; i++) {
            arr[i] = new Array(height);
            for(var j = 0; j < height; j++){
                arr[i][j] = MATRIX.FREE;
            }
        }

        return arr;
    }

    function clickObject(x, y){
        
    }

    function enableBuildMode(objectToPlace){
       buildmode = true; 
    }

    function disableBuildMode(){
        buildmode = false;
    }

    function draw(){
        var colorBG = new obelisk.SideColor().getByInnerColor(obelisk.ColorPattern.GRAY);
        pixelView.clear();
        //todo
        for (var i = 0; i < GRID_WIDTH; i++) {
            for (var j = 0; j < GRID_HEIGHT; j++) {
                var p3d = new obelisk.Point3D(i * TILE_SIZE, j * TILE_SIZE, 0);
                var geometry;

                //Render buildCube before matrix elements
                if((buildCubePos.x === i && buildCubePos.y === j) && buildmode){
                    console.log("i: " + i + "j: " + j);
                    
                    //Only show a green buildCube if the area is free
                    var colorCode = (matrix[i][j] === MATRIX.FREE ?  obelisk.ColorPattern.GRASS_GREEN : obelisk.ColorPattern.WINE_RED);

                    var color = new obelisk.CubeColor().getByHorizontalColor(colorCode);
                    geometry = new obelisk.Cube(dimension, color);
                }
                else {
                    switch (matrix[i][j]) {
                        case MATRIX.DEBUG:
                            var color = new obelisk.SideColor().getByInnerColor(obelisk.ColorPattern.WINE_RED);
                            geometry = new obelisk.Brick(dimension, color);
                            break;
                        default:
                            geometry = new obelisk.Brick(dimension, colorBG);
                    }
                }
                
                //Render the preselected object
                pixelView.renderObject(geometry, p3d);
            }
        }
    }

    init();
    enableBuildMode();
    draw();
};
