const CELL_WALL = 'X';
const CELL_FULL = '#';
const CELL_EMPTY = ' ';

const Room = function (opts) {
    this.cols = opts.cols;
    this.rows = opts.rows;
    this.exits = opts.exits;
    this.reset();
};
Room.prototype.constructor = Room;
Room.prototype.reset = function () {
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
    // empty the exits (where the code will start from)
    this.exits.forEach(exit => {
        cells[exit] = CELL_EMPTY;
    });
    this.cells = cells;
};
Room.prototype.generateExits = function (n = 2) {
    // generate side
    // generate number
    // add to exits
    this.reset();
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
    }
};


const DEFAULT_COLS = 20;
const DEFAULT_ROWS = 16;
const DEFAULT_EXITS = [4, (DEFAULT_ROWS - 3) * DEFAULT_COLS - 1];
const room = new Room({
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
    exits: DEFAULT_EXITS
});

room.generate();
prettyPrint(room);

function prettyPrint(room) {
    let roomString = '';
    for (let i = 0; i < room.rows; i++) {
        roomString += room.cells.slice(room.cols * i, room.cols * (i + 1)).join('') + '\n';
    }
    console.log(roomString);
}

function prettyDisplay(room) {
    // TODO
};