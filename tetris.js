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
let scoreText;
let landedBlocks;
let gameArea;
let currentShape;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;
const GRID_OFFSET_X = 150; // グリッドのX座標オフセット
const GRID_OFFSET_Y = 50;  // グリッドのY座標オフセット

function preload() {
    // テトリミノの画像をロード
    this.load.image('block', 'path/to/block.png'); // ブロックの画像を指定
}

function create() {
    // ゲームエリアの背景を描画
    gameArea = this.add.rectangle(
        GRID_OFFSET_X + (GRID_WIDTH * BLOCK_SIZE) / 2,
        GRID_OFFSET_Y + (GRID_HEIGHT * BLOCK_SIZE) / 2,
        GRID_WIDTH * BLOCK_SIZE,
        GRID_HEIGHT * BLOCK_SIZE,
        0xffffff
    );
    gameArea.setStrokeStyle(2, 0x000000);

    // スコア表示
    scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '25px', fill: '#000' });

    // 着地したブロックのグループ
    landedBlocks = this.add.group();

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
            lockTetromino(this);
            if (!createTetromino(this)) {
                gameOver = true;
                showGameOver(this);
            }
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
            lockTetromino(this);
            if (!createTetromino(this)) {
                gameOver = true;
                showGameOver(this);
            }
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

    currentShape = shapes[Math.floor(Math.random() * shapes.length)];
    tetromino.clear(true, true);
    
    // テトリミノの初期位置を画面上部中央に設定
    const startX = Math.floor(GRID_WIDTH / 2) - Math.floor(currentShape[0].length / 2);
    const startY = 0;
    
    // 初期位置で衝突チェック
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                const gridX = startX + x;
                const gridY = startY + y;
                if (gridY >= 0 && grid[gridY][gridX]) {
                    return false; // ゲームオーバー
                }
            }
        }
    }
    
    for (let y = 0; y < currentShape.length; y++) {
        for (let x = 0; x < currentShape[y].length; x++) {
            if (currentShape[y][x]) {
                const block = scene.add.image(
                    GRID_OFFSET_X + (startX + x) * BLOCK_SIZE,
                    GRID_OFFSET_Y + (startY + y) * BLOCK_SIZE,
                    'block'
                );
                tetromino.add(block);
            }
        }
    }
    return true;
}

function canMove(dx, dy) {
    return tetromino.getChildren().every(block => {
        const newX = block.x + dx * BLOCK_SIZE;
        const newY = block.y + dy * BLOCK_SIZE;
        
        // 画面の境界チェック
        if (newX < GRID_OFFSET_X || 
            newX >= GRID_OFFSET_X + GRID_WIDTH * BLOCK_SIZE || 
            newY >= GRID_OFFSET_Y + GRID_HEIGHT * BLOCK_SIZE) {
            return false;
        }
        
        // グリッド上の衝突チェック
        const gridX = Math.floor((newX - GRID_OFFSET_X) / BLOCK_SIZE);
        const gridY = Math.floor((newY - GRID_OFFSET_Y) / BLOCK_SIZE);
        
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

function lockTetromino(scene) {
    tetromino.getChildren().forEach(block => {
        const gridX = Math.floor((block.x - GRID_OFFSET_X) / BLOCK_SIZE);
        const gridY = Math.floor((block.y - GRID_OFFSET_Y) / BLOCK_SIZE);
        
        if (gridY >= 0) {
            grid[gridY][gridX] = 1;
            // 着地したブロックを表示
            const landedBlock = scene.add.image(block.x, block.y, 'block');
            landedBlocks.add(landedBlock);
        }
    });
    
    // ラインの消去チェック
    checkLines(scene);
}

function checkLines(scene) {
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell === 1)) {
            // ラインを消去
            grid.splice(y, 1);
            grid.unshift(new Array(GRID_WIDTH).fill(0));
            
            // スコア加算
            score += 100;
            scoreText.setText(`Score: ${score}`);
            
            // 着地したブロックを更新
            updateLandedBlocks();
        }
    }
}

function updateLandedBlocks() {
    landedBlocks.clear(true, true);
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x]) {
                const block = game.scene.scenes[0].add.image(
                    GRID_OFFSET_X + x * BLOCK_SIZE,
                    GRID_OFFSET_Y + y * BLOCK_SIZE,
                    'block'
                );
                landedBlocks.add(block);
            }
        }
    }
}

function showGameOver(scene) {
    const gameOverText = scene.add.text(
        config.width / 2,
        config.height / 2,
        'GAME OVER',
        { fontSize: '48px', fill: '#ff0000' }
    ).setOrigin(0.5);
    
    const restartText = scene.add.text(
        config.width / 2,
        config.height / 2 + 60,
        'Press ENTER to restart',
        { fontSize: '24px', fill: '#000' }
    ).setOrigin(0.5);
    
    // エンターキーでリスタート
    scene.input.keyboard.on('keydown-ENTER', () => {
        gameOver = false;
        score = 0;
        scoreText.setText('Score: 0');
        grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
        landedBlocks.clear(true, true);
        tetromino.clear(true, true);
        gameOverText.destroy();
        restartText.destroy();
        createTetromino(scene);
    });
}

function rotateTetromino() {
    if (!currentShape) return;
    
    // 現在の形状を回転
    const rotatedShape = [];
    for (let i = 0; i < currentShape[0].length; i++) {
        rotatedShape[i] = [];
        for (let j = currentShape.length - 1; j >= 0; j--) {
            rotatedShape[i].push(currentShape[j][i]);
        }
    }
    
    // 回転後の位置が有効かチェック
    const blocks = tetromino.getChildren();
    const centerX = blocks[0].x;
    const centerY = blocks[0].y;
    
    let canRotate = true;
    for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
            if (rotatedShape[y][x]) {
                const newX = centerX + (x - Math.floor(rotatedShape[y].length / 2)) * BLOCK_SIZE;
                const newY = centerY + (y - Math.floor(rotatedShape.length / 2)) * BLOCK_SIZE;
                
                const gridX = Math.floor((newX - GRID_OFFSET_X) / BLOCK_SIZE);
                const gridY = Math.floor((newY - GRID_OFFSET_Y) / BLOCK_SIZE);
                
                if (gridX < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT || 
                    (gridY >= 0 && grid[gridY][gridX])) {
                    canRotate = false;
                    break;
                }
            }
        }
        if (!canRotate) break;
    }
    
    if (canRotate) {
        currentShape = rotatedShape;
        tetromino.clear(true, true);
        
        for (let y = 0; y < rotatedShape.length; y++) {
            for (let x = 0; x < rotatedShape[y].length; x++) {
                if (rotatedShape[y][x]) {
                    const block = game.scene.scenes[0].add.image(
                        centerX + (x - Math.floor(rotatedShape[y].length / 2)) * BLOCK_SIZE,
                        centerY + (y - Math.floor(rotatedShape.length / 2)) * BLOCK_SIZE,
                        'block'
                    );
                    tetromino.add(block);
                }
            }
        }
    }
}