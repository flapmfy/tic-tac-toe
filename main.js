function player(name, marker) {
  let _name = name;
  let _marker = marker;

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

  return {
    getMarker,
    getName,
    setName,
    setMarker,
  };
}

//updatuje boardState při položení markeru a ověřuje legalitu tahu
const gameBoard = (function () {
  const _boardState = ['', '', '', '', '', '', '', '', ''];

  function getBoardState() {
    return _boardState;
  }

  function placeMarker(marker, cell) {
    _boardState[cell.dataset.cellid] = marker;
  }

  function isLegalMove(cell) {
    return gameBoard.getBoardState()[cell.dataset.cellid] === '';
  }

  return {
    getBoardState,
    placeMarker,
    isLegalMove,
  };
})();

//výměna hráčů po každém kole, stará se o odehrání kola, kontroluje výhru
const game = (function () {
  const player1 = player('Marek', 'X');
  const player2 = player('Pepa', 'O');
  let currentPlayer = player1;

  function playRound(cell) {
    if (!gameBoard.isLegalMove(cell)) return;

    gameBoard.placeMarker(currentPlayer.getMarker(), cell);

    currentPlayer = currentPlayer === player1 ? player2 : player1;
  }

  function checkWin() {
    const winCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 7],
      [2, 4, 6],
    ];

    for (const winCombination of winCombinations) {
      for (const position of winCombination) {
        //check for win
      }
    }
  }

  return {
    playRound,
  };
})();

//aktualizuje co vidí hráči, pracuje s aktivitou při kliknutí
const screenController = (function () {
  function updateScreen(boardCells) {
    boardCells.forEach((cell, index) => {
      cell.dataset.marker = gameBoard.getBoardState()[index];
    });
  }

  function handleClick(cell) {
    game.playRound(cell);
  }

  return {
    handleClick,
    updateScreen,
  };
})();

const boardCells = document.querySelectorAll('.cell');

boardCells.forEach((cell) =>
  cell.addEventListener('click', () => {
    screenController.handleClick(cell);
    screenController.updateScreen(boardCells);
  })
);

