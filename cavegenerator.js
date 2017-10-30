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
    // reset the state of the cells as FULL with WALL on the outside
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

    // generate 2 exits if none exists or if the reset is forced
    if (this.exits.length === 0 || resetExits === true) {
        this.generateExits();
    }
};
Room.prototype.generateExits = function (n = 2) {
    // generate n exits from cells that are WALLS and that have at least a FULL neighbor (to start the carving)
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
    // get a generator of empty cells (excluding exits)
    const cells = this.cells, len = cells.length, exits = this.exits;
    for (let i = 0; i < len; i++) {
        if (cells[i] === CELL_EMPTY && exits.indexOf(i) === -1) {
            yield i;
        }
    }
};
Room.prototype.emptyCellWithNeighborsGenerator = function* () {
    // get a generator of empty cells with at least 1 unvisited neighbor
    const emptyCells = this.emptyCellGenerator();
    for (const pos of emptyCells) {
        if (this.getUnvisitedNeighbors(pos).length > 0) {
            yield pos;
        }
    }
};
Room.prototype.getClosestEmptyCell = function (pos) {
    // get the closest empty cell with unvisited neighbor
    const emptyCells = this.emptyCellWithNeighborsGenerator();
    const closest = new MinimumValue();

    for (const cell of emptyCells) {
        closest.update(cell, this.computeDistance(cell, pos));
    }
    if (closest.elements.length === 0) {
        console.warn('ERROR in closest empty cell');
        return;
    }

    return CaveUtils.randomChoice(closest.elements);
};
Room.prototype.topNeighbor = function (pos) {
    const n = pos - this.cols;
    return n >= 0 ? n : null;
};
Room.prototype.bottomNeighbor = function (pos) {
    const n = pos + this.cols;
    return n < this.cells.length ? n : null;
};
Room.prototype.rightNeighbor = function (pos) {
    return (pos + 1) % this.cols ? pos + 1 : null;
};
Room.prototype.leftNeighbor = function (pos) {
    return pos % this.cols ? pos - 1 : null;
};
Room.prototype.getNeighbors = function (pos) {
    // return all valid neighbors of the current cell
    const allNeighbors = [];
    let neighbor;
    if (neighbor = this.topNeighbor(pos)) {
        allNeighbors.push(neighbor);
    }
    if (neighbor = this.bottomNeighbor(pos)) {
        allNeighbors.push(neighbor);
    }
    if (neighbor = this.rightNeighbor(pos)) {
        allNeighbors.push(neighbor);
    }
    if (neighbor = this.leftNeighbor(pos)) {
        allNeighbors.push(neighbor);
    }
    return allNeighbors;
};
Room.prototype.getUnvisitedNeighbors = function (pos) {
    // return all unvisited neighbors of the current cell (unvisited = not WALL nor EMPTY)
    const neighbors = this.getNeighbors(pos);
    return neighbors.filter(p => this.cells[p] === CELL_FULL);
};
Room.prototype.generate = function () {
    // randomly choose the exits (scales if more)
    const [id1, id2] = CaveUtils.randomChoices(this.exits, 2);
    const startPos = this.exits[id1];
    const endPos = this.exits[id2];

    const endPosNeighbor = this.getUnvisitedNeighbors(endPos)[0];
    if (typeof endPosNeighbor === 'undefined') {
        console.warn('ERROR generating cave, invalid input');
        return;
    }

    this.carve(startPos, endPosNeighbor);
};
Room.prototype.carve = function (pos, finalPos) {
    // start carving until the final position is reached
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
    // compute the euclidean distance between 2 cells
    const cols = this.cols;
    const y1 = Math.floor(pos1 / cols);
    const x1 = pos1 - y1 * cols;
    const y2 = Math.floor(pos2 / cols);
    const x2 = pos2 - y2 * cols;
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};

const CaveUtils = {
    randomInt: function (max) {
        return Math.floor(Math.random() * max);
    },
    randomChoice: function (values) {
        return values[this.randomInt(values.length)];
    },
    randomChoices: function (values, n) {
        // generate n values
        const indexes = [];
        for (let i = 0; i < n; i++) {
            let choice = this.randomInt(values.length);
            while (indexes.indexOf(choice) !== -1) {
                choice = (choice + 1) % values.length;
            }
            indexes.push(choice);
        }
        return indexes;
    }
};

const MinimumValue = function () {
    this.elements = [];
    this.value = Infinity;
};
MinimumValue.prototype.update = function (element, value) {
    if (value > this.value) {
        return;
    }
    if (value < this.value) {
        this.value = value;
        this.elements.length = 0;
    }
    this.elements.push(element);
};

// function prettyPrint(room) {
//     let roomString = '';
//     for (let i = 0; i < room.rows; i++) {
//         roomString += room.cells.slice(room.cols * i, room.cols * (i + 1)).join('') + '\n';
//     }
//     console.log(roomString);
// }
