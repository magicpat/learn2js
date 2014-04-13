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
    var OFFSET = { x: TILE_WIDTH, y : TILE_HEIGHT * 2};

    //Adapt the canvas dimensions
    var SCREEN_WIDTH = (TILE_WIDTH * GRID_WIDTH) + (TILE_HEIGHT * GRID_HEIGHT);
    var SCREEN_HEIGHT = (TILE_HEIGHT * GRID_HEIGHT / 2) + (TILE_HEIGHT * GRID_WIDTH / 2) + OFFSET.y;
   
    //Coordinate system
    var ORIGIN_COORDS = { 
        x : OFFSET.x, 
        y : (TILE_HEIGHT_HALF * GRID_HEIGHT) + OFFSET.y - TILE_HEIGHT_HALF 
    };

    var MATRIX = {
        "DEBUG" : 2,
        "FREE" : 3,
        "HOUSE0" : "house0",
        "BAR0" : "bar0",
        "LIBRARY0" : "library0"
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
    //buildCube is the geometry being cached for the click event
    var buildmode = false;
    var buildCube;
    var buildCubePos = { x : 0, y : 0};
    var buildObjectId;

    //Current mouse screen position
    var cursorPos = { x : 0, y : 0};

    /**
     * Initializees the game and preloads gameobjects passed by Arraylist
     * @param {array} dataList - JSON list width objectId and X, Y coordinates 
     *                         [ { objectId : 1, x : 1, y : 1 },... ] 
     */
    function init(dataList){
        //Initialize the data matrix
        loadMatrix(dataList);

        //Eventhandling
        canvas.onmousemove = updateCursorPosition;

        draw();
    }

    function getMousePos(event){
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function getClickedCoordinates(event){
        var mousePos = getMousePos(event);

        return getGridCoordinates(mousePos);
    }
    
    function getGridCoordinates(screenPos){
        if(screenPos.x < 0){
            screenPos.x = 0;
        }

        if(screenPos.y < 0){
            screenPos.y = 0;
        }

        //This is just an inversion of getScreenCoordinates
        //Although, Y gets +1 since the Grid is not calculated from the furthest left corner
        var x = ((screenPos.x - ORIGIN_COORDS.x) / TILE_WIDTH + (screenPos.y - ORIGIN_COORDS.y) / TILE_HEIGHT_HALF) / 2;
        var y = (((ORIGIN_COORDS.y - screenPos.y) / TILE_HEIGHT_HALF + (screenPos.x - ORIGIN_COORDS.x) / TILE_WIDTH) / 2) + 1;
        var outside = false;

        if(x < 0){
            x = 0;
            outside = true;
        }

        if(y < 0){
            y = 0;
            outside = true;
        }

        if(x >= GRID_WIDTH){
            x = GRID_WIDTH - 1;
            outside = true;
        }

        if(y >= GRID_HEIGHT){
            y = GRID_HEIGHT - 1;
            outside = true;
        }

        //outside: if the screenPos was outside of the actual bord bounderies
        return {
            x : Math.floor(x),
            y : Math.floor(y),
            outside: outside
        };
    }

    function getScreenCoordinates(mapPos){
        if(mapPos.x >= GRID_WIDTH){
            mapPos.x = GRID_WIDTH - 1;
        }

        if(mapPos.y >= GRID_HEIGHT){
            mapPos.y = GRID_HEIGHT - 1;
        }

        if(mapPos.x < 0){
            mapPos.x = 0;
        }

        if(mapPos.y < 0){
            mapPos.y = 0;
        }

        var x = ORIGIN_COORDS.x + ((mapPos.x + mapPos.y) * TILE_WIDTH);
        var y = ORIGIN_COORDS.y + ((mapPos.x - mapPos.y) * TILE_HEIGHT_HALF) ;

        return { x : x, y : y};
    }

    function updateCursorPosition(event){
        cursorPos = getMousePos(event);
        
        //If buildmode, move the buildCube with the mouse 
        if(buildmode){
            var mapPos = getGridCoordinates(cursorPos);
           
            //Only draw if the location has changed
            if(buildCubePos.x !== mapPos.x || buildCubePos.y !== mapPos.y){
                buildCubePos = mapPos;
                requestAnimationFrame(draw);
            }
        }
    }


    function createArray(width, height, defaultValue){
        var arr = new Array(width);
        for (var i = 0; i < width; i++) {
            arr[i] = new Array(height);
            //for(var j = 0; j < height; j++){
                //arr[i][j] = defaultValue;
            //}
        }

        return arr;
    }

    /**
     * Creates / Reuses the matrix and sets objects for specific
     * fields (preloading Cubes etc.)
     * @param {array} dataList - JSON list width objectId and X, Y coordinates 
     *                         [ { gobjectid : 1, posX : 1, posY : 1 },... ] 
     */
    function loadMatrix(dataList){
        if(!matrix){
            matrix = createArray(GRID_WIDTH, GRID_HEIGHT);
        }

        //Fill everything with default tiles
        for(var i = 0; i < matrix.length; i++){
            for(var j = 0; j < matrix[i].length; j++){
                placeObject(MATRIX.FREE, i, j);
            }
        }

        if(dataList){
            for (var i = 0 ; i < dataList.length; i++) {
                var data = dataList[i];

                placeObject(data.gobjectid, data.posX, data.posY);
            }
        }
    }

    function generateObject(objectId){
        var color;
        switch(objectId){
           case MATRIX.DEBUG:
                color = new obelisk.SideColor().getByInnerColor(obelisk.ColorPattern.WINE_RED);
                return new obelisk.Brick(dimension, color);
           case MATRIX.FREE:
                color = new obelisk.SideColor().getByInnerColor(obelisk.ColorPattern.GRAY);
                return new obelisk.Brick(dimension, color);
           case MATRIX.HOUSE0:
                color = new obelisk.CubeColor().getByHorizontalColor(obelisk.ColorPattern.WINE_RED);
                return new obelisk.Cube(dimension, color);
           case MATRIX.BAR0:
                color = new obelisk.CubeColor().getByHorizontalColor(obelisk.ColorPattern.GRASS_GREEN);
                return new obelisk.Cube(dimension, color);
           case MATRIX.LIBRARY0:
                color = new obelisk.CubeColor().getByHorizontalColor(obelisk.ColorPattern.BLUE);
                return new obelisk.Cube(dimension, color);
           default:
                throw new Error("ObjectId '" + objectId + "' does not exist!");
        }
    }

    function placeObject(objectId, gridX, gridY){
        if(!matrix){
            throw new Error("Matrix not initialized!");
        }
        if(gridX < 0 || gridX >= GRID_WIDTH){
            throw new Error("X coordinate '" + gridX + "' is invalid!");
        }
        if(gridY < 0 || gridY >= GRID_HEIGHT){
            throw new Error("Y coordinate '" + gridY + "' is invalid!");
        }

        matrix[gridX][gridY] = { id : objectId, geometry : generateObject(objectId)};
    }

    function enableBuildMode(objectId){
       buildmode = true;
       buildObjectId = objectId;
    }

    function disableBuildmode(){
        buildmode = false;
        buildObjectId = null;

        //Redraw so the last buildcube does
        //not stick to the board
        requestAnimationFrame(draw);
    }

    function isInBuildMode(){
        return buildmode;
    }

    function draw(){
        pixelView.clear();

        //Default brick color
        var defaultColor = new obelisk.SideColor().getByInnerColor(obelisk.ColorPattern.GRAY);

        for (var i = 0; i < GRID_WIDTH; i++) {
            //Render backwards, so there is no overlay problem
            for (var j = GRID_HEIGHT - 1; j >= 0; j--) {
                var p3d = new obelisk.Point3D(i * TILE_WIDTH, -1 * j * TILE_HEIGHT, 0);
                var geometry;

                //If buildmode is on, render a preview cube (either red or green, dependend on the field)
                if(buildmode && (buildCubePos.x === i && buildCubePos.y === j)){
                    //Only show a green buildCube if the area is free
                    var colorCode = (matrix[i][j].id === MATRIX.FREE?  0x5500FF00 : 0x55FF0000);

                    var color = new obelisk.CubeColor().getByHorizontalColor(colorCode);
                    geometry = buildCube = new obelisk.Cube(dimension, color);
                }
                else {
                    geometry = matrix[i][j].geometry;
                }

                if(geometry){
                    pixelView.renderObject(geometry, p3d);
                }
            }
        }
    }


    //Global public instance values
    self.enableBuildMode = enableBuildMode;
    self.disableBuildmode = disableBuildmode;
    self.isInBuildMode = isInBuildMode;
    self.placeObject = placeObject;
    self.getClickedCoordinates = getClickedCoordinates;
    self.loadMatrix = loadMatrix;
    self.redraw = function(){
        requestAnimationFrame(draw);
    };
    self.init = init;

    //Global public constants
    L2JSGame.MATRIX = MATRIX;

    //todo: DEBUG remove afterwards
    L2JSGame.self = self;
};
