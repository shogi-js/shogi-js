'use strict';

var Game = {
  // Initialize and start our game
  start: function () {
    Crafty.load([ ], function () {

      // Start crafty and set a background color so that we can see it's working
      Crafty.init(1000, 1000);
      Crafty.background('#FFFFFF');

      // Simply start splashscreen
      //Crafty.scene('Splashscreen');
    });
  }
};

Game.start();