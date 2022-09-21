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

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createNums() {
    var nums = []
    
    for (var i = 0; i < gBoardLength * gBoardLength; i++) {
        nums.push(i + 1)
    }
    
    return nums
}

function getNum(nums) {
    var numIdx = getRandomInt(0, nums.length)
     return nums.splice(numIdx, 1)[0]
}


function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function copyMat(mat) {
    var newMat = []
    
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

function findEmptyCells() {
    var emptyCells = []

    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[i].length - 1; j++) {
            if (gBoard[i][j].gameElement === null) emptyCells.push({ i, j })
        }
    }

    var emptyCellCoor = emptyCells[getRandomInt(0, emptyCells.length)]
    var i = emptyCellCoor.i
    var j = emptyCellCoor.j
}