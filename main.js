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
  const _boardState = ['X', 'X', 'X', '', '', '', 'O', 'O', ''];

  function getBoardState() {
    return _boardState;
  }

  function placeMarker(marker, cell) {
    if (isLegalMove(cell)) {
      cell.setAttribute('data-marker', marker);
      _boardState[cell.dataset.cellid] = marker;
    }

    return;
  }

  function isLegalMove(cell) {}

  return {
    getBoardState,
    placeMarker,
  };
})();

//výměna hráčů po každém kole, stará se o odehrání kola, kontroluje výhru
const game = (function () {
  const currentPlayer = player('Marek', 'X');

  function playRound(cell) {
    gameBoard.placeMarker(currentPlayer.getMarker(), cell);
  }

  return {
    playRound,
  };
})();

//aktualizuje co vidí hráči, pracuje s aktivitou při kliknutí
const screenController = (function () {
  const boardCells = document.querySelectorAll('.cell'); //provizorní

  function updateScreen(boardCells) {
    boardCells.forEach((cell, index) => {
      cell.setAttribute('data-marker', gameBoard.getBoardState()[index]);
    });
  }

  function handleClick(cell) {
    game.playRound(cell);
    updateScreen(boardCells);
  }

  return {
    handleClick,
  };
})();

// const boardCells = document.querySelectorAll('.cell');

// boardCells.forEach((cell) => {
//   console.log(cell.dataset.cellid);
// });

