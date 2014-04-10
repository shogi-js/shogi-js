$(document).ready(function() {
    var PIECE_NAMES = ["TO","FU","ou","ka","ry","ki","HI","ng","nk","gi",
    "fu","KY","um","KA","NK","ke","KE","to","ky","RY","NG","UM","ny","hi","GI","OU","NY"];

    var g_squares = {};

    function index2coor_x(idx) {
        return (9 - idx) * 60 + 30;
    };

    function index2coor_y(idx) {
        return (idx - 1) * 64 + 32;
    };

    Crafty.init(600, 640);
    Crafty.canvas.init();

    Crafty.scene("loading", function() {
        // Load our assets
        Crafty.load([
                "assets/opening2.mp3",
                "assets/snap.mp3",
                "assets/ncoin.mp3",
                "assets/koma.png",
                "assets/board.jpg",
            ], 
            function() {
                Crafty.scene("main");
                Crafty.audio.play("assets/opening2.mp3");
                //Crafty.audio.play("assets/ncoin.mp3");
            },
            function() {
                // progress
            },
            function() {
                alert("loading error.");
            }
        );

        // White background and some ugle text
        Crafty.background("#FFF");
        Crafty.e("2D, DOM, Text")
            .attr({w: 600, h: 20, x: 0, y: 120})
            .text("Loading")
            .css({"text-align": "center", "font-size": "30px"});
    }); //scene loading


    Crafty.scene("loading");

    Crafty.c("Region", {
        init: function () {
            this.requires("2D, DOM, Collision")
            if (Crafty.support.setter) {
                this._defineGetterSetter_setter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetter_defineProperty();
            }
        },
        _idx_x: 0,
        _idx_y: 0,
        _defineGetterSetter_setter: function () {
            this.__defineSetter__('idx_x', function (v) {
                this._attr('_idx_x', v);
            });
            this.__defineSetter__('idx_y', function (v) {
                this._attr('_idx_y', v);
            });
            this.__defineGetter__('idx_x', function () {
                return this._idx_x;
            });
            this.__defineGetter__('idx_y', function () {
                return this._idx_y;
            });
        },
        _defineGetterSetter_defineProperty: function () {
            Object.defineProperty(this, 'idx_x', {
                set: function (v) {
                    this._attr('_idx_x', v);
                },
                get: function () {
                    return this._idx_x;
                },
                configurable: true
            });
            Object.defineProperty(this, 'idx_y', {
                set: function (v) {
                    this._attr('_idx_y', v);
                },
                get: function () {
                    return this._idx_y;
                },
                configurable: true
            });
        },
    }); //Crafty.c Region

    Crafty.c("Piece", {
        init: function () {
            this.requires("2D, DOM, Mouse, Draggable, Sprite, Collision")
            .bind("StartDrag", this.onStartDrag)
            .bind("StopDrag", this.onStopDrag);
        },
        onStartDrag: function(evt) {
            this._report_evt(evt);
            this.attr({z: 2000});
        },
        onStopDrag: function(evt) {
            this._report_evt(evt);
            this.attr({z: 1000});
            var xs = this.hit("Region");
            if (xs) {
                var e = _.max(xs, function(obj) {
                    return Math.abs(obj.overlap);
                }).obj;
                this.x = e.x;
                this.y = e.y;
                console.log(e, e.idx_x, e.idx_y);
            }
        },
        _report_evt: function(evt) {
            console.log(evt);
            console.log('Piece', this._entityName);
            console.log("Event X, y", evt.clientX, evt.clientY);
            console.log("x,y", this.x, this.y);
        },
    }); //Crafty.c Piece

    function initial_setup() {
        csa_setup(
            "P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
            "P2 * -HI *  *  *  *  * -KA * ",
            "P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
            "P4 *  *  *  *  *  *  *  *  * ",
            "P5 *  *  *  *  *  *  *  *  * ",
            "P6 *  *  *  *  *  *  *  *  * ",
            "P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
            "P8 * +KA *  *  *  *  * +HI * ",
            "P9+KY+KE+GI+KI+OU+KI+GI+KE+KY");
    };
    
    function csa_setup(argv) {
        var rank = new RegExp("^P(\\d)");
        var sq = new RegExp("((?:[-+])(?:FU|KY|KE|GI|KI|KA|HI|OU|TO|NY|NK|NG|UM|RY))|( \\* )", 'g');

        var pieces = [];
        
        for (var i in csa_setup.arguments) {
            var s = csa_setup.arguments[i];
            //console.log(s);
            var xs = s.split(rank);
            //console.log(xs);
            var r = parseInt(xs[1]);
            console.log("i+1 and r", parseInt(i) + 1, r);
            var x = 1;
            _.each(xs[2].match(sq), function(elem, index, xs) {
                if (elem[0] == '-' || elem[0] == '+') {
                    var pn;
                    if (elem[0] == '-') {
                        pn = elem.substring(1,3).toLowerCase();
                    } else {
                        pn = elem.substring(1,3);
                    }
                    console.log('entity for', 9 - index, r, pn);
                    var piece = Crafty.e("2D, DOM, Mouse, Draggable, Collision, " + pn + ", Piece");
                    piece.attr({x:index2coor_x(9 - index), 
                                y:index2coor_y(r),
                                z: 1000,
                                });
                    pieces.push(piece);

                }
                //console.log(x, index + 1);
                x += 1;
            })
        };
        return pieces;
    };

    Crafty.scene("main", function() {
        Crafty.background("#FFFFFF url(assets/board.jpg) no-repeat center center");
        Crafty.sprite("assets/koma.png", {KI:[0,0,60,64],
            TO:[60,0,60,64],
            FU:[120,0,60,64],
            ou:[180,0,60,64],
            ka:[240,0,60,64],
            ry:[300,0,60,64],
            ki:[360,0,60,64],
            HI:[420,0,60,64],
            ng:[480,0,60,64],
            nk:[540,0,60,64],
            gi:[600,0,60,64],
            fu:[660,0,60,64],
            KY:[720,0,60,64],
            um:[780,0,60,64],
            KA:[840,0,60,64],
            NK:[900,0,60,64],
            ke:[960,0,60,64],
            KE:[1020,0,60,64],
            to:[1080,0,60,64],
            ky:[1140,0,60,64],
            RY:[1200,0,60,64],
            NG:[1260,0,60,64],
            UM:[1320,0,60,64],
            ny:[1380,0,60,64],
            hi:[1440,0,60,64],
            GI:[1500,0,60,64],
            OU:[1560,0,60,64],
            NY:[1620,0,60,64],
        });

        _.each(_.range(1, 10, 1), function (x) {
            _.each(_.range(1, 10, 1), function (y) {
                //console.log(x, y);
                var entity = Crafty.e("2D, DOM, Text, Region, Collision")
                    .text("" + x + ","+ y)
                    .attr({
                        visible:false,
                        x: index2coor_x(x),
                        y: index2coor_y(y),
                        w: 60,
                        h: 64,
                        z: 50});
                entity.attr({idx_x:x, idx_y:y});
                console.log(entity, entity.z);
                g_squares[(x, y)] = entity;
            });
        });
        initial_setup();
        /*
        var x = 1;
        var y = 1;
        for(var i in PIECE_NAMES ){
            console.log(PIECE_NAMES[i]);
            var piece = Crafty.e("2D, DOM, Mouse, Draggable, Collision, " + PIECE_NAMES[i] + ", Piece");
            piece.attr({x:x *20, y:y*20});
            x += 1;
            if (x > 9) {
                y += 1;
                x = 0
            }
        };
        */
    });
})
