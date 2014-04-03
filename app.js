var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , game = require('./private/game');

// serve public folder
app.use(express.static(__dirname + '/public'));

// listen on port
var port = 3000;
server.listen(port);

// setup game
var nextUserId = 0;
var moveCount = 0;

var voted = false;
var idsVoted = []; // keep track of which users have voted
var votes = [0, 0, 0, 0]

// start with a new state on server-side
game.restart();

// pick the most selected direction
setInterval(function() {
  direction = democracy(votes);
  if (direction === -1) {
    return;
  } else {
    moveCount++;

    game.move(direction)

    var data = {
      gameState: game.getState(),
      direction: direction,
      userId: "crowd",
      numUsers: Object.keys(io.sockets.manager.connected).length,
    };
    io.sockets.emit('move', data);
    if (data.gameState.over || data.gameState.won) {
      game.restart();
    }

  }

  // reset direction votes
  userMoves = {};
  idsVoted = [];
  votes = [0, 0, 0, 0];
  voted = false;
}, 1000);

// when a new client connects
io.sockets.on('connection', function(socket) {
  socket.userId = ++nextUserId;
  var numUsers = Object.keys(io.sockets.manager.connected).length;
  console.log("game state: " + game.getState());
  var data = {
    gameState: game.getState(),
    userId: socket.userId,
    numUsers: numUsers,
  };

  socket.emit('connected', data);
  socket.broadcast.emit('join', data);

  socket.on('sendMove', function (data) {
    console.log(data);
    if (!voted) {
      voted = true;
      votes[data.direction]++;

      // send move with old game state
      var state = game.getState();
      var data = {
        gameState: state,
        direction: direction,
        userId: socket.userId,
        numUsers: Object.keys(io.sockets.manager.connected).length,
      };

      io.sockets.emit('move', data);
    }
    });


    socket.on('disconnect', function() {
      var numUsers = Object.keys(io.sockets.manager.connected).length;
      var data = {
        gameState: game.getState(),
        numUsers: numUsers,
      };
        // update userCount on client side
        io.sockets.emit('join', data);
    });
});

// calculate which direction had the most votes
function democracy(votes) {
  var direction = 0;
  for (var i=0; i < votes.length; i++) {
    if (votes[i] > votes[direction]) {
      direction = i;
    }
  }

  if (votes[direction] == 0) {
    return -1;
  }

  return direction;
}