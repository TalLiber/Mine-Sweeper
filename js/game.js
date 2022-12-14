'use strict'

function buildBoard() {
    //TO DO: Builds the board Set mines at random locations 
    //Call setMinesNegsCount() 
    //Return the created board

    const board = []
    var cellIdxCounter = 0

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                cellIdx: cellIdxCounter,
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }

            cellIdxCounter++;
        }
    }

    return board
}

function renderBoard(board) {
    //TO DO: Render the board as a <table> to the page

    var strHTML = '<table border="0"><tbody>'

    for (var i = 0; i < board.length; i++) {

        strHTML += '\n<tr>\n'
        for (var j = 0; j < board[i].length; j++) {

            var className = `cell` //??
            var cellContent = ''

            if (board[i][j].isShown) {
                cellContent = (gBoard[i][j].isMine) ? MINE : board[i][j].minesAroundCount
                if (!cellContent) cellContent = ''
                className += ' shown-cell'
            }
            if (board[i][j].isMarked) cellContent = MARK

            strHTML += `\t<td class="${className}" data-i="${i}" data-j="${j}" onclick="cellClicked((this),${i}, ${j})" oncontextmenu="cellMarked(event, ${i}, ${j})">${cellContent}</td>`
        }
        strHTML += '\n</tr>\n'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector('.board-container')
    elContainer.innerHTML = strHTML
}