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
        const neighbors = this.getNeighbors(pos);
        if (neighbors.length > 0) {
            yield pos;
        }
    }
};
Room.prototype.getClosestEmptyCell = function (pos) {
    const emptyCells = this.emptyCellWithNeighborsGenerator();
    let p = emptyCells.next().value;
    let closest = p;
    let closestDistance = this.computeDistance(p, pos);

    for (p of emptyCells) {
        const distance = this.computeDistance(p, pos);
        if (distance < closestDistance) {
            closest = p;
        }
    }
    return closest;
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

    // TODO: randomize this choice
    const entrance = this.exits[0];
    const exit = this.exits[1];
    this.carve(entrance, exit);
};
Room.prototype.carve = function (pos, finalPos) {
    // preprocess
    // finalPos = this.getUnvisitedNeighbors(finalPos)[0]; // should have only 1
    // this.cells[finalPos] = CELL_EMPTY;
    // pos = this.getUnvisitedNeighbors(pos)[0]; // should have only 1
    // this.cells[pos] = CELL_EMPTY;

    finalPos = finalPos - 1;
    while (pos !== finalPos) {
        const neighbors = this.getUnvisitedNeighbors(pos);
        if (neighbors.length > 0) {
            pos = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.cells[pos] = CELL_EMPTY;
        } else {
            // continue from the closest
            pos = this.getClosestEmptyCell(finalPos);
            console.log(pos);
        }
    }
    // get 
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