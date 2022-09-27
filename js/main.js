'use strict'

const MINE = `<img src="img/bomb.png" class="mine" />`
const MARK = `<img src="img/star.png" class="star" />`
const START_BTN = `<img src="img/start.png" class="start" />`
const LOOSER = `<img src="img/looser.png" class="looser" />`
const WINNER = `<img src="img/winner.png" class="winner" />`
const LIFE = `<img src="img/heart.png" class="life" />`
const HINT = `<img src="img/hint.png" class="hint" />`

var gGame = {
    isOn: false,
    isGameEnd: false,
    isHintOn: false,
    isManuallyOn: false,
    isBoomOn: false,
    isMegaOn: false,
    megaHintBlock: false,
    secsPassed: 0,
    shownCount: 0,
    markedCount: 0,
    livesCount: 3,
    safeClicksCount: 3,
    hintsCount: 3,
    manuallyCounter: 0
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
var gMegaTop = null
var gMegaBottom = null

function initGame() {
    //TO DO: This is called when page loads
    // debugger
    resetGame()
    gBoard = buildBoard()
    renderBoard(gBoard)
    startBestScore()
    checkBestScore()
}

function getMinesPos() {
    var poses = getRandomPos()
    var minesPos = []
    for (var i = 0; i < gLevel.MINES; i++) {
        minesPos.push(poses.pop())
    }

    return minesPos
}

function getRandomPos() {
    var poses = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (i !== gFirstPos.i || j !== gFirstPos.j) poses.push({ i, j })
        }
    }
    poses.sort((a, b) => 0.5 - Math.random())

    return poses
}

function setMinesRandom() {
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
    if (gGame.isMegaOn && !gGame.megaHintBlock) {
        megaHintSelect(i, j)
        return
    }
    if (gGame.isManuallyOn && gGame.manuallyCounter) {
        setMinesManually(i, j)
        return
    }
    if (gGame.isHintOn) {
        hintModeOn(i, j)
        return
    }
    if (!gGame.isOn) {
        gGame.isOn = true
        showTimer()
        gFirstPos = { i, j }
        if (gGame.isBoomOn) setBoomMines()
        else if (!gGame.isManuallyOn) setMinesRandom()
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
        gGame.markedCount++;
        gLastPoses.push({ i, j })

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
    var timer = document.querySelector('.timer')
    var start = Date.now()

    gtimerInterval = setInterval(function() {
        var currTs = Date.now()

        var secs = parseInt((currTs - start) / 1000)
        var ms = (currTs - start) - secs * 1000
        ms = '000' + ms
        ms = ms.substring(ms.length - 3, ms.length)

        gGame.secsPassed = `${secs}:${ms}`
        timer.innerHTML = `<span>Time:</span> ${gGame.secsPassed}`
    }, 100)
}

function resetGame() {
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.livesCount = 3
    gGame.hintsCount = 3
    gGame.safeClicksCount = 3
    gGame.manuallyCounter = gLevel.MINES
    gGame.isOn = false
    gGame.isGameEnd = false
    gGame.isManuallyOn = false
    gGame.isMegaOn = false
    gGame.megaHintBlock = false

    gMegaTop = null
    gMegaBottom = null

    clearInterval(gtimerInterval)
    var elTimer = document.querySelector('.timer')
    elTimer.innerHTML = `<span>Time:</span> 00:000`

    var elHints = document.querySelector('.hints')
    elHints.innerHTML = `${HINT} ${HINT} ${HINT}`

    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `${LIFE} ${LIFE} ${LIFE}`

    updateMinesShow()
    updateManualBar()

    var elBtn = document.querySelector('.start-btn')
    elBtn.innerHTML = `${START_BTN}`

    var elSafeBtn = document.querySelector('.safe-click')
    elSafeBtn.innerHTML = `Safe Click (${gGame.safeClicksCount})`

    // var elMegaBar = document.querySelector('.mega-mode')

}

function setLevel(elCurrLevel, size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines

    var elLevel = document.querySelectorAll('.level')

    for (var i = 0; i < 3; i++) {
        elLevel[i].classList.remove('level-selcted')
    }

    elCurrLevel.classList.add('level-selcted')

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
        elLives.innerHTML = livesStr

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
    var currBestScore

    if (gLevel.SIZE === 4) {
        currBestScore = localStorage.getItem('bestEasy')

        if (gGame.secsPassed < currBestScore) {
            localStorage.setItem('bestEasy', gGame.secsPassed)
            currBestScore = gGame.secsPassed
        }
        console.log(currBestScore);
    }

    if (gLevel.SIZE === 8) {
        currBestScore = localStorage.getItem('bestHard')

        if (gGame.secsPassed < currBestScore) {
            localStorage.setItem('bestHard', gGame.secsPassed)
            currBestScore = gGame.secsPassed
        }
    }

    if (gLevel.SIZE === 12) {
        currBestScore = localStorage.getItem('bestExpert')

        if (gGame.secsPassed < currBestScore) {
            localStorage.setItem('bestExpert', gGame.secsPassed)
            currBestScore = gGame.secsPassed
        }
    }

    showBestScores(currBestScore)
}

function showBestScores(currBestScore = 0) {
    var elBestScores = document.querySelector('.best-scores')

    elBestScores.innerHTML = `Best Score: ${currBestScore}`
}

function safeClickStart(elBtn) {

    if (!gGame.isOn || gGame.isGameEnd || !gGame.safeClicksCount) return
    var safeCell = findUnshownCell()
    if (!safeCell) return //no such cells
    var elCell = document.querySelector(`[data-i="${safeCell.i}"][data-j="${safeCell.j}"]`)
    console.log(elCell);
    elCell.classList.add('safe-cell')

    gGame.safeClicksCount--;
    elBtn.innerHTML = `Safe Click (${gGame.safeClicksCount})`

    setTimeout(() => { elCell.classList.remove('safe-cell') }, 3000)
}

function undo() {
    if (!gLastPoses) return
    var lastMove = gLastPoses.pop()

    if (Array.isArray(lastMove)) {

        while (lastMove.length) {
            var expandMove = lastMove.pop()
            gBoard[expandMove.i][expandMove.j].isShown = false
            gGame.shownCount--;
        }
        console.log('lastMove', lastMove);

    } else if (gBoard[lastMove.i][lastMove.j].isMarked) {

        gBoard[lastMove.i][lastMove.j].isMarked = false
        gGame.markedCount--;

    } else if (gBoard[lastMove.i][lastMove.j].isMine) {

        gBoard[lastMove.i][lastMove.j].isShown = false
        gGame.markedCount--;

    } else {

        gBoard[lastMove.i][lastMove.j].isShown = false
        gGame.shownCount--;
    }

    renderBoard(gBoard)
}

function setManuallyMode() {
    gGame.isManuallyOn = true

    updateManualBar()
}

function setMinesManually(i, j) {

    gBoard[i][j].isMine = true
    gBoard[i][j].isShown = true

    gGame.manuallyCounter--;

    if (!gGame.manuallyCounter) {
        hideAllMines()
        setMinesNegsCount(gBoard)
    }

    updateManualBar()
    renderBoard(gBoard)
}

function updateManualBar() {

    var elOptBar = document.querySelector('.options-container')
    var elManualBar = document.querySelector('.manually-mode')

    if (gGame.isManuallyOn && gGame.manuallyCounter) {

        elOptBar.classList.add('hide')
        elManualBar.classList.remove('hide')

        elManualBar.innerHTML = `Set ${gGame.manuallyCounter} mines on board`
    } else {

        elOptBar.classList.remove('hide')
        elManualBar.classList.add('hide')
    }
}

function hideAllMines() {

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = false
        }
    }
}

function setBoomMode() {
    gGame.isBoomOn = true
    initGame()
}

function setBoomMines() {

    var minesCounter = gLevel.MINES

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {

            var currIdx = gBoard[i][j].cellIdx
            if (!(currIdx % 7) || (currIdx % 10) === 7 ||
                parseInt(currIdx / 10) === 7) {

                if (i !== gFirstPos.i || j !== gFirstPos.j) {
                    gBoard[i][j].isMine = true
                    minesCounter--;

                    if (!minesCounter) {
                        setMinesNegsCount(gBoard)
                        renderBoard(gBoard)
                        gGame.isBoomOn = false
                        return
                    }
                }
            }
        }
    }
}

function megaHintMode() {
    gGame.isMegaOn = true
    updateMegaBar()
}

function megaHintSelect(i, j) {

    if (!gMegaTop) gMegaTop = { i, j }
    else {
        gMegaBottom = { i, j }
        megaHintExpose()
    }

    updateMegaBar()
}

function megaHintExpose() {

    for (var i = gMegaTop.i; i <= gMegaBottom.i; i++) {
        for (var j = gMegaTop.j; j <= gMegaBottom.j; j++) {
            gBoard[i][j].isShown = !gBoard[i][j].isShown
        }
    }

    renderBoard(gBoard)

    if (gGame.isMegaOn) {
        gGame.isMegaOn = false
        gGame.megaHintBlock = true
        updateMegaBar()
        setTimeout(megaHintExpose, 2000)
    }
}

function updateMegaBar() {

    var elOptBar = document.querySelector('.options-container')
    var elMegaBar = document.querySelector('.mega-mode')

    if (gGame.isMegaOn && !gGame.megaHintBlock) {

        elOptBar.classList.add('hide')
        elMegaBar.classList.remove('hide')

        elMegaBar.innerHTML = (!gMegaTop) ?
            `Click the area’s top-left cell` : `Click the area’s bottom-right cell`


    } else {

        elOptBar.classList.remove('hide')
        elMegaBar.classList.add('hide')
    }

}

function exterminatorMode() {
    if (gLevel.SIZE === 4) return
    var mines = randomMines()
    mines = getRandomMines(mines)

    console.log(mines);
    for (var i = 0; i < 3; i++) {
        gBoard[mines[i].i][mines[i].j].isMine = false
    }

    gLevel.MINES -= 3
    setMinesNegsCount(gBoard)
    console.log(gBoard);

}

function randomMines() {
    var mines = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) mines.push({ i, j })
        }
    }
    mines.sort((a, b) => 0.5 - Math.random())

    console.log(mines);
    return mines
}

function getRandomMines(mines) {
    var randomMines = []

    for (var i = 0; i < 3; i++) {
        randomMines.push(mines.pop())
    }

    return randomMines
}