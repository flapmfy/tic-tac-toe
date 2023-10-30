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

  function isBot() {
    return _name.includes('bot');
  }

  return {
    getMarker,
    setMarker,
    getName,
    setName,
    upScore,
    resetScore,
    getScore,
    isBot,
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

  function getEmptyCells() {
    let emptyCells = [];

    _boardState.forEach((cell, index) => {
      if (cell === '') {
        emptyCells.push(index);
      }
    });

    return emptyCells;
  }

  return {
    getBoardState,
    placeMarker,
    isLegalMove,
    clearState,
    getEmptyCells,
  };
})();

//****************************************game module****************************************//
const game = (function () {
  let winningCells = [];
  let _winner;
  let _drawCount = 0;
  const _players = {
    player1: player('X - player', 'X'),
    player2: player('O - bot', 'O'),
  };
  let _currentPlayer = _players.player1.getMarker() === 'X' ? _players.player1 : _players.player2;

  function playRound(cellId) {
    if (!gameBoard.isLegalMove(cellId)) return;
    gameBoard.placeMarker(_currentPlayer.getMarker(), cellId);

    if (checkWin(gameBoard.getBoardState(), _currentPlayer.getMarker())) {
      handleWin();
      return;
    } else if (gameBoard.getEmptyCells().length === 0) {
      handleDraw();
      return;
    }

    _currentPlayer = _currentPlayer === _players.player1 ? _players.player2 : _players.player1;
  }

  function checkWin(boardState, playerMarker) {
    let winningCellsCount = 0;
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
        if (boardState[position] === playerMarker) {
          winningCellsCount++;
        } else {
          break;
        }

        if (winningCellsCount === 3) {
          winningCells = winCombination;
          return true;
        }
      }
    }
    return false;
  }

  function handleWin() {
    _winner = _currentPlayer;
    _currentPlayer.upScore();
  }

  function handleDraw() {
    _winner = 'draw';
    _drawCount++;
  }

  function getBestMove() {
    let randomMove = 0;

    do {
      randomMove = Math.floor(Math.random() * 9);
    } while (!gameBoard.isLegalMove(randomMove));

    return randomMove;
  }

  function aiMakeMove() {
    if (!isCurrentPlayerBot()) return;
    const cellId = getBestMove();

    setTimeout(() => {
      screenController.handleCellChange(cellId);
    }, 500);
  }

  function isCurrentPlayerBot() {
    return _currentPlayer.isBot();
  }

  function resetGame() {
    gameBoard.clearState();
    winningCells = [];
    _currentPlayer = _players.player1.getMarker() === 'X' ? _players.player1 : _players.player2;
    _winner = '';

    aiMakeMove();
  }

  function getWinner() {
    return _winner;
  }

  function getCurrentPlayer() {
    return _currentPlayer;
  }

  function getWinningCells() {
    return winningCells;
  }

  function getDrawCount() {
    return _drawCount;
  }

  function getXPlayer() {
    return _players.player1.getMarker() === 'X' ? _players.player1 : _players.player2;
  }

  function getOPlayer() {
    return _players.player1.getMarker() === 'O' ? _players.player1 : _players.player2;
  }

  return {
    playRound,
    getWinner,
    getCurrentPlayer,
    resetGame,
    isCurrentPlayerBot,
    aiMakeMove,
    getWinningCells,
    getDrawCount,
    getOPlayer,
    getXPlayer,
  };
})();

//****************************************screenController module****************************************//
const screenController = (function () {
  const boardCells = document.querySelectorAll('.cell');
  const XplayerWinCount = document.querySelector('[data-Xplayer-wins]');
  const XplayerName = document.querySelector('[data-Xplayer-name]');
  const OplayerWinCount = document.querySelector('[data-Oplayer-wins]');
  const OplayerName = document.querySelector('[data-Oplayer-name]');
  const drawCount = document.querySelector('[data-draw-wins]');
  const resetButtons = document.querySelectorAll('.reset-game');
  const currentTurn = document.querySelector('[data-currentplayer-name]');
  const endOfRoundModal = document.querySelector('.end-of-round');
  const endOfRoundWinnerName = endOfRoundModal.querySelector('[data-game-winner-name]');

  boardCells.forEach((cell) =>
    cell.addEventListener('click', () => {
      if (game.isCurrentPlayerBot()) return;
      handleCellChange(cell.dataset.cellid);
      game.aiMakeMove();
    })
  );

  resetButtons.forEach((button) =>
    button.addEventListener('click', () => {
      endOfRoundModal.close();
      reset();
    })
  );

  function updateScore() {
    XplayerWinCount.innerText = game.getXPlayer().getScore();
    OplayerWinCount.innerText = game.getOPlayer().getScore();
    drawCount.innerText = game.getDrawCount();
  }

  function setPlayerNames() {
    XplayerName.innerText = game.getXPlayer().getName();
    OplayerName.innerText = game.getOPlayer().getName();
  }

  function setCurrentPlayerName() {
    currentTurn.innerText = game.getCurrentPlayer().getName();
  }

  function handleCellChange(cellId) {
    if (game.getWinner()) return;
    game.playRound(cellId);
    updateScreen();
  }

  function updateScreen() {
    boardCells.forEach((cell, index) => {
      cell.dataset.marker = gameBoard.getBoardState()[index];

      if (!game.isCurrentPlayerBot() && !game.getWinner()) {
        cell.dataset.currentmarker = game.getCurrentPlayer().getMarker();
      } else {
        cell.dataset.currentmarker = '';
      }
    });

    if (game.getWinner()) {
      updateScore();
      resetWithHiglight();
    }

    setCurrentPlayerName();
  }

  function reset() {
    game.resetGame();
    setCurrentPlayerName();

    boardCells.forEach((cell, index) => {
      cell.dataset.marker = gameBoard.getBoardState()[index];

      if (!game.isCurrentPlayerBot()) {
        cell.dataset.currentmarker = game.getCurrentPlayer().getMarker();
      } else {
        cell.dataset.currentmarker = '';
      }

      cell.classList.remove(`winning-cell-X`);
      cell.classList.remove(`winning-cell-O`);
    });
  }

  function resetWithHiglight() {
    boardCells.forEach((cell) => {
      if (game.getWinningCells().includes(+cell.dataset.cellid)) {
        cell.classList.add(`winning-cell-${game.getWinner().getMarker()}`);
      }
    });

    setTimeout(() => {
      showWinScreen();
    }, 1500);
  }

  function showWinScreen() {
    if (game.getWinner() === 'draw') {
      endOfRoundWinnerName.innerText = 'It is a draw';
      endOfRoundWinnerName.className = 'light-500';
    } else if (game.getWinner().getMarker() === 'X') {
      endOfRoundWinnerName.innerText = `${game.getWinner().getName()} wins the round`;
      endOfRoundWinnerName.className = 'green-400';
    } else {
      endOfRoundWinnerName.innerText = `${game.getWinner().getName()} wins the round`;
      endOfRoundWinnerName.className = 'orange-400';
    }

    endOfRoundModal.showModal();
  }

  return {
    handleCellChange,
    updateScreen,
    setPlayerNames,
  };
})();

///////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
  screenController.setPlayerNames();
  screenController.updateScreen();

  if (game.isCurrentPlayerBot()) {
    game.aiMakeMove();
  }
});

