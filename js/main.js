'use strict'

const MINE = '💣'
const MARK = '⭐️'
const START_BTN = '😃'
const LOOSER = '😵'
const WINNER = '🤩'

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    isGameEnd: false
}

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gBoard = []
var gFirstPos = {}
var gtimerInterval

function initGame() {
    //TO DO: This is called when page loads
    // debugger

    resetGame()
    gBoard = buildBoard()
    console.log(gBoard)
    renderBoard(gBoard)

}

function getMinesPos() {
    var poses = getRandomPos()
    var minesPos = []
    for (var i = 0; i < gLevel.MINES; i++) {
        minesPos.push(poses.pop())
    }
    console.log(minesPos)
    return minesPos
}

function getRandomPos() {
    var poses = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (i !== gFirstPos.i && j !== gFirstPos.j) poses.push({ i, j })
        }
    }
    poses.sort((a, b) => 0.5 - Math.random())

    return poses
}

function setMines(board, minesPos) {
    for (var i = 0; i < minesPos.length; i++) {
        board[minesPos[i].i][minesPos[i].j].isMine = true
    }
}

function setMinesNegsCount(board) {
    //TO DO: Count mines around each cell and set the cell's minesAroundCount.

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(board, i, j)
        }
    }
}

function cellClicked(elCell, i, j) {
    //TO DO: Called when a cell (td) is clicked
    // document.addEventListener('contextmenu', event => event.preventDefault())
    if (gGame.isGameEnd) return
    if (!gGame.isOn) {
        gGame.isOn = true
        showTimer()
        gFirstPos = { i, j }
        gBoard = buildBoard()
    }


    if (gBoard[i][j].isMine) {
        // debugger
        gameOver(LOOSER)
        console.log('looser')
    }
    if (gBoard[i][j].minesAroundCount) {
        gBoard[i][j].isShown = true
        gBoard[i][j].isMarked = false
        gGame.shownCount++
    } else expandShown(gBoard, elCell, i, j)

    checkGameOver()

    renderBoard(gBoard)
}

function cellMarked(event, i, j) {
    //TO DO: Called on right click to mark a cell (suspected to be a mine) 
    //Search the web (and implement) how to hide the context menu on right click
    event.preventDefault()
        // console.log(gGame.isOn);
    if (!gGame.isOn || gGame.isGameEnd) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    }
    updateMinesShow()

    checkGameOver()
    renderBoard(gBoard)

}

function checkGameOver() {
    //TO DO: Game ends when all mines are marked, and all the other cells are shown
    const shownTotal = gLevel.SIZE * gLevel.SIZE - gLevel.MINES
        // console.log(shownTotal, gGame.shownCount ,gGame.markedCount);
    if (gGame.markedCount === gLevel.MINES && gGame.shownCount === shownTotal) {
        console.log('winner');
        gameOver(WINNER)
    }
}

function expandShown(board, elCell, i, j) {
    //TO DO: When user clicks a cell with no mines around, we need to open not only that cell, 
    //but also its neighbors. READ MORE
    // debugger 
    if (i < 0 || i >= board.length || j < 0 || j >= board[i].length ||
        board[i][j].isMine || board[i][j].isShown) return

    board[i][j].isShown = true
    gGame.shownCount++

        if (board[i][j].minesAroundCount) return

    for (var idxI = i - 1; idxI <= i + 1; idxI++) {
        for (var idxJ = j - 1; idxJ <= j + 1; idxJ++) {

            if (idxI === i && idxJ === j) continue
            expandShown(board, elCell, idxI, idxJ)

        }
    }

}

function gameOver(status) {
    gGame.isOn = false
    gGame.isGameEnd = true
    clearInterval(gtimerInterval)

    var elBtn = document.querySelector('.start-btn')
    elBtn.innerHTML = `${status}`

    if (status === LOOSER) showAllMines()
}

function showAllMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard)
}

function updateMinesShow() {
    var elMinesShow = document.querySelector('.status-container .mines')
    elMinesShow.innerHTML = `${MINE}: ${gLevel.MINES - gGame.markedCount}`
}

function showTimer() {
    var timer = document.querySelector('.status-container .timer')
    var start = Date.now()

    gtimerInterval = setInterval(function() {
        var currTs = Date.now()

        var secs = parseInt((currTs - start) / 1000)
        var ms = (currTs - start) - secs * 1000
        ms = '000' + ms
        ms = ms.substring(ms.length - 3, ms.length)

        gGame.secsPassed = `${secs}:${ms}`
        timer.innerText = `Elapsed Time: ${gGame.secsPassed}`
    }, 100)
}

function resetGame() {
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.isOn = false
    gGame.isGameEnd = false

    clearInterval(gtimerInterval)
    var elTimer = document.querySelector('.status-container .timer')
    elTimer.innerHTML = `Elapsed Time: 00:000`

    updateMinesShow()

    var elBtn = document.querySelector('.start-btn')
    elBtn.innerHTML = `${START_BTN}`
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines

    initGame()
}