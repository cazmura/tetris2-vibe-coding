const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 700,
    backgroundColor: '#ffffff',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let tetromino;
let score = 0;
let gameOver = false;
let fallTime = 0;
let fallInterval = 1000; // 1秒ごとに落下
let grid = [];
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

function preload() {
    // テトリミノの画像をロード
    this.load.image('block', 'path/to/block.png'); // ブロックの画像を指定
}

function create() {
    // スコア表示
    this.add.text(20, 20, 'Score: 0', { fontSize: '25px', fill: '#000' });

    // グリッドの初期化
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            grid[y][x] = 0;
        }
    }

    // テトリミノの初期化
    tetromino = this.add.group();
    createTetromino(this);
}

function update(time, delta) {
    if (gameOver) return;

    // キーボード入力の処理
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
        if (canMove(-1, 0)) {
            moveTetromino(-1);
        }
    } else if (cursors.right.isDown) {
        if (canMove(1, 0)) {
            moveTetromino(1);
        }
    }
    if (cursors.down.isDown) {
        if (canMove(0, 1)) {
            moveTetrominoDown();
        } else {
            lockTetromino();
            createTetromino(this);
        }
    }
    if (cursors.up.isDown) {
        rotateTetromino();
    }

    // 自動落下
    fallTime += delta;
    if (fallTime >= fallInterval) {
        fallTime = 0;
        if (canMove(0, 1)) {
            moveTetrominoDown();
        } else {
            lockTetromino();
            createTetromino(this);
        }
    }
}

function createTetromino(scene) {
    // テトリミノの形状を定義
    const shapes = [
        [[1, 1, 1, 1]], // I
        [[1, 1, 1], [0, 1, 0]], // T
        [[1, 1, 1], [1, 0, 0]], // L
        [[1, 1, 1], [0, 0, 1]], // J
        [[1, 1], [1, 1]], // O
        [[1, 1, 0], [0, 1, 1]], // S
        [[0, 1, 1], [1, 1, 0]]  // Z
    ];

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    tetromino.clear(true, true);
    
    // テトリミノの初期位置を画面上部中央に設定
    const startX = Math.floor(GRID_WIDTH / 2) - Math.floor(shape[0].length / 2);
    const startY = 0;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const block = scene.add.image(
                    (startX + x) * BLOCK_SIZE,
                    (startY + y) * BLOCK_SIZE,
                    'block'
                );
                tetromino.add(block);
            }
        }
    }
}

function canMove(dx, dy) {
    return tetromino.getChildren().every(block => {
        const newX = block.x + dx * BLOCK_SIZE;
        const newY = block.y + dy * BLOCK_SIZE;
        
        // 画面の境界チェック
        if (newX < 0 || newX >= GRID_WIDTH * BLOCK_SIZE || newY >= GRID_HEIGHT * BLOCK_SIZE) {
            return false;
        }
        
        // グリッド上の衝突チェック
        const gridX = Math.floor(newX / BLOCK_SIZE);
        const gridY = Math.floor(newY / BLOCK_SIZE);
        
        if (gridY >= 0 && grid[gridY][gridX]) {
            return false;
        }
        
        return true;
    });
}

function moveTetromino(dx) {
    tetromino.getChildren().forEach(block => {
        block.x += dx * BLOCK_SIZE;
    });
}

function moveTetrominoDown() {
    tetromino.getChildren().forEach(block => {
        block.y += BLOCK_SIZE;
    });
}

function lockTetromino() {
    tetromino.getChildren().forEach(block => {
        const gridX = Math.floor(block.x / BLOCK_SIZE);
        const gridY = Math.floor(block.y / BLOCK_SIZE);
        
        if (gridY >= 0) {
            grid[gridY][gridX] = 1;
        }
    });
    
    // ラインの消去チェック
    checkLines();
}

function checkLines() {
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 1)) {
            // ラインを消去
            grid.splice(y, 1);
            grid.unshift(new Array(GRID_WIDTH).fill(0));
            
            // スコア加算
            score += 100;
            this.add.text(20, 20, `Score: ${score}`, { fontSize: '25px', fill: '#000' });
        }
    }
}

function rotateTetromino() {
    // テトリミノの回転ロジックを実装
}