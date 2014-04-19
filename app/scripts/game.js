var TestBed = {
    start: function () {
        "use strict";

        Crafty.init(200 + 600 + 200, 1000);
        Crafty.canvas.init();

        Crafty.scene("loading", function() {
            // Load our assets
            Crafty.load([
                    "sounds/opening2.mp3",
                    "sounds/snap.mp3",
                    "sounds/ncoin.mp3",
                    //"sounds/opening2.ogg",
                    //"sounds/snap.ogg",
                    //"sounds/ncoin.ogg",
                    "sounds/opening2.wav",
                    "sounds/snap.wav",
                    "sounds/ncoin.wav",
                    "images/koma.png",
                    "images/board.jpg",
                ],
                function() {
                    Crafty.scene("main");
                },
                function() {
                    // progress
                },
                function(what) {
                    Crafty.e("2D, DOM, Text")
                        .attr({w: 1000, h: 20, x: 0, y: 120})
                        .text("error!:"+ what)
                        .css({"text-align": "center", "font-size": "30px"});
                }
            );

            // White background and some ugle text
            Crafty.background("#FFF");
            Crafty.e("2D, DOM, Text")
                .attr({w: 1000, h: 20, x: 0, y: 120})
                .text("Loading")
                .css({"text-align": "center", "font-size": "30px"});
        }); //scene loading


        Crafty.scene("main", function() {
            Crafty.background("#FFFFFF url(images/tatami.jpg) repeat");
            Crafty.sprite(
                "images/board.jpg",
                {SpriteBoard: [0, 0, 600, 640]});
            Crafty.sprite(
                "images/mokume.png",
                {SpriteKomadai: [0, 0, 160, 380]});
            Crafty.sprite(
                "images/koma.png",
                {SpritePiece:[0,0,60,64]});
            
            _.each(["mp3", "wav", "ogg"], function(ext){
                console.log("audio:", ext, Crafty.audio.supports(ext));
            });
            Crafty.audio.add({
                welcome: [
                    "sounds/opening2.mp3",
                    //"sounds/opening2.ogg",
                    "sounds/opening2.wav"
                ],
                snap: [
                    "sounds/snap.mp3",
                    //"sounds/snap.ogg",
                    "sounds/snap.wav"
                ],
                coin: [
                    "sounds/ncoin.mp3",
                    //"sounds/ncoin.ogg",
                    "sounds/ncoin.wav"
                ]
            });
            Crafty.audio.play("welcome");



            var game = Crafty.e("Shogi");
            var board = Crafty.e("2D, Dom, Board, SpriteBoard");
            board.game = game;
            board.attr({
                x: 200,
                y: 0,
                "offX":30,
                "offY":32,
                z:50,
                "cellW": 60,
                "cellH": 64
            });
            game.komaDai = {};
            game.komaDai["+"] = Crafty.e(
                "2D, Dom, SpriteKomadai, Region, Collision, Stack"
            );
            game.komaDai["+"].attr({x:820, y:240, z:51, name:"+"});
            game.komaDai["+"].game = game;
            game.komaDai["-"] = Crafty.e(
                "2D, Dom, SpriteKomadai, Region, Collision, Stack"
            );
            game.komaDai["-"].attr({x:20, y:20, z:51, name:"-"});
            game.komaDai["-"].game = game;
            board.layout();
            board.initialSetup();

            var recorder = Crafty.e("2D, DOM, Text, Recorder");
            recorder.attr({
                x:0,
                y:700,
                w:800,
                h:200,
                "background_color": "white"
            });
            recorder.text("test! test! test!");
            recorder.startListen(game);
        });
        Crafty.scene("loading");
    },
};

TestBed.start();
