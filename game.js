const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const message = document.getElementById('message');
const scoreDisplay = document.getElementById('score');

// Set canvas dimensions
canvas.width = 400;
canvas.height = 600;

// Game variables
let score = 0;
let highScore = 0;
let gameStarted = false;
let gameOver = false;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 24,
    gravity: 0.02,  // Reduced gravity by 70%
    velocity: 0,
    jump: -2    // Adjusted jump strength to match new gravity
};

// Pipe properties
const pipeWidth = 50;
const pipeGap = 150;
let pipes = [];
const pipeSpeed = 1;  // Reduced speed by 50%

// Colors
const birdColor = '#FFD700';
const pipeColor = '#2ecc71';

function drawBird() {
    ctx.fillStyle = birdColor;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: height,
        passed: false
    });

    pipes.push({
        x: canvas.width,
        y: height + pipeGap,
        width: pipeWidth,
        height: canvas.height - height - pipeGap,
        passed: false
    });
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    // Remove pipes that are off screen
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    // Create new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        createPipe();
    }
}

function checkCollision() {
    return pipes.some(pipe => {
        return !(bird.x + bird.width < pipe.x ||
                bird.x > pipe.x + pipe.width ||
                bird.y + bird.height < pipe.y ||
                bird.y > pipe.y + pipe.height);
    });
}

function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score += 0.5; // Increment by 0.5 because we have two pipes for each gap
            scoreDisplay.textContent = Math.floor(score);
        }
    });
}

function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawBird();
        message.style.display = 'block';
        message.textContent = 'Press Space to Start';
        requestAnimationFrame(gameLoop);
        return;
    }

    // Update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Update and draw pipes
    updatePipes();
    drawPipes();
    
    // Draw bird
    drawBird();

    // Check for collisions with pipes or canvas bounds
    if (checkCollision() || bird.y < 0 || bird.y + bird.height > canvas.height) {
        gameOver = true;
        // Update high score if current score is higher
        if (score > highScore) {
            highScore = score;
        }
        message.style.display = 'block';
        message.textContent = `Game Over!\nScore: ${Math.floor(score)}\nHigh Score: ${Math.floor(highScore)}\n\nPress Space to Restart`;
        return;
    }

    // Update score
    updateScore();

    requestAnimationFrame(gameLoop);
}

// Handle user input
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            gameStarted = true;
            message.style.display = 'none';
            gameLoop();
        } else if (gameOver) {
            // Reset game but keep high score
            gameOver = false;
            gameStarted = false;
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            pipes = [];
            score = 0;
            scoreDisplay.textContent = '0';
            gameLoop();
        } else {
            bird.velocity = bird.jump;
        }
    }
});

// Start the game loop
gameLoop();