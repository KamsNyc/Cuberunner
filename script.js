window.addEventListener("load", () => {
    const canvas = document.getElementById("gameCanvas");
    const context = canvas.getContext("2d");
  
    // Game configurations
    const GAME_WIDTH = 480;
    const GAME_HEIGHT = 640;
    const PLAYER_SIZE = 20;
    const BLOCK_SIZE = 10;
    const BLOCK_SPEED = 2;
    const BLOCK_SPAWN_INTERVAL = 200;
    let PLAYER_SPEED = 5;
    const PLAYER_SPEEDUP_INTERVAL = 150000; // 2 minutes 30 seconds
    const PLAYER_SPEEDUP_AMOUNT = 2;
    const MAX_HEALTH = 3;
    const LEVEL_UP_SCORE = 50;
    const LEVEL_COLORS = [
      "#ff0000", "#ff8000", "#ffff00", "#80ff00", "#00ff00",
      "#00ff80", "#00ffff", "#0080ff", "#0000ff", "#8000ff",
      "#ff00ff", "#ff0080"
    ];
  
    // Game variables
    let playerX = GAME_WIDTH / 2;
    let playerY = GAME_HEIGHT - PLAYER_SIZE - 10;
    let playerHealth = MAX_HEALTH;
    let score = 0;
    let level = 1;
    let isGameOver = false;
    let blocks = [];
    let blockSpawnTimer = 0;
    let levelTimer = 0;
    let currentLevelColor = LEVEL_COLORS[0];
    let playerSpeedupTimer = 0;
  
    // Player input
    let leftPressed = false;
    let rightPressed = false;
  
    // Load sound
    const blockHitSound = new Audio("block_hit.wav");
    const gameOverSound = new Audio("game_over.wav");
  
    // Event listeners for player input
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
  
    function handleKeyDown(event) {
      if (event.key === "ArrowLeft") {
        leftPressed = true;
      } else if (event.key === "ArrowRight") {
        rightPressed = true;
      }
    }
  
    function handleKeyUp(event) {
      if (event.key === "ArrowLeft") {
        leftPressed = false;
      } else if (event.key === "ArrowRight") {
        rightPressed = false;
      }
    }
  
    // Block class
    class Block {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
      }
  
      update() {
        this.y += BLOCK_SPEED;
      }
  
      draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  
    // Player class
    class Player {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
  
      update() {
        if (leftPressed && this.x > PLAYER_SIZE / 2) {
          this.x -= PLAYER_SPEED;
        } else if (rightPressed && this.x < GAME_WIDTH - PLAYER_SIZE / 2) {
          this.x += PLAYER_SPEED;
        }
  
        // Increase player speed
        playerSpeedupTimer++;
        if (playerSpeedupTimer >= PLAYER_SPEEDUP_INTERVAL) {
          playerSpeedupTimer = 0;
          PLAYER_SPEED += PLAYER_SPEEDUP_AMOUNT;
          showNotification("Player speed increased!");
        }
      }
  
      draw() {
        context.fillStyle = "#0f0";
        context.beginPath();
        context.moveTo(this.x, this.y - PLAYER_SIZE / 2);
        context.lineTo(this.x + PLAYER_SIZE / 2, this.y + PLAYER_SIZE / 2);
        context.lineTo(this.x - PLAYER_SIZE / 2, this.y + PLAYER_SIZE / 2);
        context.closePath();
        context.fill();
      }
  
      collidesWith(block) {
        return (
          this.x - PLAYER_SIZE / 2 < block.x + BLOCK_SIZE &&
          this.x + PLAYER_SIZE / 2 > block.x &&
          this.y - PLAYER_SIZE / 2 < block.y + BLOCK_SIZE &&
          this.y + PLAYER_SIZE / 2 > block.y
        );
      }
    }
  
    // Game loop
    function gameLoop() {
      if (isGameOver) {
        return;
      }
  
      context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  
      // Spawn blocks
      blockSpawnTimer += 1;
      if (blockSpawnTimer >= BLOCK_SPAWN_INTERVAL) {
        const blockX = Math.random() * (GAME_WIDTH - BLOCK_SIZE);
        const blockColor = LEVEL_COLORS[Math.floor(Math.random() * LEVEL_COLORS.length)];
        blocks.push(new Block(blockX, -BLOCK_SIZE, blockColor));
        blockSpawnTimer = 0;
      }
  
      // Update and draw blocks
      blocks.forEach((block, index) => {
        block.update();
        block.draw();
  
        // Check collision with player
        if (player.collidesWith(block)) {
          blockHitSound.play();
          blocks.splice(index, 1);
          playerHealth--;
  
          // Game over
          if (playerHealth === 0) {
            isGameOver = true;
            gameOverSound.play();
          }
        }
  
        // Check block out of bounds
        if (block.y > GAME_HEIGHT) {
          blocks.splice(index, 1);
        }
      });
  
      // Update and draw player
      player.update();
      player.draw();
  
      // Update score and level
      score++;
      if (score % LEVEL_UP_SCORE === 0) {
        level++;
        levelTimer = 0;
        currentLevelColor = LEVEL_COLORS[level - 1];
      }
  
      // Draw health and score
      context.fillStyle = "#fff";
      context.font = "24px Arial";
      context.fillText(`Health: ${playerHealth}`, 10, 30);
      context.fillText(`Score: ${score}`, 10, 60);
      context.fillText(`Level: ${level}`, 10, 90);
  
      // Draw level timer and color
      levelTimer++;
      const levelTimerPercentage = (levelTimer / LEVEL_UP_SCORE) * 100;
      context.fillStyle = "#333";
      context.fillRect(0, 0, (levelTimerPercentage * GAME_WIDTH) / 100, 10);
      context.fillStyle = currentLevelColor;
      context.fillRect(0, 0, (levelTimerPercentage * GAME_WIDTH) / 100, 10);
  
      requestAnimationFrame(gameLoop);
    }
  
    // Set canvas size
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
  
    // Initialize game
    const player = new Player(playerX, playerY);
    gameLoop();
  });
  