//****************************************Player module****************************************//
function Player(marker, role) {
  let _marker = marker;
  let _role = role;
  let _score = 0;

  function getMarker() {
    return _marker;
  }

  function getName() {
    return `${_marker} - ${_role}`;
  }

  function upScore() {
    _score++;
  }

  function getScore() {
    return _score;
  }

  function isBot() {
    return _role === 'bot';
  }

  return {
    getMarker,
    getName,
    upScore,
    getScore,
    isBot,
  };
}

//****************************************board module****************************************//
const GameBoard = (function () {
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

  function clearBoard() {
    _boardState = ['', '', '', '', '', '', '', '', ''];
  }

  function getEmptyCells(boardState) {
    let emptyCells = [];

    boardState.forEach((cell, index) => {
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
    clearBoard,
    getEmptyCells,
  };
})();

//****************************************Game module****************************************//
const Game = (function () {
  let _botDifficulty;
  let winningCells = [];
  let _winner;
  let _drawCount = 0;
  let _players = {};
  let _currentPlayer;

  function playRound(cellId) {
    if (!GameBoard.isLegalMove(cellId)) return;
    GameBoard.placeMarker(_currentPlayer.getMarker(), cellId);

    if (checkWin(GameBoard.getBoardState(), _currentPlayer.getMarker())) {
      handleWin();
      return;
    } else if (GameBoard.getEmptyCells(GameBoard.getBoardState()).length === 0) {
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

  function getRandomMove() {
    let randomMove = 0;

    do {
      randomMove = Math.floor(Math.random() * 9);
    } while (!GameBoard.isLegalMove(randomMove));

    return randomMove;
  }

  function getBestMove(boardState, player) {
    const bestPlayInfo = minimax(boardState, player, 0, -Infinity, Infinity);
    return bestPlayInfo.index;
  }

  function minimax(boardState, player, depth, alpha, beta) {
    if (player.isBot() && checkWin(boardState, player.getMarker())) {
      return { score: 1 };
    } else if (GameBoard.getEmptyCells(boardState) === 0) {
      return { score: 0 };
    } else if (!player.isBot() && checkWin(boardState, player.getMarker())) {
      return { score: -1 };
    }

    const emptyCells = GameBoard.getEmptyCells();
    const allTestPlayInfos = [];
    let bestTestPlay = null;

    for (let i = 0; i < emptyCells.length; i++) {
      const currentPlayTestInfo = {};

      currentPlayTestInfo.index = emptyCells[i];
      boardState[emptyCells[i]] = player.getMarker();

      if (player.isBot()) {
        const result = minimax(boardState, getXPlayer().isBot() ? getOPlayer() : getXPlayer(), depth + 1, alpha, beta);
        currentPlayTestInfo.score = result.score - depth;
        alpha = Math.max(alpha, currentPlayTestInfo.score);
      } else {
        const result = minimax(boardState, !getXPlayer().isBot() ? getOPlayer() : getXPlayer(), depth + 1, alpha, beta);
        currentPlayTestInfo.score = result.score - depth;
        beta = Math.min(beta, currentPlayTestInfo.score);
      }

      boardState[emptyCells[i]] = '';
      allTestPlayInfos.push(currentPlayTestInfo);

      if (beta <= alpha) break;
    }

    if (player.isBot()) {
      //maximize
      let bestScore = -Infinity;
      for (let i = 0; i < allTestPlayInfos.length; i++) {
        if (allTestPlayInfos[i].score > bestScore) {
          bestScore = allTestPlayInfos[i].score;
          bestTestPlay = i;
        }
      }
    } else {
      //minimize
      let bestScore = Infinity;
      for (let i = 0; i < allTestPlayInfos.length; i++) {
        if (allTestPlayInfos[i].score < bestScore) {
          bestScore = allTestPlayInfos[i].score;
          bestTestPlay = i;
        }
      }
    }

    return allTestPlayInfos[bestTestPlay];
  }

  function aiMakeMove() {
    if (!isCurrentPlayerBot()) return;
    let cellId;
    switch (_botDifficulty) {
      case 'easy':
        cellId = getRandomMove();
        //console.log(getBestMove(GameBoard.getBoardState()), _currentPlayer);
        break;
      case 'hard':
        cellId = getBestMove(GameBoard.getBoardState(), _currentPlayer);
        break;
    }

    setTimeout(() => {
      ScreenController.handleCellChange(cellId);
    }, 500);
  }

  function setCurrentPlayer() {
    _currentPlayer = getXPlayer();
  }

  function resetGame() {
    GameBoard.clearBoard();
    winningCells = [];
    setCurrentPlayer();
    _winner = '';
  }

  function initializePlayers(player1Marker, botDifficulty) {
    if (botDifficulty) {
      _botDifficulty = botDifficulty;

      if (player1Marker === 'X') {
        Game.getPlayers().player1 = new Player('X', 'player');
        Game.getPlayers().player2 = new Player('O', 'bot');
      } else {
        Game.getPlayers().player1 = new Player('O', 'player');
        Game.getPlayers().player2 = new Player('X', 'bot');
      }
    } else {
      if (player1Marker === 'X') {
        Game.getPlayers().player1 = new Player('X', 'player');
        Game.getPlayers().player2 = new Player('O', 'player');
      } else {
        Game.getPlayers().player1 = new Player('O', 'player');
        Game.getPlayers().player2 = new Player('X', 'player');
      }
    }

    setCurrentPlayer();
  }

  function isCurrentPlayerBot() {
    return _currentPlayer.isBot();
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

  function getPlayers() {
    return _players;
  }

  function setBotDifficulty(difficulty) {
    _botDifficulty = difficulty;
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
    getPlayers,
    setCurrentPlayer,
    setBotDifficulty,
    initializePlayers,
  };
})();

//****************************************ScreenController module****************************************//
const ScreenController = (function () {
  const boardCells = document.querySelectorAll('.cell');
  const XplayerWinCount = document.querySelector('[data-Xplayer-wins]');
  const XplayerName = document.querySelector('[data-Xplayer-name]');
  const OplayerWinCount = document.querySelector('[data-Oplayer-wins]');
  const OplayerName = document.querySelector('[data-Oplayer-name]');
  const drawCount = document.querySelector('[data-draw-wins]');
  const resetButtons = document.querySelectorAll('.reset-game');
  const quitGameButton = document.querySelector('.quit');
  const currentTurn = document.querySelector('[data-currentplayer-name]');
  const endOfRoundModal = document.querySelector('.end-of-round');
  const endOfRoundWinnerName = endOfRoundModal.querySelector('[data-Game-winner-name]');
  const gameStartModal = document.querySelector('.game-start');
  const startGameButton = gameStartModal.querySelector('.start-button');
  const startForm = document.querySelector('form');

  //start of the game
  document.addEventListener('DOMContentLoaded', () => {
    showStartScreen();
  });

  gameStartModal.addEventListener('keydown', (e) => {
    e.preventDefault();
  });

  //board cells initialization
  boardCells.forEach((cell) =>
    cell.addEventListener('click', () => {
      if (Game.isCurrentPlayerBot()) return;
      handleCellChange(cell.dataset.cellid);
      Game.aiMakeMove();
    })
  );

  //reset buttons initialization
  resetButtons.forEach((button) =>
    button.addEventListener('click', () => {
      endOfRoundModal.close();
      resetGame();
      setupGame();
    })
  );

  //quit game button initialization
  quitGameButton.addEventListener('click', () => {
    showStartScreen();
    endOfRoundModal.close();
    resetGame();
  });

  //start game button initialization
  startGameButton.addEventListener('click', () => {
    const newPlayerMarker = findSelection(startForm, 'marker');
    const gameDifficulty = 'easy';

    Game.initializePlayers(newPlayerMarker, gameDifficulty);
    setupGame();
  });

  //**************************************/
  function updateScore() {
    XplayerWinCount.innerText = Game.getXPlayer().getScore();
    OplayerWinCount.innerText = Game.getOPlayer().getScore();
    drawCount.innerText = Game.getDrawCount();
  }

  function setScoreboardNames() {
    XplayerName.innerText = Game.getXPlayer().getName();
    OplayerName.innerText = Game.getOPlayer().getName();
  }

  function setTurnName() {
    currentTurn.innerText = Game.getCurrentPlayer().getName();
  }

  function handleCellChange(cellId) {
    if (Game.getWinner()) return;
    Game.playRound(cellId);
    updateScreen();
  }

  function updateScreen() {
    boardCells.forEach((cell, index) => {
      cell.dataset.marker = GameBoard.getBoardState()[index];

      if (!Game.isCurrentPlayerBot() && !Game.getWinner()) {
        cell.dataset.currentmarker = Game.getCurrentPlayer().getMarker();
      } else {
        cell.dataset.currentmarker = '';
      }

      //removes highlighting on cells
      cell.classList.remove(`winning-cell-X`);
      cell.classList.remove(`winning-cell-O`);
    });

    if (Game.getWinner()) {
      updateScore();
      endRound();
    }

    setTurnName();
  }

  function endRound() {
    //highlights winning cells
    boardCells.forEach((cell) => {
      if (Game.getWinningCells().includes(+cell.dataset.cellid)) {
        cell.classList.add(`winning-cell-${Game.getWinner().getMarker()}`);
      }
    });

    setTimeout(() => {
      showWinScreen();
    }, 1500);
  }

  function showWinScreen() {
    if (Game.getWinner() === 'draw') {
      endOfRoundWinnerName.innerText = 'It is a draw';
      endOfRoundWinnerName.className = 'light-500';
    } else if (Game.getWinner().getMarker() === 'X') {
      endOfRoundWinnerName.innerText = `${Game.getWinner().getName()} wins the round`;
      endOfRoundWinnerName.className = 'green-400';
    } else {
      endOfRoundWinnerName.innerText = `${Game.getWinner().getName()} wins the round`;
      endOfRoundWinnerName.className = 'orange-400';
    }

    endOfRoundModal.showModal();
  }

  function resetGame() {
    Game.resetGame();
    updateScreen();
  }

  function setupGame() {
    setScoreboardNames();
    updateScreen();

    if (Game.isCurrentPlayerBot()) {
      Game.aiMakeMove();
    }
  }

  function showStartScreen() {
    gameStartModal.showModal();
  }

  function findSelection(form, fieldName) {
    let value = form.querySelector(`input[name=${fieldName}]:checked`).value;
    return value;
  }

  return {
    handleCellChange,
  };
})();

