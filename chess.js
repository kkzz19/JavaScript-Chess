var canvas = $('#canvas');
var canvasEl = canvas[0];
var ctx = canvasEl.getContext("2d");
var selX = -1;
var selY = -1;

var rookBlack = new Image;
rookBlack.src = "pieceSprites/rookBlack.png";
var rookWhite = new Image;
rookWhite.src = "pieceSprites/rookWhite.png";
var bishopBlack = new Image;
bishopBlack.src = "pieceSprites/bishopBlack.png";
var bishopWhite = new Image;
bishopWhite.src = "pieceSprites/bishopWhite.png";
var pawnBlack = new Image;
pawnBlack.src = "pieceSprites/pawnBlack.png";
var pawnWhite = new Image;
pawnWhite.src = "pieceSprites/pawnWhite.png";
var knightBlack = new Image;
knightBlack.src = "pieceSprites/knightBlack.png";
var knightWhite = new Image;
knightWhite.src = "pieceSprites/knightWhite.png";
var queenBlack = new Image;
queenBlack.src = "pieceSprites/queenBlack.png";
var queenWhite = new Image;
queenWhite.src = "pieceSprites/queenWhite.png";
var kingBlack = new Image;
kingBlack.src = "pieceSprites/kingBlack.png";
var kingWhite = new Image;
kingWhite.src = "pieceSprites/kingWhite.png";

function Piece(color, value, img) {
  this.color = color;
  this.value = value;
  this.img = img;
}

Piece.prototype.canMove = function(x2, y2, ignoreCheck) {
  
  var x1 = this.x, y1 = this.y;
  //Can never move to same position
  if(x1 === x2 && y1 === y2) return false;  
  //Can never move to ally piece
  var destPiece = board[y2][x2];
  if(destPiece && this.color === destPiece.color) return false;

  var causesCheck = false;
  var col = this.color;

  if(!ignoreCheck) {
    //Try moving to this position. If it causes a check, it's illegal.
    tempMove(this, x2, y2, function() {
      if(inCheck(col)) {
        causesCheck = true;
      }
    });
    if(causesCheck) {
      return false;
    }
  }

  return true;
}
//Checks if there are any pieces in way of the start and end points.
//If noCapture = true then the destination must not have an enemy piece
Piece.prototype.inWay = function(x2, y2, noCapture) {
  var x1 = this.x, y1 = this.y;
  //If path is not a straight line or diagonal, returns true (so that fail can be returned)
  if(x1 !== x2 && y1 !== y2 && Math.abs(x2 - x1) !== Math.abs(y2 - y1)) return true;
  var xIncDir = Math.sign(x2 - x1);
  var yIncDir = Math.sign(y2 - y1);
  var x = x1;
  var y = y1;
  var len = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for(var i = 0; i < len - 1; i++) {
    x += xIncDir;
    y += yIncDir;
    if(board[y][x]) {
      return true;
    }
  }
  if(noCapture && board[y2][x2]) return true;
  return false;
}
Piece.prototype.getValidMovePositions = function() {
  var validMovePoses = [];
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      if(this.canMove(x, y)) {
        validMovePoses.push({x: x, y: y});
      }
    }
  }
  return validMovePoses;
}

function Pawn(color) {
  Piece.call(this, color, 1, color === 0 ? pawnBlack : pawnWhite);
}
Pawn.prototype = Object.create(Piece.prototype);
Pawn.prototype.canMove = function(x2, y2, ignoreCheck) {
  var x1 = this.x, y1 = this.y;
  var baseCanMove = Piece.prototype.canMove.call(this, x2, y2, ignoreCheck);
  if(!baseCanMove) return false;

  var moveDir = (this.color === 0 ? 1 : -1);
  var pawnStartY = (this.color === 0 ? 1 : 6);
  var destPiece = board[y2][x2];
  //Moving forward 1 place
  if(x1 === x2 && y1 + moveDir === y2 && !destPiece) {
    return true;
  }
  //Moving forward 2 places
  if(x1 === x2 && y1 + moveDir*2 === y2 && y1 === pawnStartY && !this.inWay(x2, y2, true) && !destPiece) {
    return true;
  }
  //Diagonal capture
  else if(Math.abs(x1 - x2) === 1 && y1 + moveDir === y2 && destPiece && destPiece.color !== this.color) {
    return true;
  }
  return false;
}

function Knight(color) {
  Piece.call(this, color, 3, color === 0 ? knightBlack : knightWhite);
}
Knight.prototype = Object.create(Piece.prototype);
Knight.prototype.canMove = function(x2, y2, ignoreCheck) {
  var x1 = this.x, y1 = this.y;
  var baseCanMove = Piece.prototype.canMove.call(this, x2, y2, ignoreCheck);
  if(!baseCanMove) return false;

  if(x1 === x2 && y1 === y2) return false;
  if(board[y2][x2] && board[y2][x2].color === this.color) return false;

  return (Math.abs(x2 - x1) === 2 && Math.abs(y2 - y1) === 1) || (Math.abs(x2 - x1) === 1 && Math.abs(y2 - y1) === 2);

}

function Bishop(color) {
  Piece.call(this, color, 3, color === 0 ? bishopBlack : bishopWhite);
}
Bishop.prototype = Object.create(Piece.prototype);
Bishop.prototype.canMove = function(x2, y2, ignoreCheck) {
  var x1 = this.x, y1 = this.y;
  var baseCanMove = Piece.prototype.canMove.call(this, x2, y2, ignoreCheck);
  if(!baseCanMove) return false;

  if(Math.abs(x2 - x1) !== Math.abs(y2 - y1)) return false;
  if(this.inWay(x2, y2)) return false;
  return true;
}

function Rook(color) {
  Piece.call(this, color, 5, color === 0 ? rookBlack : rookWhite);
}
Rook.prototype = Object.create(Piece.prototype);
Rook.prototype.canMove = function(x2, y2, ignoreCheck) {
  var x1 = this.x, y1 = this.y;
  var baseCanMove = Piece.prototype.canMove.call(this, x2, y2, ignoreCheck);
  if(!baseCanMove) return false;

  if(!((x2 === x1 && y2 !== y1) || (x2 !== x1 && y2 === y1))) return false;
  if(this.inWay(x2, y2)) return false;
  return true;
}

function Queen(color) {
  Piece.call(this, color, 9, color === 0 ? queenBlack : queenWhite);
}
Queen.prototype = Object.create(Piece.prototype);
Queen.prototype.canMove = function(x2, y2, ignoreCheck) {
  var x1 = this.x, y1 = this.y;
  var baseCanMove = Piece.prototype.canMove.call(this, x2, y2, ignoreCheck);
  if(!baseCanMove) return false;
  return !this.inWay(x2, y2);
}

function King(color) {
  Piece.call(this, color, Infinity, color === 0 ? kingBlack : kingWhite);
}
King.prototype = Object.create(Piece.prototype);
King.prototype.canMove = function(x2, y2, ignoreCheck) {
  var x1 = this.x, y1 = this.y;
  var baseCanMove = Piece.prototype.canMove.call(this, x2, y2, ignoreCheck);
  if(!baseCanMove) return false;

  if(Math.abs(x2 - x1) > 1 || Math.abs(y2 - y1) > 1) return false;
  if(this.inWay(x2, y2)) return false;
  return true;
}

var board = [
  [new Rook(0), new Knight(0), new Bishop(0), new Queen(0), new King(0), new Bishop(0), new Knight(0), new Rook(0)],
  [new Pawn(0), new Pawn(0), new Pawn(0), new Pawn(0), new Pawn(0), new Pawn(0), new Pawn(0), new Pawn(0)],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [new Pawn(1), new Pawn(1), new Pawn(1), new Pawn(1), new Pawn(1), new Pawn(1), new Pawn(1), new Pawn(1)],
  [new Rook(1), new Knight(1), new Bishop(1), new Queen(1), new King(1), new Bishop(1), new Knight(1), new Rook(1)],
];

function updatePositions() {
  for(var y = 0; y < board.length; y++) {
    for(var x = 0; x < board[y].length; x++) {
      var piece = board[y][x];
      if(piece) {
        piece.x = x;
        piece.y = y;
      }
    }
  }
}

function getPieces(color, isEnemy) {
  var pieces = [];
  for(var y = 0; y < board.length; y++) {
    for(var x = 0; x < board[y].length; x++) {
      var piece = board[y][x];
      if(piece) {
        if(isEnemy && piece.color !== color) {
          pieces.push(piece);
        } 
        else if(!isEnemy && piece.color === color) {
          pieces.push(piece);
        }
      }
    }
  }
  return pieces;
}

function getKing(color) {
  for(var y = 0; y < board.length; y++) {
    for(var x = 0; x < board[y].length; x++) {
      var piece = board[y][x];
      if(piece && (piece instanceof King) && piece.color === color) {
        return piece;
      }
    }
  }
  return null;
}

function inCheck(color) {
  var king = getKing(color);
  var enemyPieces = getPieces(color, true);
  for(var i = 0; i < enemyPieces.length; i++) {
    if(enemyPieces[i].canMove(king.x, king.y, true)) {
      return true;
    }
  }
  return false;
}

function tempMove(piece, x, y, callback) {

  //Save old position pieces
  var oldToPiece = board[y][x];
  var oldPieceX = piece.x;
  var oldPieceY = piece.y;

  //Temporarily move to spot
  board[y][x] = piece;
  board[oldPieceY][oldPieceX] = null;
  updatePositions();

  //Invoke callback
  callback();

  //Revert move
  board[y][x] = oldToPiece;
  board[oldPieceY][oldPieceX] = piece;
  updatePositions();
}

function inCheckMate(color) {
  var pieces = getPieces(color);
  var inMate = true;
  for(var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    //Get all valid move positions
    var validMovePositions = piece.getValidMovePositions();
    //console.log(validMovePositions.length);
    for(var j = 0; j < validMovePositions.length; j++) {
      var movePos = validMovePositions[j];
      tempMove(piece, movePos.x, movePos.y, function() {
        if(!inCheck(color)) {
          inMate = false;
        }
      });

      if(!inMate) {
        return false;
      }
    }
  } 
  return true;
}

function drawBoard() {
  //Colors
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      if(x % 2 === (y % 2 === 0 ? 0 : 1)) ctx.fillStyle = "white";
      else ctx.fillStyle = "gray";
      ctx.fillRect(x * 75, y * 75, 75, 75);
    }
  }
  //Pieces
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      var piece = board[y][x];
      if(piece) {
        ctx.drawImage(piece.img, (x*75) + 12, (y*75) + 12);
      }
    }
  }
  //Selection box
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      if(lastSelX === x && lastSelY === y) {
        ctx.strokeStyle = "green";
        ctx.lineWidth = 5;
        ctx.strokeRect(x * 75, y * 75, 75, 75);
      }
    }
  }

  /*
  //Shows the control extent of both players for debugging/handicap
  var pieces = getPieces(1);
  var whiteCtrlHash = {};
  var blackCtrlHash = {};
  for(var i = 0; i < pieces.length; i++) {
    var movePoses = pieces[i].getValidMovePositions();
    for(var j = 0; j < movePoses.length; j++) {
      whiteCtrlHash[String(movePoses[j].x) + String(movePoses[j].y)] = true;
    }
  }
  pieces = getPieces(0);
  for(var i = 0; i < pieces.length; i++) {
    var movePoses = pieces[i].getValidMovePositions();
    for(var j = 0; j < movePoses.length; j++) {
      blackCtrlHash[String(movePoses[j].x) + String(movePoses[j].y)] = true;
    }
  }
  var whiteControls = false;
  var blackControls = false;
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      //Get all white move positions
      if(whiteCtrlHash[String(x) + String(y)]) {
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        ctx.textBaseline="top"; 
        ctx.font = "30px Arial";
        ctx.fillText("O", 20 + x * 75,  15 + y * 75)
      }
      if(blackCtrlHash[String(x) + String(y)]) {
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.textBaseline="top"; 
        ctx.font = "30px Arial";
        ctx.fillText("X", 60 + x * 75,  15 + y * 75)
      }
    }
  }
  */
  /*
  //Currently selected piece allowed movement for debugging/handicap
  if(lastClickedPiece) {
    for(var y = 0; y < 8; y++) {
      for(var x = 0; x < 8; x++) {
        if(lastClickedPiece.canMove(x, y)) {
          ctx.fillStyle = "green";
          ctx.textAlign = "center";
          ctx.textBaseline="top"; 
          ctx.font = "30px Arial";
          ctx.fillText("X", 32 + x * 75,  15 + y * 75)
        }
      }
    }
  }
  */
}

var lastClickedPiece = null;
var lastSelX = -1;
var lastSelY = -1;
var whoseTurn = 1;  //White = 1, black = 0

function deselect() {
  lastClickedPiece = null;
  lastSelX = -1;
  lastSelY = -1;
  drawBoard();
}

function gethighestPieceValueVulnerable() {
  var pieces = getPieces(0);
  var vals = [0];
  var enemyPieces = getPieces(1);
  for(var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    for(var j = 0; j < enemyPieces.length; j++) {
      var enemyPiece = enemyPieces[j];
      if(enemyPiece.canMove(piece.x, piece.y)) {
        vals.push(piece.value);
      }
    }
  }
  return Math.max.apply(Math, vals);
}

function AIMove() {
  var pieces = getPieces(0);
  var moves = [];
  for(var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    var curMoves = piece.getValidMovePositions();
    for(var j = 0; j < curMoves.length; j++) {
      var move = curMoves[j];
      move.piece = piece;

      //Calculate value of move.

      //Calculate current "highest piece lost" vulnerability before the move
      var highestPieceValueVulnerableBefore = gethighestPieceValueVulnerable();
      var highestPieceValueVulnerableAfter;

      //Get killed piece value
      var killedPieceVal = 0;
      var killedPiece = board[move.y][move.x];
      if(killedPiece) killedPieceVal = killedPiece.value;

      var deliverCheck = 0;

      //Simulate the move
      tempMove(piece, move.x, move.y, function() {
        highestPieceValueVulnerableAfter = gethighestPieceValueVulnerable();
        if(inCheck(1)) {
          deliverCheck = 0.5;
        }
      });

      //Get the highest piece vulnerable delta
      var protectionDelta = highestPieceValueVulnerableBefore - highestPieceValueVulnerableAfter;

      move.value = killedPieceVal + protectionDelta + deliverCheck;
      
      //King gets less priority
      if(piece instanceof King) {
        move.value -= 0.1;        
      }

      moves.push(move);
    }
  }

  //Sort descending
  moves.sort(function(a, b) {
    return b.value - a.value;
  });

  var initMoveVal = moves[0].value;
  var movePool = [];
  for(var i = 0; i < moves.length; i++) {
    var move = moves[i];
    if(move.value !== initMoveVal) break;
    movePool.push(move);
  }
  //console.log(moves);
  var randBestMove = movePool[Math.floor(Math.random() * movePool.length)];

  movePiece(randBestMove.piece, randBestMove.x, randBestMove.y);

}

var vsAI = true;
var gameOver = false;

canvas.on("click", function(event) {

  if(gameOver) {
    return;
  }
  //AI is black
  if(vsAI && whoseTurn === 0) {
    return;
  }

  var x = event.pageX - canvasEl.offsetLeft;
  var y = event.pageY - canvasEl.offsetTop;

  var selX = Math.floor(x / 75);
  var selY = Math.floor(y / 75);

  if(selX === lastSelX && selY == lastSelY) {
    deselect();
    return;
  }

  var clickedPiece = board[selY][selX];
  //Clicked on nothing to nothing: don't select
  if(!clickedPiece && !lastClickedPiece) {
    deselect();
    return;
  }
  //Clicked on nothing to enemy piece: don't select
  if(clickedPiece && clickedPiece.color !== whoseTurn && !lastClickedPiece) {
    deselect();
    return;
  }

  var sameEntryClicked = (selX === lastSelX && selY === lastSelY);
  var ownPieceClicked = (clickedPiece && clickedPiece.color === whoseTurn);

  if(lastClickedPiece && lastClickedPiece.color === whoseTurn && !sameEntryClicked && !ownPieceClicked) {
    //Check if move is possible
    if(lastClickedPiece.canMove(selX, selY)) {
      movePiece(lastClickedPiece, selX, selY);
      return;
    } else {
      console.log("Illegal move!");
      deselect();
      return;
    }
  }

  lastSelX = selX;
  lastSelY = selY;
  lastClickedPiece = clickedPiece;

  //console.log(selX + "," + selY)

  drawBoard();
});

function movePiece(piece, newX, newY) {
  var oldX = piece.x;
  var oldY = piece.y;
  board[oldY][oldX] = null;
  board[newY][newX] = piece;
  updatePositions();

  turnEnd();
}

function turnEnd() {
  whoseTurn = (whoseTurn === 1 ? 0 : 1);
  deselect();

  if(inCheckMate(whoseTurn)) {
    window.setTimeout(function() {
      alert("Checkmate! "  + (whoseTurn === 0 ? "White" : "Black") + " wins!");
    });
    gameOver = true;
    return;
  }
  else if(inCheck(whoseTurn)) {
    console.log((whoseTurn === 0 ? "Black" : "White") + " is in check!");
  }
  /*
  else if(isStaleMate(whoseTurn)) {
    alert("Stalemate!");
  }
  */

  if(vsAI && whoseTurn === 0) {
    window.setTimeout(function() {
      AIMove();
    }, 500);
  }
}

setTimeout(function() {
  updatePositions();
  drawBoard();
}, 100);