const DEFAULT_COLS = 20;
const DEFAULT_ROWS = 16;
const DEFAULT_EXITS = [4, (DEFAULT_ROWS - 3) * DEFAULT_COLS - 1];

const SQUARE_SIZE = 2;

let canvas, ctx;
let colsInput, rowsInput, genBtn;
let cave;
initVisualizer();
initCave();

function initVisualizer() {
    canvas = document.getElementById('cave_canvas');
    ctx = canvas.getContext('2d');
    colsInput = document.getElementById('cave_cols_input');
    rowsInput = document.getElementById('cave_rows_input');
    genBtn = document.getElementById('generate_cave_btn');
    genBtn.addEventListener('click', function () {
        const a = performance.now();
        initCave();
        const b = performance.now();
        initCanvas(cave);
        const c = performance.now();
        cave.generate();
        const d = performance.now();
        prettyDisplay(cave);
        const e = performance.now();
        console.log('initcave', b-a);
        console.log('initcanvas', c-b);
        console.log('carve', d-c);
        console.log('display', e-d);
    }, false);
}

function initCanvas(cave) {
    canvas.width = cave.cols * SQUARE_SIZE;
    canvas.height = cave.rows * SQUARE_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initCave(opts) {
    const cols = Number(colsInput.value);
    const rows = Number(rowsInput.value);
    cave = new Room({cols: cols, rows: rows}, false);
}

function prettyDisplay(cave) {
    function setColor(cellState) {
        if (cellState === CELL_WALL) {
            ctx.fillStyle = 'black';
        } else if (cellState === CELL_FULL) {
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = 'white';
        }
    }

    const cells = cave.cells;
    const rows = cave.rows;
    const cols = cave.cols;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const pos = r * cols + c;
            setColor(cells[pos]);
            ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}
