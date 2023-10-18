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

  return {
    getMarker,
    setMarker,
    getName,
    setName,
    upScore,
    resetScore,
  };
}

const gameBoard = (function () {
  let _boardState = ['', '', '', '', '', '', '', '', ''];

  function getBoardState() {
    return _boardState;
  }

  function placeMarker(marker, cell) {
    _boardState[cell.dataset.cellid] = marker;
  }

  function isLegalMove(cell) {
    return _boardState[cell.dataset.cellid] === '';
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

const game = (function () {
  let _round = 0;
  let _winner;
  const _players = {
    player1: player('Xs player', 'X'),
    player2: player('Os player', 'O'),
  };
  let _currentPlayer = _players.player1;

  function playRound(cell) {
    if (!gameBoard.isLegalMove(cell)) return;

    _round++;
    gameBoard.placeMarker(_currentPlayer.getMarker(), cell);

    if (checkWin(_currentPlayer, gameBoard.getBoardState())) {
      _winner = _currentPlayer;
      _winner.upScore();
      console.log(_winner.getName());
    } else if (!checkWin(_currentPlayer, gameBoard.getBoardState()) && _round === 9) {
      _winner = 'draw';
      console.log('draw');
    }

    _currentPlayer = _currentPlayer === _players.player1 ? _players.player2 : _players.player1;
  }

  function checkWin(currentPlayer, boardState) {
    let winningCellsCount = 0;
    const winCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const winCombination of winCombinations) {
      winningCellsCount = 0;

      for (const position of winCombination) {
        if (boardState[position] === currentPlayer.getMarker()) {
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

  function resetGame() {
    gameBoard.clearState();
    _currentPlayer = _players.player1;
    _winner = '';
    _round = 0;
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
  };
})();

const screenController = (function () {
  function updateScreen(boardCells) {
    boardCells.forEach((cell, index) => {
      cell.dataset.marker = gameBoard.getBoardState()[index];
      cell.dataset.currentmarker = game.getCurrentPlayer().getMarker();
    });

    if (game.getWinner()) {
      game.resetGame();

      setTimeout(() => {
        boardCells.forEach((cell, index) => {
          cell.dataset.marker = gameBoard.getBoardState()[index];
          cell.dataset.currentmarker = game.getCurrentPlayer().getMarker();
        });
      }, 1000);
    }
  }

  function handleClick(cell) {
    game.playRound(cell);
  }

  return {
    handleClick,
    updateScreen,
  };
})();

///////////////////////////////////////////////////////////////////////////////////////////////////////
const boardCells = document.querySelectorAll('.cell');

boardCells.forEach((cell) =>
  cell.addEventListener('click', () => {
    screenController.handleClick(cell);
    screenController.updateScreen(boardCells);
  })
);

