'use strict'

const MINE = '💣'
const MARK = '⭐️'
const START_BTN = '😃'
const LOOSER = '😵'
const WINNER = '🤩'
const LIFE = '❤️'
const HINT = '💡'

var gGame = {
    isOn: false,
    isGameEnd: false,
    isHintOn: false,
    secsPassed: 0,
    shownCount: 0,
    markedCount: 0,
    livesCount: 3,
    safeClicksCount: 3,
    hintsCount: 3
}

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gBoard = []
var gFirstPos = {}
var gtimerInterval
var gLastPoses = []
var gLastExpandShownPoses = []

function initGame() {
    //TO DO: This is called when page loads
    // debugger
    resetGame()
    gBoard = buildBoard()
    renderBoard(gBoard)
    startBestScore()
    showBestScores()
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

function setMines() {
    var minesPos = getMinesPos()

    for (var i = 0; i < minesPos.length; i++) {
        gBoard[minesPos[i].i][minesPos[i].j].isMine = true
    }

    setMinesNegsCount(gBoard)
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
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return
    if (gGame.isGameEnd) return
    if (gGame.isHintOn) {
        hintModeOn(i, j)
        return
    }
    if (!gGame.isOn) {
        gGame.isOn = true
        showTimer()
        gFirstPos = { i, j }
        setMines()
    }


    if (gBoard[i][j].isMine) checkLives(i, j)
    else if (gBoard[i][j].minesAroundCount) {
        gBoard[i][j].isShown = true
        gBoard[i][j].isMarked = false
        gGame.shownCount++;
        gLastPoses.push({ i, j })
    } else {
        expandShown(gBoard, elCell, i, j)
        gLastPoses.push(gLastExpandShownPoses)
        gLastExpandShownPoses = []
    }

    renderBoard(gBoard)
    checkGameOver()
}

function cellMarked(event, i, j) {
    //TO DO: Called on right click to mark a cell (suspected to be a mine) 
    //Search the web (and implement) how to hide the context menu on right click
    event.preventDefault()
        // console.log(gGame.isOn);
    if (!gGame.isOn || gGame.isGameEnd || gBoard[i][j].isShown) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
    }
    updateMinesShow()

    renderBoard(gBoard)
    checkGameOver()

}

function checkGameOver() {
    //TO DO: Game ends when all mines are marked, and all the other cells are shown
    const shownTotal = gLevel.SIZE * gLevel.SIZE - gLevel.MINES
    console.log(shownTotal, gGame.shownCount, gGame.markedCount);
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
    gLastExpandShownPoses.push({ i, j })
    gGame.shownCount++;

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
    else checkBestScore()
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
    gGame.livesCount = 3
    gGame.hintsCount = 3
    gGame.safeClicksCount = 3
    gGame.isOn = false
    gGame.isGameEnd = false

    clearInterval(gtimerInterval)
    var elTimer = document.querySelector('.status-container .timer')
    elTimer.innerHTML = `Elapsed Time: 00:000`

    var elHints = document.querySelector('.hints')
    elHints.innerHTML = `${HINT} ${HINT} ${HINT}`

    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `${LIFE} ${LIFE} ${LIFE}`

    updateMinesShow()

    var elBtn = document.querySelector('.start-btn')
    elBtn.innerHTML = `${START_BTN}`

    var elSafeBtn = document.querySelector('.safe-click')
    elSafeBtn.innerHTML = `Safe Click ${gGame.safeClicksCount} clicks available`
}

function setLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines

    initGame()
}

function checkLives(idxI, idxJ) {
    if (gGame.livesCount) {
        gGame.livesCount--;
        var livesStr = ''
        var elLives = document.querySelector('.lives')

        for (var i = 0; i < gGame.livesCount; i++) {
            livesStr += `${LIFE} `
        }
        elLives.innerText = livesStr

        gBoard[idxI][idxJ].isShown = true
        gLastPoses.push({ i: idxI, j: idxJ })
        gGame.markedCount++;
        updateMinesShow()
    } else gameOver(LOOSER)
}

function hintClicked(elHints) {
    elHints.classList.add('hint-clicked')
    gGame.isHintOn = true
}

function hintModeOn(idxI, idxJ) {
    var neighborsIdx = []

    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue

        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
                // console.log(i, j);
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                neighborsIdx.push({ idxI: i, idxJ: j })
            }

        }
    }

    renderBoard(gBoard)
    setTimeout(hintModeOff, 1000, neighborsIdx)
}

function hintModeOff(neighborsIdx) {
    for (var i = 0; i < neighborsIdx.length; i++) {
        gBoard[neighborsIdx[i].idxI][neighborsIdx[i].idxJ].isShown = false
    }

    gGame.isHintOn = false
    renderBoard(gBoard)

    updateHintsShow()
}

function updateHintsShow() {
    gGame.hintsCount--;

    var hintsStr = ''
    for (var i = 0; i < gGame.hintsCount; i++) {
        hintsStr += `${HINT} `
    }

    var elHints = document.querySelector('.hints')
    elHints.innerHTML = hintsStr
    elHints.classList.remove('hint-clicked')
}

function startBestScore() {
    if (!localStorage.getItem('bestEasy')) localStorage.setItem('bestEasy', 999)
    if (!localStorage.getItem('bestHard')) localStorage.setItem('bestHard', 999)
    if (!localStorage.getItem('bestExpert')) localStorage.setItem('bestExpert', 999)
}

function checkBestScore() {
    if (gLevel.SIZE === 4) {
        if (gGame.secsPassed < localStorage.getItem('bestEasy')) {
            localStorage.setItem('bestEasy', gGame.secsPassed)
        }
    }

    if (gLevel.SIZE === 8) {
        if (gGame.secsPassed < localStorage.getItem('bestHard')) {
            localStorage.setItem('bestHard', gGame.secsPassed)
        }
    }

    if (gLevel.SIZE === 12) {
        if (gGame.secsPassed < localStorage.getItem('bestExpert')) {
            localStorage.setItem('bestExpert', gGame.secsPassed)
        }
    }

    showBestScores()
}

function showBestScores() {
    var elBestScores = document.querySelector('.best-scores')
    var bestScoreEasy = localStorage.getItem('bestEasy')
    var bestScoreHard = localStorage.getItem('bestHard')
    var bestScoreExpert = localStorage.getItem('bestExpert')

    elBestScores.innerHTML = `Best easy score: ${bestScoreEasy} Best Hard score: ${bestScoreHard} Best Expert Score: ${bestScoreExpert}`
}

function safeClickStart(elBtn) {

    if (!gGame.isOn || gGame.isGameEnd) return
    var safeCell = findUnshownCell()
    if (!safeCell) return //no such cells
    var elCell = document.querySelector(`[data-i="${safeCell.i}"][data-j="${safeCell.i}"]`)

    elCell.classList.add('safe-cell')

    gGame.safeClicksCount--;
    elBtn.innerHTML = `Safe Click ${gGame.safeClicksCount} clicks available`

    setTimeout(() => { elCell.classList.remove('safe-cell') }, 3000)
}

function undo() {
    if (!gLastPoses) return
    var lastMove = gLastPoses.pop()

    if (Array.isArray(lastMove)) {
        while (lastMove.length) {
            var expandMove = lastMove.pop()
            gBoard[expandMove.i][expandMove.j].isShown = false
        }
        console.log(lastMove);
    } else {
        gBoard[lastMove.i][lastMove.j].isShown = false
    }

    renderBoard(gBoard)
}