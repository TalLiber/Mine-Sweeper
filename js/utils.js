'use strict'

//V
function countNeighbors(board, cellI, cellJ) {
    var neighborsCount = 0

    for (var i = cellI - 1; i <= cellI + 1; i++) {

        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {

            if (j < 0 || j >= board[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (board[i][j].isMine) neighborsCount++;

        }
    }

    return neighborsCount
}
//V
function findUnshownCell() {
    var unshownCells = []
        // debugger
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) unshownCells.push({ i, j })
        }
    }

    return unshownCells[getRandomInt(0, unshownCells.length)]
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}