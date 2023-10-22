//****************************************player module****************************************//
function player(name, marker) {
  let _name = name;
  let _marker = marker;
  let _score = 0;

  function getMarker() {
    return _marker;
  }

  function getName() {
    return _name;
  }

  function setMarker(newMarker) {
    _marker = newMarker;
  }

  function setName(newName) {
    _name = newName;
  }

  function upScore() {
    _score++;
  }

  function resetScore() {
    _score = 0;
  }

  function getScore() {
    return _score;
  }

  return {
    getMarker,
    setMarker,
    getName,
    setName,
    upScore,
    resetScore,
    getScore,
  };
}

//****************************************board module****************************************//
const gameBoard = (function () {
  let _boardState = ['', '', '', '', '', '', '', '', ''];

  function getBoardState() {
    return _boardState;
  }

  function placeMarker(marker, cellId) {
    _boardState[cellId] = marker;
  }

  function isLegalMove(cellId) {
    return _boardState[cellId] === '';
  }

  function clearState() {
    _boardState = ['', '', '', '', '', '', '', '', ''];
  }

  return {
    getBoardState,
    placeMarker,
    isLegalMove,
    clearState,
  };
})();

//****************************************game module****************************************//
const game = (function () {
  let _round = 0;
  let _winner;
  const _players = {
    player1: player('X - bot', 'X'),
    player2: player('O - player', 'O'),
  };
  let _currentPlayer = _players.player1.getMarker() === 'X' ? _players.player1 : _players.player2;

  function playRound(cellId) {
    if (!gameBoard.isLegalMove(cellId)) return;
    _round++;
    gameBoard.placeMarker(_currentPlayer.getMarker(), cellId);

    if (checkWin()) {
      handleWin();
    } else if (!checkWin() && _round === 9) {
      handleDraw();
    }

    _currentPlayer = _currentPlayer === _players.player1 ? _players.player2 : _players.player1;
  }

  function checkWin() {
    if (_round < 5) return;
    let winningCellsCount = 0;
    const boardState = gameBoard.getBoardState();
    const WIN_COMBINATIONS = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const winCombination of WIN_COMBINATIONS) {
      winningCellsCount = 0;

      for (const position of winCombination) {
        if (boardState[position] === _currentPlayer.getMarker()) {
          winningCellsCount++;
        } else {
          break;
        }

        if (winningCellsCount === 3) {
          return true;
        }
      }
    }
    return false;
  }

  function handleWin() {
    _winner = _currentPlayer.getName();
    _currentPlayer.upScore();
    console.log(`${_winner} wins the round! Current score: ${_currentPlayer.getScore()}`); //will be deleted
  }

  function handleDraw() {
    _winner = 'draw';
    console.log('draw'); //will be deleted
  }

  function getBestMove() {
    let randomMove = 0;

    do {
      randomMove = Math.floor(Math.random() * 9);
    } while (!gameBoard.isLegalMove(randomMove));

    return randomMove;
  }

  function aiMakeMove() {
    if (getWinner() || !isCurrentPlayerBot()) return;
    const cellId = getBestMove();

    setTimeout(() => {
      screenController.handleCellChange(cellId);
    }, 500);
  }

  function isCurrentPlayerBot() {
    return _currentPlayer.getName().includes('bot');
  }

  function resetGame() {
    gameBoard.clearState();
    _currentPlayer = _players.player1.getMarker() === 'X' ? _players.player1 : _players.player2;
    _winner = '';
    _round = 0;

    aiMakeMove();
  }

  function getWinner() {
    return _winner;
  }

  function getCurrentPlayer() {
    return _currentPlayer;
  }

  return {
    playRound,
    getWinner,
    getCurrentPlayer,
    resetGame,
    isCurrentPlayerBot,
    getBestMove,
    aiMakeMove,
  };
})();

//****************************************screenController module****************************************//
const screenController = (function () {
  const boardCells = document.querySelectorAll('.cell');

  boardCells.forEach((cell) =>
    cell.addEventListener('click', () => {
      if (game.isCurrentPlayerBot()) return;
      handleCellChange(cell.dataset.cellid);
      game.aiMakeMove();
    })
  );

  function handleCellChange(cellId) {
    game.playRound(cellId);
    updateScreen();
  }

  function updateScreen() {
    boardCells.forEach((cell, index) => {
      cell.dataset.marker = gameBoard.getBoardState()[index];

      if (!game.isCurrentPlayerBot()) {
        cell.dataset.currentmarker = game.getCurrentPlayer().getMarker();
      } else {
        cell.dataset.currentmarker = '';
      }
    });

    if (game.getWinner()) {
      //zde se bude zapínat popup místo opakovaného resetu hry
      setTimeout(() => {
        game.resetGame();

        boardCells.forEach((cell, index) => {
          cell.dataset.marker = gameBoard.getBoardState()[index];
          cell.dataset.currentmarker = game.getCurrentPlayer().getMarker();
        });
      }, 1000);
    }
  }

  return {
    handleCellChange,
  };
})();

///////////////////////////////////////////////////////////////////////////////////////////////////////

if (game.isCurrentPlayerBot()) {
  game.aiMakeMove();
}

