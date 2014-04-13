$(document).ready(function() {
    var PIECE_NAMES = ["TO","FU","ou","ka","ry","ki","HI","ng","nk","gi",
    "fu","KY","um","KA","NK","ke","KE","to","ky","RY","NG","UM","ny","hi","GI","OU","NY"];


    Crafty.init(200 + 600 + 200, 1000);
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
            .attr({w: 1000, h: 20, x: 0, y: 120})
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

    Crafty.c("MessageRelay", {
        init: function () {
            this.requires("obj")
            .bind("Arrival", this.onArrival)
            .bind("Departure", this.onDepature);
            this.listeners = [];
        },
        subscribe: function(listener) {
            this.listeners.push(listener);
        },
        onDepature: function(evt) {
            _.each(this.listeners, function(listener) {
                listener.trigger("Departure", evt);
            });
        },
        onArrival: function(evt) {
            _.each(this.listeners, function(listener) {
                listener.trigger("Arrival", evt);
            });
        },
    }); //Crafty.c MessageRelay 

    var g_message_relay = Crafty.e("MessageRelay");


    Crafty.c("Piece", {
        init: function () {
            if (Crafty.support.setter) {
                this._defineGetterSetter_setter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetter_defineProperty();
            }
            this.requires("2D, DOM, Mouse, Draggable, Sprite, Collision")
            .bind("StartDrag", this.onStartDrag)
            .bind("StopDrag", this.onStopDrag);
        },
        _piece_name: null,
        _piece_sprite_name: null,
        _piece_color: null,
        _defineGetterSetter_setter: function () {
            this.__defineSetter__('piece_name', function (v) {
                this._attr('_piece_name', v);
            });
            this.__defineGetter__('piece_name', function () {
                return this._piece_name;
            });
            this.__defineSetter__('piece_sprite_name', function (v) {
                this._attr('_piece_sprite_name', v);
            });
            this.__defineGetter__('piece_sprite_name', function () {
                return this._piece_sprite_name;
            });
            this.__defineSetter__('piece_color', function (v) {
                this._attr('_piece_color', v);
            });
            this.__defineGetter__('piece_color', function () {
                return this._piece_color;
            });
        },
        _defineGetterSetter_defineProperty: function () {
            Object.defineProperty(this, 'piece_name', {
                set: function (v) {
                    this._attr('_piece_name', v);
                },
                get: function () {
                    return this._piece_name;
                },
                configurable: true
            });
            Object.defineProperty(this, 'piece_sprite_name', {
                set: function (v) {
                    this._attr('_piece_sprite_name', v);
                },
                get: function () {
                    return this._piece_sprite_name;
                },
                configurable: true
            });
            Object.defineProperty(this, 'piece_color', {
                set: function (v) {
                    this._attr('_piece_color', v);
                },
                get: function () {
                    return this._piece_color;
                },
                configurable: true
            });
        },
        onStartDrag: function(evt) {
            this._report_evt(evt);
            this.attr({z: 2000});
            this.old_x = this.x;
            this.old_y = this.y;
            var xs = this.hit("Region");
            if (xs) {
                var e = _.max(xs, function(obj) {
                    return Math.abs(obj.overlap);
                }).obj;
            } else {
                // Never.
            }
            g_message_relay.trigger("Departure", {x: e.idx_x, y:e.idx_y, piece: this});
        },
        onStopDrag: function(evt) {
            this._report_evt(evt);
            this.attr({z: 1000});
            var xs = this.hit("Region");
            if (xs) {
                var e = _.max(xs, function(obj) {
                    return Math.abs(obj.overlap);
                }).obj;
                //snap to grid
                this.x = e.x;
                this.y = e.y;
                g_message_relay.trigger("Arrival", {x: e.idx_x, y: e.idx_y, piece: this});
            } else {
                console.log("bad destination! panic!");
                this.x = this.old_x;
                this.y = this.old_y;
            }
        },
        _report_evt: function(evt) {
            console.log(evt);
            console.log('Piece', this._entityName);
            console.log("Event X, y", evt.clientX, evt.clientY);
            console.log("x,y", this.x, this.y);
        },
    }); //Crafty.c Piece

    Crafty.c("Recorder", {
        init: function () {
            this.requires("2D, DOM, Text")
            .bind("Arrival", this.onArrival)
            .bind("Departure", this.onDepature);
            g_message_relay.subscribe(this);
            this.moveList = [];
            var did = this.getDomId();
            $("#"+did).append("<textarea id='csa'></textarea>");
            this.record = $("#csa")
        },
        lastEvt: null,
        moveList: null,
        format_as_csa: function(evt) {
            return ""+evt.piece.piece_color
                     +this.lastEvt.x+this.lastEvt.y
                     +evt.x+evt.y
                     +evt.piece.piece_name;
        },
        onArrival: function(evt) {
            //console.log(this.lastEvt);
            //console.log(evt);
            var move_text = this.format_as_csa(evt);
            this.moveList.push(move_text);
            var did = this.getDomId();
            console.log(move_text, did);
            this.record.append( move_text + "\n");
        },
        onDepature: function(evt) {
            //console.log(evt);
            this.lastEvt = evt;
        },
    }); //Crafty.c Recorder


    Crafty.c("Board", {
        squares: 0,
        init: function() {
            this.requires("2D, DOM, SpriteBoard")
            if (Crafty.support.setter) {
                this._defineGetterSetter_setter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetter_defineProperty();
            }
        },
        layout: function() {
            var board = this;
            _.each(_.range(1, 10, 1), function (i) {
                _.each(_.range(1, 10, 1), function (j) {
                    var entity = Crafty.e("2D, DOM, Text, Region, Collision")
                        .text("" + i + ","+ j)
                        .attr({
                            visible:false,
                            x: board.i2x(i),
                            y: board.j2y(j),
                            w: board.cell_w,
                            h: board.cell_h,
                            z: 50});
                    entity.attr({idx_x:i, idx_y:j});
                    board.squares[(i, j)] = entity;
                });
            });
        },
        i2x: function(idx) {
            return (9 - idx) * this.cell_w + this.off_x + this.x;
        },
        j2y: function (idx) {
            return (idx - 1) * this.cell_h + this.off_y + this.y;
        },
        _off_x: 0,
        _off_y: 0,
        _cell_w: 0,
        _cell_h: 0,
        _defineGetterSetter_setter: function () {
            this.__defineSetter__('off_x', function (v) {
                this._attr('_off_x', v);
            });
            this.__defineGetter__('off_x', function () {
                return this._off_x;
            });
            this.__defineSetter__('off_y', function (v) {
                this._attr('_off_y', v);
            });
            this.__defineGetter__('off_y', function () {
                return this._off_y;
            });
            this.__defineSetter__('cell_w', function (v) {
                this._attr('_cell_w', v);
            });
            this.__defineGetter__('cell_w', function () {
                return this._cell_w;
            });
            this.__defineSetter__('cell_h', function (v) {
                this._attr('_cell_h', v);
            });
            this.__defineGetter__('cell_h', function () {
                return this._cell_h;
            });
        },
        _defineGetterSetter_defineProperty: function () {
            Object.defineProperty(this, 'off_x', {
                set: function (v) {
                    this._attr('_off_x', v);
                },
                get: function () {
                    return this._off_x;
                },
                configurable: true
            });
            Object.defineProperty(this, 'off_y', {
                set: function (v) {
                    this._attr('_off_y', v);
                },
                get: function () {
                    return this._off_y;
                },
                configurable: true
            });
            Object.defineProperty(this, 'cell_w', {
                set: function (v) {
                    this._attr('_cell_w', v);
                },
                get: function () {
                    return this._cell_w;
                },
                configurable: true
            });
            Object.defineProperty(this, 'cell_h', {
                set: function (v) {
                    this._attr('_cell_h', v);
                },
                get: function () {
                    return this._cell_h;
                },
                configurable: true
            });
        },
        initial_setup: function() {
            this.csa_setup(
                "P1-KY-KE-GI-KI-OU-KI-GI-KE-KY",
                "P2 * -HI *  *  *  *  * -KA * ",
                "P3-FU-FU-FU-FU-FU-FU-FU-FU-FU",
                "P4 *  *  *  *  *  *  *  *  * ",
                "P5 *  *  *  *  *  *  *  *  * ",
                "P6 *  *  *  *  *  *  *  *  * ",
                "P7+FU+FU+FU+FU+FU+FU+FU+FU+FU",
                "P8 * +KA *  *  *  *  * +HI * ",
                "P9+KY+KE+GI+KI+OU+KI+GI+KE+KY");
        },
        csa_setup: function (argv) {
            var rank = new RegExp("^P(\\d)");
            var sq = new RegExp("((?:[-+])(?:FU|KY|KE|GI|KI|KA|HI|OU|TO|NY|NK|NG|UM|RY))|( \\* )", 'g');

            var pieces = [];
            
            for (var i in this.csa_setup.arguments) {
                var board = this;
                var s = this.csa_setup.arguments[i];
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
                        piece.attr({x:board.i2x(9 - index), 
                                    y:board.j2y(r),
                                    z: 1000,
                                    piece_name: elem.substring(1, 3),
                                    piece_sprite_name: pn,
                                    piece_color: elem[0],
                                    });
                        pieces.push(piece);

                    }
                    //console.log(x, index + 1);
                    x += 1;
                })
            };
            return pieces;
        },
    });

    Crafty.scene("main", function() {
        Crafty.background("#FFFFFF url(assets/tatami.jpg) repeat");
        Crafty.sprite("assets/board.jpg", {SpriteBoard: [0, 0, 600, 640]});
        Crafty.sprite("assets/mokume.png", {SpriteKomadai: [0, 0, 160, 280]});
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

        var board = Crafty.e("2D, Dom, Board, SpriteBoard");
        var komadaiW = Crafty.e("2D, Dom, SpriteKomadai, Region, Collision");
        var komadaiB = Crafty.e("2D, Dom, SpriteKomadai, Region, Collision");
        var recorder = Crafty.e("2D, DOM, Text, Recorder");
        board.attr({x: 200, y: 0, off_x:30, off_y:32, z:50, cell_w: 60, cell_h: 64});
        komadaiW.attr({x:20, y:20, z:51, name:"white"})
        komadaiB.attr({x:820, y:340, z:51, name:"black"})
        board.layout();
        board.initial_setup();
        recorder.attr({x:0, y:700, w:800, h:200, background_color: "white"});
        recorder.text("test! test! test!");
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
