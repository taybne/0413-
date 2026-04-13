window.BlockBustGame = {
  initialized: false,
  canvas: null,
  ctx: null,
  statusText: null,
  animationId: null,
  running: false,
  rightPressed: false,
  leftPressed: false,
  ballRadius: 8,
  paddleHeight: 12,
  paddleWidth: 80,
  paddleX: 0,
  x: 0,
  y: 0,
  dx: 4,
  dy: -4,
  score: 0,
  lives: 3,
  brickRowCount: 4,
  brickColumnCount: 7,
  brickPadding: 6,
  brickOffsetTop: 30,
  brickOffsetLeft: 16,
  bricks: [],

  init() {
    if (this.initialized) {
      return;
    }

    this.canvas = document.getElementById('blockBustCanvas');
    this.statusText = document.getElementById('blockBustStatus');
    if (!this.canvas || !this.statusText) {
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.buildBricks();
    this.resizeCanvas();
    this.resetBallAndPaddle();
    this.updateStatus('Press Space to start');
    this.attachInputHandlers();

    const resetButton = document.getElementById('resetGameBtn');
    if (resetButton) {
      resetButton.onclick = () => this.reset();
    }

    window.addEventListener('resize', () => this.resizeCanvas());
    this.initialized = true;
  },

  attachInputHandlers() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowRight') {
        this.rightPressed = true;
      }
      if (e.code === 'ArrowLeft') {
        this.leftPressed = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (!this.running) {
          this.start();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowRight') {
        this.rightPressed = false;
      }
      if (e.code === 'ArrowLeft') {
        this.leftPressed = false;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < this.canvas.width) {
        this.paddleX = relativeX - this.paddleWidth / 2;
      }
    });
  },

  resizeCanvas() {
    if (!this.canvas) {
      return;
    }
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, Math.floor(rect.width));
    this.canvas.height = Math.max(240, Math.floor(rect.height));
    this.paddleWidth = Math.max(70, Math.floor(this.canvas.width * 0.18));
    this.resetBallAndPaddle(true);
    this.draw();
  },

  buildBricks() {
    this.bricks = [];
    for (let r = 0; r < this.brickRowCount; r += 1) {
      this.bricks[r] = [];
      for (let c = 0; c < this.brickColumnCount; c += 1) {
        this.bricks[r][c] = { x: 0, y: 0, status: 1 };
      }
    }
  },

  resetBallAndPaddle(skipStatus = false) {
    if (!this.canvas) {
      return;
    }
    this.paddleX = (this.canvas.width - this.paddleWidth) / 2;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 30;
    this.dx = 4;
    this.dy = -4;
    this.score = 0;
    this.lives = 3;
    if (!skipStatus) {
      this.updateStatus('Press Space to start');
    }
  },

  updateStatus(text) {
    if (this.statusText) {
      this.statusText.textContent = text;
    }
  },

  drawBall() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffb6d9';
    this.ctx.fill();
    this.ctx.closePath();
  },

  drawPaddle() {
    this.ctx.beginPath();
    this.ctx.rect(this.paddleX, this.canvas.height - this.paddleHeight - 10, this.paddleWidth, this.paddleHeight);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.closePath();
  },

  drawBricks() {
    const brickWidth = Math.floor((this.canvas.width - this.brickOffsetLeft * 2 - this.brickPadding * (this.brickColumnCount - 1)) / this.brickColumnCount);
    const brickHeight = 18;
    for (let r = 0; r < this.brickRowCount; r += 1) {
      for (let c = 0; c < this.brickColumnCount; c += 1) {
        const brick = this.bricks[r][c];
        if (brick.status === 1) {
          const brickX = c * (brickWidth + this.brickPadding) + this.brickOffsetLeft;
          const brickY = r * (brickHeight + this.brickPadding) + this.brickOffsetTop;
          brick.x = brickX;
          brick.y = brickY;
          this.ctx.beginPath();
          this.ctx.rect(brickX, brickY, brickWidth, brickHeight);
          this.ctx.fillStyle = '#8b5cf6';
          this.ctx.fill();
          this.ctx.lineWidth = 2;
          this.ctx.strokeStyle = '#4f46e5';
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
    }
  },

  collisionDetection() {
    const brickWidth = Math.floor((this.canvas.width - this.brickOffsetLeft * 2 - this.brickPadding * (this.brickColumnCount - 1)) / this.brickColumnCount);
    const brickHeight = 18;
    for (let r = 0; r < this.brickRowCount; r += 1) {
      for (let c = 0; c < this.brickColumnCount; c += 1) {
        const brick = this.bricks[r][c];
        if (brick.status === 1) {
          if (
            this.x > brick.x &&
            this.x < brick.x + brickWidth &&
            this.y > brick.y &&
            this.y < brick.y + brickHeight
          ) {
            this.dy = -this.dy;
            brick.status = 0;
            this.score += 10;
            if (this.score === this.brickRowCount * this.brickColumnCount * 10) {
              this.updateStatus('You win! Press Restart to play again.');
              this.pause();
            }
          }
        }
      }
    }
  },

  drawScore() {
    this.ctx.font = '14px sans-serif';
    this.ctx.fillStyle = '#ddd';
    this.ctx.fillText(`Score: ${this.score}`, 16, this.canvas.height - 18);
    this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 80, this.canvas.height - 18);
  },

  draw() {
    if (!this.ctx) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBricks();
    this.drawBall();
    this.drawPaddle();
    this.drawScore();
  },

  update() {
    if (this.rightPressed) {
      this.paddleX += 7;
      if (this.paddleX + this.paddleWidth > this.canvas.width) {
        this.paddleX = this.canvas.width - this.paddleWidth;
      }
    }
    if (this.leftPressed) {
      this.paddleX -= 7;
      if (this.paddleX < 0) {
        this.paddleX = 0;
      }
    }

    this.x += this.dx;
    this.y += this.dy;

    if (this.x + this.dx > this.canvas.width - this.ballRadius || this.x + this.dx < this.ballRadius) {
      this.dx = -this.dx;
    }
    if (this.y + this.dy < this.ballRadius) {
      this.dy = -this.dy;
    } else if (this.y + this.dy > this.canvas.height - this.ballRadius - this.paddleHeight - 10) {
      if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
        this.dy = -this.dy;
      } else if (this.y + this.dy > this.canvas.height - this.ballRadius) {
        this.lives -= 1;
        if (this.lives <= 0) {
          this.updateStatus('Game over. Press Restart to try again.');
          this.pause();
          return;
        }
        this.resetBallAndPaddle(true);
      }
    }

    this.collisionDetection();
  },

  loop() {
    if (!this.running) {
      return;
    }
    this.draw();
    this.update();
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  start() {
    if (!this.initialized) {
      this.init();
    }
    if (!this.running) {
      this.running = true;
      this.updateStatus('Block Bust running. Use arrows or mouse to move.');
      this.loop();
    }
  },

  pause() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  reset() {
    this.pause();
    this.buildBricks();
    this.resizeCanvas();
    this.resetBallAndPaddle();
    this.draw();
  },
};
