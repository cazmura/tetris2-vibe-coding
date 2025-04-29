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

function preload() {
    // テトリミノの画像をロード
    this.load.image('block', 'path/to/block.png'); // ブロックの画像を指定
}

function create() {
    // スコア表示
    this.add.text(20, 20, 'Score: 0', { fontSize: '25px', fill: '#000' });

    // テトリミノの初期化
    tetromino = this.add.group();
    createTetromino(this);
}

function update() {
    if (gameOver) return;

    // キーボード入力の処理
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
        moveTetromino(-1);
    } else if (cursors.right.isDown) {
        moveTetromino(1);
    }
    if (cursors.down.isDown) {
        moveTetrominoDown();
    }
    if (cursors.up.isDown) {
        rotateTetromino();
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
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const block = scene.add.image(x * 30 + 300, y * 30, 'block');
                tetromino.add(block);
            }
        }
    }
}

function moveTetromino(dx) {
    tetromino.getChildren().forEach(block => {
        block.x += dx * 30;
    });
}

function moveTetrominoDown() {
    tetromino.getChildren().forEach(block => {
        block.y += 30;
    });
}

function rotateTetromino() {
    // テトリミノの回転ロジックを実装
}