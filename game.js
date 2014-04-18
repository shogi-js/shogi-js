/*global Crafty: false $: false */
$(document).ready(function() {
    "use strict";
    Crafty.init(200 + 600 + 200, 1000);
    Crafty.canvas.init();

    Crafty.scene("loading", function() {
        // Load our assets
        Crafty.load([ "assets/opening2.mp3", "assets/snap.mp3",
                "assets/ncoin.mp3",
                //"assets/opening2.ogg",
                //"assets/snap.ogg",
                //"assets/ncoin.ogg",
                "assets/opening2.wav",
                "assets/snap.wav",
                "assets/ncoin.wav",
                "assets/koma.png",
                "assets/board.jpg",
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
        Crafty.background("#FFFFFF url(assets/tatami.jpg) repeat");
        Crafty.sprite("assets/board.jpg", {SpriteBoard: [0, 0, 600, 640]});
        Crafty.sprite("assets/mokume.png", {SpriteKomadai: [0, 0, 160, 380]});
        Crafty.sprite("assets/koma.png", {SpritePiece:[0,0,60,64]});
        
        _.each(["mp3", "wav", "ogg"], function(ext){
            console.log("audio:", ext, Crafty.audio.supports(ext));
        });
        Crafty.audio.add({
            welcome: [
                "assets/opening2.mp3", 
                //"assets/opening2.ogg",
                "assets/opening2.wav"],
            snap: [
                "assets/snap.mp3",
                //"assets/snap.ogg",
                "assets/snap.wav"],
            coin: [
                "assets/ncoin.mp3",
                //"assets/ncoin.ogg",
                "assets/ncoin.wav"]});
        Crafty.audio.play("welcome");



        var game = Crafty.e("Shogi");
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
        recorder.startListen(game);
    });

    Crafty.scene("loading");
})
