$(document).ready(function() {
    var PIECE_NAMES = ["TO","FU","ou","ka","ry","ki","HI","ng","nk","gi",
    "fu","KY","um","KA","NK","ke","KE","to","ky","RY","NG","UM","ny","hi","GI","OU","NY"];

    var koma_sprite_mapping = {KI:[0,0,60,64],
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
    };


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

    Crafty.c("Stack", {
        init: function () {
            this.requires("Region")
            .bind("Departure", this.onDepature)
            .bind("Arrival", this.onArrival);
            if (Crafty.support.setter) {
                this._defineGetterSetter_setter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetter_defineProperty();
            }
            this.piece_stack = {FU:[], KY:[], KE:[], GI:[], KI:[], KA:[], HI:[], OU:[]};
        },
        _defineGetterSetter_setter: function () {
            this.__defineSetter__('piece_stack', function (v) {
                this._attr('_piece_stack', v);
            });
            this.__defineGetter__('piece_stack', function () {
                return this._piece_stack;
            });
        },
        _defineGetterSetter_defineProperty: function () {
            Object.defineProperty(this, 'piece_stack', {
                set: function (v) {
                    this._attr('_piece_stack', v);
                },
                get: function () {
                    return this._piece_stack;
                },
                configurable: true
            });
        },
        isKomaDai: function() {
            return true;
        },
        insert: function(piece) {
            this.piece_stack[piece.piece_name].push(piece);
        },
        pop: function(piece) {
            console.log(this.piece_stack[piece.piece_name]);
            var xs = this.piece_stack[piece.piece_name]
            var ys = _.filter(xs, function(item) {
                return item != piece;
            });
            this.piece_stack[piece.piece_name] = ys;
            console.log(this.piece_stack[piece.piece_name]);
        },
        layout: function() {
            var stackable = this;
            var jy = 0;
            _.each(stackable.piece_stack, function(arr) {
                _.each(arr, function(piece, ix, xs) {
                    piece.x = stackable.x + ix* 20; //let be in resource.
                    piece.y = stackable.y + jy* 40; //let be in resource.
                    piece.trigger("Invalidate"); // maybe don't need this.
                });
                jy += 1;
            });
        },
        onDepature: function(evt) {
            "Departure";
            this.pop(evt.piece);
            this.layout();
        },
        onArrival: function(evt) {
            var piece = evt.piece;
            console.log(piece, this);
            piece.piece_color = this.name;
            piece.unpromote();
            this.insert(piece);
            this.layout();
        },
    });

    Crafty.c("Mutex", {
        init: function () {
            this.requires("Region")
            .bind("Departure", this.onDepature)
            .bind("Arrival", this.onArrival);
            this.piece = null;
        },
        isKomaDai: function() {
            return false;
        },
        onDepature: function(evt) {
            "Departure";
            if (this.piece != evt.piece){
                console.log("!! bad piece on", this)
            }
            this.piece = null;
        },
        place: function(p) {
            this.piece = p;
            p.x = this.x;
            p.y = this.y;
            p.trigger("Invalidate"); // maybe don't need this.
        },
        onArrival: function(evt) {
            var p = evt.piece;
            var d = this.game.komaDai[p.piece_color];
            if (this.piece) { //taking something.
                var q = this.piece;
                if (p.old_reg.isKomaDai()) {
                    p.veto = "Can't capture from the KomaDai";
                    return;
                }
                if (q.piece_color == p.piece_color) {
                    p.veto = "Can't capture friend."
                    return;
                }
                d.trigger("Arrival", {piece:q});
            };
            if (p.isPromotable(this.idx_y) && confirm("promote?")) {
                p.promote();
            }
            this.place(p);
        },
    });

    Crafty.c("Region", {
        init: function () {
            this.requires("2D, DOM, Collision");
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
        locString: function() {
            return ""+this.idx_x+this.idx_y
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
            this.promotion = {FU:"TO", KY:"NY", KE:"NK", GI:"NG", KA:"UM", HI:"RY"};
            this.veto = null;
            this.requires("2D, DOM, Mouse, Draggable, Sprite, Collision")
            .bind("StartDrag", this.onStartDrag)
            .bind("StopDrag", this.onStopDrag);
        },
        _piece_name: null,
        _piece_color: null,
        _defineGetterSetter_setter: function () {
            this.__defineSetter__('piece_name', function (v) {
                this._attr('_piece_name', v);
                this.updateSprite();
            });
            this.__defineGetter__('piece_name', function () {
                return this._piece_name;
            });
            this.__defineSetter__('piece_color', function (v) {
                this._attr('_piece_color', v);
                this.updateSprite();
            });
            this.__defineGetter__('piece_color', function () {
                return this._piece_color;
            });
        },
        _defineGetterSetter_defineProperty: function () {
            Object.defineProperty(this, 'piece_name', {
                set: function (v) {
                    this._attr('_piece_name', v);
                    this.updateSprite();
                },
                get: function () {
                    return this._piece_name;
                },
                configurable: true
            });
            Object.defineProperty(this, 'piece_color', {
                set: function (v) {
                    this._attr('_piece_color', v);
                    this.updateSprite();
                },
                get: function () {
                    return this._piece_color;
                },
                configurable: true
            });
        },
        getSpriteName: function() {
            if (this.piece_color == '+'){
                return this.piece_name;
            }else{
                return this.piece_name.toLowerCase()
            }
        },
        isPromotable: function(rank) {
            if (this.old_reg.isKomaDai()){
                return false;
            }
            var was = this.old_reg.idx_y;
            var c = this.piece_color;
            return (this.piece_name in this.promotion) 
                && ((rank > 0 && rank < 4 && c == '+')
                    || (was > 0 && was <  4 && c == '+')
                    || (rank > 6 && rank < 10 && c == '-')
                    || (was > 6 && was < 10 && c == '-'));
        },
        promote: function(){
            this.piece_name = this.promotion[this.piece_name];
        },
        unpromote: function(){
            var mapping = {TO:"FU", NY:"KY", NK:"KE", NG:"GI", UM:"KA", RY:"HI"}
            if (this.piece_name in mapping){
                this.piece_name = mapping[this.piece_name];
            }
        },
        onStartDrag: function(evt) {
            this._report_evt(evt);
            this.attr({z: 2000});
            var xs = this.hit("Region");
            var reg = this.findBestRegion(null);
            this.old_reg = reg;
            reg.trigger("Departure", {piece: this});
            if (this.veto) {
                this.revoke(this.veto);
            } else {
                g_message_relay.trigger("Departure", {region:reg, piece: this});
            }
        },
        updateSprite: function() {
            var xs = koma_sprite_mapping[this.getSpriteName()];
            this.sprite(xs[0], xs[1], xs[2], xs[3]);
            return;
        },
        findBestRegion: function(notFound) {
            var xs = this.hit("Region");
            if (xs) {
                return _.max(xs, function(obj) {
                    return Math.abs(obj.overlap);
                }).obj;
            }else{
                return notFound;
            }
        },
        revoke: function(reason) {
            this.veto = null;
            console.log(this, reason);
            this.old_reg.trigger("Arrival", {piece: this, veto: reason});
        },
        onStopDrag: function(evt) {
            this._report_evt(evt);
            this.attr({z: 1000});
            var reg = this.findBestRegion(this.old_reg)
            //snap to grid, promote, moving taken piece to komadai, unpromote, etc
            reg.trigger("Arrival", {piece: this});
            if (this.veto) {
                this.revoke(this.veto);
            } else {
                g_message_relay.trigger("Arrival", {region:reg, piece: this});
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
                     +this.lastEvt.region.locString()
                     +evt.region.locString()
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
        squares: null,
        init: function() {
            this.requires("2D, DOM, SpriteBoard")
            if (Crafty.support.setter) {
                this._defineGetterSetter_setter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetter_defineProperty();
            }
            this.squares = {};
        },
        layout: function() {
            var board = this;
            _.each(_.range(1, 10, 1), function (i) {
                board.squares[i] = {};
                _.each(_.range(1, 10, 1), function (j) {
                    var entity = Crafty.e("2D, DOM, Text, Region, Collision, Mutex");
                    entity.text("" + i + ","+ j);
                    entity.attr({
                            visible:false,
                            x: board.i2x(i),
                            y: board.j2y(j),
                            w: board.cell_w,
                            h: board.cell_h,
                            z: 50});
                    entity.attr({idx_x:i, idx_y:j});
                    entity.game = board.game;
                    board.squares[i][j] = entity;
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
            var board = this;
            console.log(board.squares);
            
            _.each(this.csa_setup.arguments, function(s, i, xxx){
                var xs = s.split(rank);
                var r = parseInt(xs[1]);
                _.each(xs[2].match(sq), function(elem, x, ys) {
                    if (elem[0] == '-' || elem[0] == '+') {
                        var piece = Crafty.e("2D, DOM, Mouse, Draggable, Collision, SpritePiece, Piece");
                        piece.game = board.game;
                        piece.attr({z: 1000,
                                    piece_name: elem.substring(1, 3),
                                    piece_color: elem[0],
                                    });
                        console.log('entity for', 9 - x, r, piece.getSpriteName());
                        var reg = board.squares[9 - x][r];
                        reg.place(piece);
                        pieces.push(piece);

                    }
                })
            });
            return pieces;
        },
    }); //Crafty.c Board

    Crafty.scene("main", function() {
        Crafty.background("#FFFFFF url(assets/tatami.jpg) repeat");
        Crafty.sprite("assets/board.jpg", {SpriteBoard: [0, 0, 600, 640]});
        Crafty.sprite("assets/mokume.png", {SpriteKomadai: [0, 0, 160, 380]});
        Crafty.sprite("assets/koma.png", {SpritePiece:[0,0,60,64]});

        var game = Crafty.e("");
        var board = Crafty.e("2D, Dom, Board, SpriteBoard");
        board.game = game;
        board.attr({x: 200, y: 0, off_x:30, off_y:32, z:50, cell_w: 60, cell_h: 64});
        game.komaDai = {};
        game.komaDai['+'] = Crafty.e("2D, Dom, SpriteKomadai, Region, Collision, Stack");
        game.komaDai['+'].attr({x:820, y:240, z:51, name:"+"})
        game.komaDai['-'] = Crafty.e("2D, Dom, SpriteKomadai, Region, Collision, Stack");
        game.komaDai['-'].attr({x:20, y:20, z:51, name:"-"})
        board.layout();
        board.initial_setup();
        var recorder = Crafty.e("2D, DOM, Text, Recorder");
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
