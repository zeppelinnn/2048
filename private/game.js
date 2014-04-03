var GameManager = require('./game_manager');

var gm = new GameManager(4);
var isRestarting = false;

module.exports = {
  move: function (direction) {
    gm.move(direction);
  },

  getState: function () {
    return gm.getState();
  },

  restart: function () {
    // can't restart while restarting
    if (!isRestarting) {
      isRestarting = true;
      setTimeout(function() {
        isRestarting = false;
        gm.restart();
      }, 3000);
    }
  }

};