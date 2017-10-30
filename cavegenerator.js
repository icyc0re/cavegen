const CELL_WALL = 'X';
const CELL_FULL = '#';
const CELL_EMPTY = ' ';

function Room(opts) {
    this.cols = opts.cols;
    this.rows = opts.rows;
    this.resetCells();
    this.exits = opts.exits || [];
    this.generateExits();
};
Room.prototype.constructor = Room;
Room.prototype.resetCells = function () {
    const dimX = this.cols, dimY = this.rows;
    const cells = Array(dimX * dimY).fill(CELL_FULL);
    const lastRowOffset = dimX * (dimY - 1);
    for (let i = 0; i < dimX; i++) {
        cells[i] = CELL_WALL;
        cells[lastRowOffset + i] = CELL_WALL;
    }
    for (let i = dimX; i < dimX * dimY; i += dimX) {
        cells[i] = CELL_WALL;
        cells[i - 1] = CELL_WALL;
    }
    this.cells = cells;
};
Room.prototype.reset = function (resetExits) {
    this.resetCells();

    if (this.exits.length === 0 || resetExits === true) {
        this.generateExits();
    }
};
Room.prototype.generateExits = function (n = 2) {
    // TODO: add verification, the 2 exits cannot be neighbors (or closer than a defined distance)
    const walls = [];
    for (let i = 0; i < this.cells.length; i++) {
        if (this.cells[i] === CELL_WALL && this.getUnvisitedNeighbors(i).length > 0) {
            walls.push(i);
        }
    }
    const choices = CaveUtils.randomChoices(walls, n);
    this.exits = choices.map(p => walls[p]);
    this.exits.forEach(exit => this.cells[exit] = CELL_EMPTY);
};
Room.prototype.emptyCellGenerator = function* () {
    // get empty cells that 
    const cells = this.cells, len = cells.length;
    for (let i = 0; i < len; i++) {
        if (cells[i] === CELL_EMPTY && this.exits.indexOf(i) === -1) {
            yield i;
        }
    }
};
Room.prototype.emptyCellWithNeighborsGenerator = function* () {
    const emptyCells = this.emptyCellGenerator();
    for (let pos of emptyCells) {
        const neighbors = this.getUnvisitedNeighbors(pos);
        if (neighbors.length > 0) {
            yield pos;
        }
    }
};
Room.prototype.getClosestEmptyCell = function (pos) {
    const emptyCells = this.emptyCellWithNeighborsGenerator();
    let cell = emptyCells.next();
    if (cell.done) {
        console.warn('ERROR in closest empty cell');
        return;
    }

    cell = cell.value;
    let closest = [cell];
    let closestDistance = this.computeDistance(cell, pos);

    for (cell of emptyCells) {
        const distance = this.computeDistance(cell, pos);
        if (distance < closestDistance) {
            closest = [cell];
            closestDistance = distance;
        } else if (distance === closestDistance) {
            closest.push(cell);
        }
    }
    return CaveUtils.randomChoice(closest);
};
Room.prototype.getNeighbors = function (pos) {
    const dimX = this.cols, dimY = this.rows, dim = dimX * dimY;
    const topNeighbor = pos => pos < dimX ? null : pos - dimX;
    const bottomNeighbor = pos => pos + dimX < dim ? pos + dimX : null;
    const rightNeighbor = pos => (pos + 1) % dimX ? pos + 1 : null;
    const leftNeighbor = pos => pos % dimX ? pos - 1 : null;

    const allNeighbors = [topNeighbor(pos), bottomNeighbor(pos), rightNeighbor(pos), leftNeighbor(pos)];
    return allNeighbors.filter(n => n != null);
};
Room.prototype.getUnvisitedNeighbors = function (pos) {
    const neighbors = this.getNeighbors(pos);
    return neighbors.filter(p => this.cells[p] === CELL_FULL);
};
Room.prototype.generate = function () {
    const id1 = CaveUtils.randomInt(this.exits.length);
    const id2 = CaveUtils.randomInt(this.exits.length - 1);
    const startPos = this.exits[id1];
    const endPos = (id2 < id1) ? this.exits[id2] : this.exits[id2 + 1];

    // assume it has only one
    const endPosNeighbor = this.getUnvisitedNeighbors(endPos)[0];
    if (typeof endPosNeighbor === 'undefined') {
        console.warn('ERROR generating cave, invalid input');
        return;
    }

    this.carve(startPos, endPosNeighbor);
};
Room.prototype.carve = function (pos, finalPos) {
    while (pos !== finalPos) {
        const neighbors = this.getUnvisitedNeighbors(pos);
        if (neighbors.length > 0) {
            pos = CaveUtils.randomChoice(neighbors);
            this.cells[pos] = CELL_EMPTY;
        } else {
            // continue from the closest
            pos = this.getClosestEmptyCell(finalPos);
        }
    }
};
Room.prototype.computeDistance = function (pos1, pos2) {
    var x1 = Math.floor(pos1 % this.cols);
    var y1 = Math.floor(pos1 / this.cols);
    var x2 = Math.floor(pos2 % this.cols);
    var y2 = Math.floor(pos2 / this.cols);
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};

const CaveUtils = {
    randomInt: function (max) {
        return Math.floor(Math.random() * max);
    },
    randomChoice: function (values) {
        return values[Math.floor(Math.random() * values.length)];
    },
    randomChoices: function (values, n) {
        // generate n values
        const indexes = {};
        for (let i = 0; i < n; i++) {
            let choice = this.randomInt(values.length);
            while (indexes.hasOwnProperty(choice)) {
                choice = (choice + 1) % values.length;
            }
            indexes[choice] = true;
        }
        return Object.keys(indexes);
    }
};

// function prettyPrint(room) {
//     let roomString = '';
//     for (let i = 0; i < room.rows; i++) {
//         roomString += room.cells.slice(room.cols * i, room.cols * (i + 1)).join('') + '\n';
//     }
//     console.log(roomString);
// }
