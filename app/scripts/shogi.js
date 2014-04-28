(function(){ //shogi.js
    "use strict";
    console.log("init shogi.js");
    console.log("assuming ", _, $, Crafty);

    var komaSpriteMapping = {KI:[0,0,60,64],
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


    Crafty.c("Stack", {
        init: function () {
            this.requires("Region")
            .bind("Departure", this.onDeparture)
            .bind("Arrival", this.onArrival);
            if (Crafty.support.setter) {
                this._defineGetterSetterXsetter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetterXdefineProperty();
            }
            this.pieceStack = {
                FU:[],
                KY:[],
                KE:[],
                GI:[],
                KI:[],
                KA:[],
                HI:[],
                OU:[]
            };
        },
        _defineGetterSetterXsetter: function () {
            this.__defineSetter__("pieceStack", function (v) {
                this._attr("_pieceStack", v);
            });
            this.__defineGetter__("pieceStack", function () {
                return this._pieceStack;
            });
        },
        _defineGetterSetterXdefineProperty: function () {
            Object.defineProperty(this, "pieceStack", {
                set: function (v) {
                    this._attr("_pieceStack", v);
                },
                get: function () {
                    return this._pieceStack;
                },
                configurable: true
            });
        },
        isKomaDai: function() {
            return true;
        },
        _insert: function(piece) {
            this.pieceStack[piece.pieceName].push(piece);
        },
        _pop: function(piece) {
            var xs = this.pieceStack[piece.pieceName];
            var ys = _.filter(xs, function(item) {
                return item !== piece;
            });
            this.pieceStack[piece.pieceName] = ys;
        },
        _layoutPiece: function() {
            var stackable = this;
            var jy = 0;
            _.each(stackable.pieceStack, function(arr) {
                _.each(arr, function(piece, ix) {
                    piece.x = stackable.x + ix* 20; //let be in resource.
                    piece.y = stackable.y + jy* 40; //let be in resource.
                    piece.trigger("Invalidate"); // maybe don"t need this.
                });
                jy += 1;
            });
        },
        peekPieceByName: function(pieceName) {
            return this.pieceStack[pieceName];
        },
        onDeparture: function(evt) {
            "Departure";
            this._pop(evt.piece);
            this._layoutPiece();
            this.shogi.trigger("Departure", {
                region:this,
                piece: evt.piece,
                wasPieceName: evt.piece.pieceName
            });
        },
        onArrival: function(evt) {
            "Arrival";
            var piece = evt.piece;
            piece.pieceColor = this.name;
            piece.unpromote();
            this._insert(piece);
            this._layoutPiece();
            this.shogi.trigger("Arrival", {region:this, piece: piece, promoted: false});
        },
    }); //Crafty.c Stack

    Crafty.c("Mutex", {
        init: function () {
            this.requires("Region")
            .bind("Departure", this.onDeparture)
            .bind("Arrival", this.onArrival);
            this.piece = null;
        },
        isKomaDai: function() {
            return false;
        },
        onDeparture: function(evt) {
            "Departure";
            if (this.piece !== evt.piece){
                console.log("!! bad piece on", this);
            }
            this.piece = null;
            this.shogi.trigger("Departure", {
                region:this,
                piece: evt.piece,
                wasPieceName: evt.piece.pieceName
            });
        },
        _place: function(p) {
            this.piece = p;
            p.x = this.x;
            p.y = this.y;
            p.trigger("Invalidate"); // maybe don"t need this.
        },
        onArrival: function(evt) {
            var p = evt.piece;
            var d = this.shogi.komaDai[p.pieceColor];
            var promoted = false;
            if (evt.byCommand) {
                // command must clean dst region BEFORE putting piece in.
                if (evt.promoted) {
                    p.promote();
                    promoted = true;
                }
            } else {
                if (this.piece) { //taking something.
                    var q = this.piece;
                    if (p.oldReg.isKomaDai()) {
                        p.veto = "Can't capture from the KomaDai";
                        return;
                    }
                    if (q.pieceColor === p.pieceColor) {
                        p.veto = "Can't capture friend.";
                        return;
                    }
                    Crafty.audio.play("coin");
                    this.trigger("Departure", {piece:q});
                    d.trigger("Arrival", {piece:q});
                }
                if (p.isPromotable(this.iY) && confirm("promote?")) {
                    p.promote();
                    promoted = true;
                }
            }
            Crafty.audio.play("snap");
            this._place(p);
            this.shogi.trigger("Arrival", {region:this, piece: p, promoted: promoted});
        },
    }); //Crafty.c Mutex

    Crafty.c("Region", {
        init: function () {
            this.requires("2D, DOM, Collision");
            if (Crafty.support.setter) {
                this._defineGetterSetterXsetter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetterXdefineProperty();
            }
        },
        _iX: 0,
        _iY: 0,
        _defineGetterSetterXsetter: function () {
            this.__defineSetter__("iX", function (v) {
                this._attr("_iX", v);
            });
            this.__defineSetter__("iY", function (v) {
                this._attr("_iY", v);
            });
            this.__defineGetter__("iX", function () {
                return this._iX;
            });
            this.__defineGetter__("iY", function () {
                return this._iY;
            });
        },
        _defineGetterSetterXdefineProperty: function () {
            Object.defineProperty(this, "iX", {
                set: function (v) {
                    this._attr("_iX", v);
                },
                get: function () {
                    return this._iX;
                },
                configurable: true
            });
            Object.defineProperty(this, "iY", {
                set: function (v) {
                    this._attr("_iY", v);
                },
                get: function () {
                    return this._iY;
                },
                configurable: true
            });
        },
        locString: function() {
            return ""+this.iX+this.iY;
        },
    }); //Crafty.c Region

    Crafty.c("Piece", {
        init: function () {
            if (Crafty.support.setter) {
                this._defineGetterSetterXsetter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetterXdefineProperty();
            }
            this.promotion = {
                FU:"TO",
                KY:"NY",
                KE:"NK",
                GI:"NG",
                KA:"UM",
                HI:"RY"
            };
            this.veto = null;
            this.requires("2D, DOM, Mouse, Draggable, Sprite, Collision")
            .bind("StartDrag", this.onStartDrag)
            .bind("StopDrag", this.onStopDrag);
        },
        _pieceName: null,
        _pieceColor: null,
        _defineGetterSetterXsetter: function () {
            this.__defineSetter__("pieceName", function (v) {
                this._attr("_pieceName", v);
                this.updateSprite();
            });
            this.__defineGetter__("pieceName", function () {
                return this._pieceName;
            });
            this.__defineSetter__("pieceColor", function (v) {
                this._attr("_pieceColor", v);
                this.updateSprite();
            });
            this.__defineGetter__("pieceColor", function () {
                return this._pieceColor;
            });
        },
        _defineGetterSetterXdefineProperty: function () {
            Object.defineProperty(this, "pieceName", {
                set: function (v) {
                    this._attr("_pieceName", v);
                    this.updateSprite();
                },
                get: function () {
                    return this._pieceName;
                },
                configurable: true
            });
            Object.defineProperty(this, "pieceColor", {
                set: function (v) {
                    this._attr("_pieceColor", v);
                    this.updateSprite();
                },
                get: function () {
                    return this._pieceColor;
                },
                configurable: true
            });
        },
        getSpriteName: function() {
            if (this.pieceColor === "+"){
                return this.pieceName;
            }else{
                return this.pieceName.toLowerCase();
            }
        },
        isPromotable: function(rank) {
            if (this.oldReg.isKomaDai()){
                return false;
            }
            var was = this.oldReg.iY;
            var c = this.pieceColor;
            return (this.pieceName in this.promotion) && (
                this.isInFieldOf(c, rank) ||
                this.isInFieldOf(c, was));
        },
        isInFieldOf: function(color, y) {
            if (color === "+") {
                return (y > 0 && y < 4);
            }
            if (color === "-") {
                return y > 6 && y < 10;
            }
        },
        promote: function(){
            this.pieceName = this.promotion[this.pieceName];
        },
        unpromote: function(){
            var mapping = {
                TO:"FU",
                NY:"KY",
                NK:"KE",
                NG:"GI",
                UM:"KA",
                RY:"HI"
            };
            if (this.pieceName in mapping){
                this.pieceName = mapping[this.pieceName];
            }
        },
        onStartDrag: function(evt) {
            this._reportEvt(evt);
            this.attr({z: 2000});
            var reg = this.findBestRegion(null);
            this.oldReg = reg;
            reg.trigger("Departure", {piece: this});
            if (this.veto) {
                this.revoke(this.veto);
            } else {
            }
        },
        updateSprite: function() {
            var xs = komaSpriteMapping[this.getSpriteName()];
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
            this.oldReg.trigger("Arrival", {piece: this, veto: reason});
            this.oldReg = null;
        },
        onStopDrag: function(evt) {
            this._reportEvt(evt);
            this.attr({z: 1000});
            var reg = this.findBestRegion(this.oldReg);
            /*
             * Things to be handled on Arrival:
             * snap to grid, 
             * promote, 
             * moving taken piece to komadai, 
             * unpromote
             */
            reg.trigger("Arrival", {piece: this});
            if (this.veto) {
                this.revoke(this.veto);
            } else {
            }
        },
        _reportEvt: function(evt) {
            console.log(evt);
            console.log("Piece", this._entityName);
            console.log("Event X, y", evt.clientX, evt.clientY);
            console.log("x,y", this.x, this.y);
        },
    }); //Crafty.c Piece


    Crafty.c("Board", {
        squares: null,
        init: function() {
            this.requires("2D, DOM, SpriteBoard");
            if (Crafty.support.setter) {
                this._defineGetterSetterXsetter();
            } else if (Crafty.support.defineProperty) {
                //IE9 supports Object.defineProperty
                this._defineGetterSetterXdefineProperty();
            }
            this.squares = {};
        },
        makeRegions: function() {
            var board = this;
            _.each(_.range(1, 10, 1), function (i) {
                board.squares[i] = {};
                _.each(_.range(1, 10, 1), function (j) {
                    var entity = Crafty.e(
                        "2D, DOM, Text, Region, Collision, Mutex"
                    );
                    entity.text("" + i + ","+ j);
                    entity.attr({
                        visible:false,
                        x: board.i2x(i),
                        y: board.j2y(j),
                        w: board.cellW,
                        h: board.cellH,
                        z: 50
                    });
                    entity.attr({iX:i, iY:j});
                    entity.shogi = board.shogi;
                    board.squares[i][j] = entity;
                });
            });
        },
        i2x: function(idx) {
            return (9 - idx) * this.cellW + this.offX + this.x;
        },
        j2y: function (idx) {
            return (idx - 1) * this.cellH + this.offY + this.y;
        },
        _offX: 0,
        _offY: 0,
        _cellW: 0,
        _cellH: 0,
        _defineGetterSetterXsetter: function () {
            this.__defineSetter__("offX", function (v) {
                this._attr("_offX", v);
            });
            this.__defineGetter__("offX", function () {
                return this._offX;
            });
            this.__defineSetter__("offY", function (v) {
                this._attr("_offY", v);
            });
            this.__defineGetter__("offY", function () {
                return this._offY;
            });
            this.__defineSetter__("cellW", function (v) {
                this._attr("_cellW", v);
            });
            this.__defineGetter__("cellW", function () {
                return this._cellW;
            });
            this.__defineSetter__("cellH", function (v) {
                this._attr("_cellH", v);
            });
            this.__defineGetter__("cellH", function () {
                return this._cellH;
            });
        },
        _defineGetterSetterXdefineProperty: function () {
            Object.defineProperty(this, "offX", {
                set: function (v) {
                    this._attr("_offX", v);
                },
                get: function () {
                    return this._offX;
                },
                configurable: true
            });
            Object.defineProperty(this, "offY", {
                set: function (v) {
                    this._attr("_offY", v);
                },
                get: function () {
                    return this._offY;
                },
                configurable: true
            });
            Object.defineProperty(this, "cellW", {
                set: function (v) {
                    this._attr("_cellW", v);
                },
                get: function () {
                    return this._cellW;
                },
                configurable: true
            });
            Object.defineProperty(this, "cellH", {
                set: function (v) {
                    this._attr("_cellH", v);
                },
                get: function () {
                    return this._cellH;
                },
                configurable: true
            });
        },
        initialSetup: function() {
            this.csaSetup(
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
        csaSetup: function () {
            var rank = new RegExp("^P(\\d)");
            var sq = new RegExp(
                "((?:[-+])"+
                "(?:FU|KY|KE|GI|KI|KA|HI|OU|TO|NY|NK|NG|UM|RY))|( \\* )",
                "g"
            );
            var pieces = [];
            var board = this;
            console.log(board.squares);
            
            _.each(arguments, function(s){
                var xs = s.split(rank);
                var r = parseInt(xs[1], 10);
                _.each(xs[2].match(sq), function(elem, x) {
                    if (elem[0] === "-" || elem[0] === "+") {
                        var piece = Crafty.e(
                            "2D, DOM, Mouse, Draggable,"+
                            "Collision, SpritePiece, Piece"
                        );
                        piece.shogi = board.shogi;
                        piece.attr({z: 1000,
                                    pieceName: elem.substring(1, 3),
                                    pieceColor: elem[0],
                                    });
                        console.log(
                            "entity for",
                            9 - x,
                            r,
                            piece.getSpriteName()
                        );
                        var reg = board.squares[9 - x][r];
                        reg._place(piece); //fix this
                        pieces.push(piece);

                    }
                });
            });
            return pieces;
        },
    }); //Crafty.c Board

    Crafty.c("Shogi", {
        init: function () {
            this.requires("obj")
            .bind("Arrival", this.onArrival)
            .bind("Departure", this.onDeparture);
            this.listeners = [];
            this.receivedEvents = [];
            this.makeBoard();
            this.makeKomaDai();
            this.makeKomaBukuro();
        },
        makeBoard: function() {
            var shogi = this;
            var board = Crafty.e("2D, Dom, Board, SpriteBoard");
            board.shogi = shogi;
            shogi.board = board;
            board.attr({
                x: 200,
                y: 0,
                "offX":30,
                "offY":32,
                z:50,
                "cellW": 60,
                "cellH": 64
            });
            board.makeRegions();
        },
        makeKomaDai: function() {
            var shogi = this;
            shogi.komaDai = {};
            shogi.komaDai["+"] = Crafty.e(
                "2D, Dom, SpriteKomadai, Region, Collision, Stack"
            );
            shogi.komaDai["+"].attr({x:820, y:240, z:51, name:"+"});
            shogi.komaDai["+"].shogi = shogi;
            shogi.komaDai["-"] = Crafty.e(
                "2D, Dom, SpriteKomadai, Region, Collision, Stack"
            );
            shogi.komaDai["-"].attr({x:20, y:20, z:51, name:"-"});
            shogi.komaDai["-"].shogi = shogi;
        },
        makeKomaBukuro : function() {
            var shogi = this;
            shogi.komaBukuro= {};
        },
        initialSetup: function() {
            this.board.initialSetup();
        },
        subscribe: function(listener) {
            this.listeners.push(listener);
        },
        getLastEvent: function() {
            return this.receivedEvents.pop();
        },
        onDeparture: function(evt) {
            console.log("Shogi: onDeparture", evt);
            this.receivedEvents.push(evt);
        },
        onArrival: function(evt) {
            var lastEvt = this.getLastEvent();
            console.log("Shogi: onArrival:", lastEvt, evt);
            var cmd = this.makeCommand(lastEvt, evt);
            this.notify(cmd);
        },
        notify: function(cmd) {
            _.each(this.listeners, function(listener) {
                listener(cmd);
            });
        },
        makeCommand: function(fromEvt, toEvt) {
            var cmd = {};
            /* fromEvt.piece === toEvt.piece */
            cmd.piece = toEvt.piece.pieceName;
            cmd.side = toEvt.piece.pieceColor;
            cmd.promoted = toEvt.promoted;

            if (fromEvt.region.isKomaDai()){
                cmd.fromKomadai = true;
            } else {
                cmd.fromKomadai = false;
                cmd.fromX = fromEvt.region.iX;
                cmd.fromY = fromEvt.region.iY;
            }

            if (toEvt.region.isKomaDai()){
                cmd.toKomadai = true;
            } else {
                cmd.toKomadai = false;
                cmd.toX = toEvt.region.iX;
                cmd.toY = toEvt.region.iY;
            }

            return cmd;
        },
        handleCommand: function(cmd) {
            var src = null;
            var dst = null;
            var evt = {byCommand: true};
            
            if (cmd.fromKomaBukuro) {
                // not implemented yet.
                src = this.komaBukuro;
                evt.piece = src.peekPieceByName(cmd.fromPiece);
            } else if(cmd.fromKomadai) {
                src = this.komaDai[cmd.side];
                evt.piece = src.peekPieceByName(cmd.fromPiece);
            } else {
                src = this.board.squares[cmd.fromX][cmd.fromY];
                evt.piece = src.piece;
            }
            src.trigger("Departure", evt);

            if (cmd.toKomaBukuro) {
                // not implemented yet.
                dst = this.komaBukuro;
            } else if(cmd.toKomadai) {
                dst = this.komaDai[cmd.side];
            } else {
                dst = this.board.squares[cmd.toX][cmd.toY];
                evt.promoted = cmd.promoted;
            }
            dst.trigger("Arrival", evt);
        },
    }); //Crafty.c Shogi

})(); //shogi.js
