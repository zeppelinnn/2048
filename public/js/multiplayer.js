// var moveList = document.getElementsByClassName("inputlist")[0];
// var highscoreList = document.getElementsByClassName("scorelist")[0];
// var userCount = document.getElementsByClassName("numUsers")[0];
var userCount = $("#numUsers").html();

var socket = io.connect();
var userId;

var Multiplayer = {
  move: function (direction) {
    socket.emit('move', direction);
  }
};

// on connection
socket.on('connected', function (data) {
  userId = data.userId;
  console.log(data);
  var state = data.gameState;
  if (!state) manager.getState();
  updateUserCount(data);
  manager.setBoard(state);
});


socket.on('move', function (data) {
  // Add move to input list
  var direction = data.direction;
  var userId = data.userId;

  // Update number of users
  updateUserCount(data);

  // Set the game state (if we're not in a pause state)
  if (!(manager.won || manager.over)) {
    if (userId == "crowd") {
      manager.setBoard(data.gameState);
    }
  }
});

socket.on('join', function (data) {
  updateUserCount(data);
});

socket.on('restart', function (gameData) {
  // var highscores = gameData.highscores;
  // setHighscores(highscores);
  manager.restart();
  manager.setBoard(gameData);
});

// Update the user count
function updateUserCount (data) {
  // var numUsers = data.numUsers;
  userCount = data.numUsers;
  $(".numUsers").html(userCount);
  // userString.innerHTML = numUsers === 1 ? 'user' : 'users';
}
